'use strict';
// Machine-checkable half of onboarding: validation, stack detection, contract and
// dependency candidates, and the mechanical apply. Judgement stays in ONBOARDING.md.
// Read-only except in apply()/offboard(). Never reads .env *values*, only variable names.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const { P } = L;

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', '.vercel', 'coverage', '.cache', 'out', 'vendor', '__pycache__', '.venv', 'tmp', 'temp']);
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go)$/;
const MAX_FILES = 4000, MAX_BYTES = 200_000;
const EXCLUDES = ['.serena/', 'CLAUDE.local.md'];

/* ---------- small helpers ---------- */
const json = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
function walk(dir, out = [], depth = 0) {
  if (depth > 8 || out.length > MAX_FILES) return out;
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    if (SKIP.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out, depth + 1);
    else if (CODE.test(e.name) || /^\.env/.test(e.name)) out.push(f);
    if (out.length > MAX_FILES) break;
  }
  return out;
}
const slurp = f => { try { return fs.readFileSync(f, 'utf8').slice(0, MAX_BYTES); } catch { return ''; } };

/* ---------- detection ---------- */
function detect(name) {
  const abs = path.join(P.root, name);
  const pkg = json(path.join(abs, 'package.json'));
  const reg = L.regGet(name);

  const valid = {
    'direct subfolder of the platform root': fs.existsSync(abs) && path.dirname(L.real(abs)) === P.root,
    'contains .git': fs.existsSync(path.join(abs, '.git')),
    'not a hidden folder': !name.startsWith('.'),
    'not already onboarded': !(reg && reg.status === 'active'),
    'name is usable': /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name),
  };

  const branch = L.sh('git', ['branch', '--show-current'], abs);
  const remote = L.sh('git', ['remote', 'get-url', 'origin'], abs);
  const dirty = L.sh('git', ['status', '--porcelain'], abs);
  const git = {
    branch: branch.ok ? branch.out : '(unknown)',
    remote: remote.ok && remote.out ? remote.out : 'none',
    dirtyCount: dirty.ok && dirty.out ? dirty.out.split('\n').length : 0,
    dirtyFiles: dirty.ok && dirty.out ? dirty.out.split('\n').slice(0, 10) : [],
  };

  const files = walk(abs);
  const stack = detectStack(abs, pkg, files);
  const claude = {
    'CLAUDE.md': fs.existsSync(path.join(abs, 'CLAUDE.md')),
    'CLAUDE.local.md': fs.existsSync(path.join(abs, 'CLAUDE.local.md')),
    '.claude/': fs.existsSync(path.join(abs, '.claude')),
    '.serena/': fs.existsSync(path.join(abs, '.serena')),
  };
  const contracts = detectContracts(abs, files);
  const depends_on = detectDeps(name, abs, pkg, files);

  return { name, abs, relPath: name, valid, git, stack, claude, contracts, depends_on, files: files.length, excludes: missingExcludes(abs) };
}

function detectStack(abs, pkg, files) {
  const has = f => fs.existsSync(path.join(abs, f));
  const lock = ['pnpm-lock.yaml', 'bun.lock', 'bun.lockb', 'yarn.lock', 'package-lock.json'].find(has);
  const manager = { 'pnpm-lock.yaml': 'pnpm', 'bun.lock': 'bun', 'bun.lockb': 'bun', 'yarn.lock': 'yarn', 'package-lock.json': 'npm' }[lock]
    || (has('requirements.txt') || has('pyproject.toml') ? 'pip' : 'unknown');
  const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
  const KNOWN = { next: 'Next.js', express: 'Express', fastify: 'Fastify', '@nestjs/core': 'NestJS', react: 'React', vue: 'Vue', vite: 'Vite', turbo: 'Turborepo', '@reduxjs/toolkit': 'Redux Toolkit', '@tanstack/react-query': 'React Query', tailwindcss: 'Tailwind', prisma: 'Prisma', 'drizzle-orm': 'Drizzle', mongoose: 'Mongoose', 'firebase-admin': 'Firebase Admin', firebase: 'Firebase', vitest: 'Vitest', jest: 'Jest' };
  const frameworks = Object.keys(KNOWN).filter(k => deps[k]).map(k => KNOWN[k]);
  const scripts = pkg && pkg.scripts ? pkg.scripts : {};
  const pick = re => Object.keys(scripts).filter(k => re.test(k)).slice(0, 4);
  return {
    manager, lockfile: lock || 'none',
    monorepo: has('pnpm-workspace.yaml') || has('turbo.json') || !!(pkg && pkg.workspaces),
    nodePin: [has('.nvmrc') && `.nvmrc ${slurp(path.join(abs, '.nvmrc')).trim()}`,
      pkg && pkg.engines && pkg.engines.node && `engines.node ${pkg.engines.node}`,
      pkg && pkg.packageManager && `packageManager ${pkg.packageManager}`].filter(Boolean),
    typescript: has('tsconfig.json') || !!deps.typescript || hasNestedTsconfig(abs),
    frameworks,
    scripts: { test: pick(/^test/), lint: pick(/^lint/), build: pick(/^build/), typecheck: pick(/^typecheck|^tsc/), dev: pick(/^dev|^start/) },
    pkgName: pkg ? pkg.name : null,
    summary: [manager !== 'unknown' ? manager : null, has('tsconfig.json') || deps.typescript ? 'TypeScript' : null, ...frameworks.slice(0, 3)].filter(Boolean).join(' + ') || 'unknown',
  };
}

// Candidate contracts: HTTP routes this repo serves.
function hasNestedTsconfig(abs, depth = 0) {      // monorepo: tsconfig lives in apps/*/ or packages/*/
  if (depth > 2) return false;
  let ents = [];
  try { ents = fs.readdirSync(abs, { withFileTypes: true }); } catch { return false; }
  if (ents.some(e => e.isFile() && e.name === 'tsconfig.json')) return true;
  return ents.some(e => e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith('.') && hasNestedTsconfig(path.join(abs, e.name), depth + 1));
}

function detectContracts(abs, files) {
  const hits = new Map();                    // group -> {paths:Set, evidence:Set}
  const add = (p, ev) => {
    if (!p.startsWith('/') || p.length < 2) return;
    const segs = p.split('/').filter(Boolean).filter(s => !s.startsWith(':') && !s.startsWith('['));
    if (!segs.length) return;
    const g = /^(api|v\d+|internal)$/.test(segs[0]) ? segs.slice(0, 2).join('/') : segs[0];
    if (!hits.has(g)) hits.set(g, { paths: new Set(), evidence: new Set() });
    hits.get(g).paths.add(p); hits.get(g).evidence.add(ev);
  };
  for (const f of files) {
    const rel = path.relative(abs, f);
    // Next.js / app-router style: app/api/foo/route.ts
    const m = /(?:^|\/)app\/(api\/.+)\/route\.(ts|js|tsx|jsx)$/.exec(rel);
    if (m) { add('/' + m[1], rel); continue; }
    if (!/\.(ts|js|tsx|jsx|mjs|py)$/.test(rel)) continue;
    if (/(^|\/)(test|tests|__tests__|e2e)(\/|$)|\.(test|spec)\./.test(rel)) continue;   // tests describe routes, they don't serve them
    const src = slurp(f);
    for (const r of src.matchAll(/\b(?:app|router|api|server)\s*\.\s*(?:get|post|put|patch|delete|use|all)\s*\(\s*['"`]([^'"`]+)['"`]/g)) add(r[1], rel);
    for (const r of src.matchAll(/@(?:app|router)\.(?:get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g)) add(r[1], rel);
  }
  return [...hits.entries()]
    .filter(([g]) => !/^(static|assets|public|health|favicon)/.test(g))
    .map(([g, v]) => ({
      group: '/' + g,
      name: L.slug(g.replace(/\//g, '-')),
      paths: [...v.paths].sort().slice(0, 12),
      pathCount: v.paths.size,
      evidence: [...v.evidence].slice(0, 3),
      confidence: v.paths.size > 1 || /^api|^v\d/.test(g) ? 'confirmed' : 'guessed',
    }))
    .sort((a, b) => b.pathCount - a.pathCount).slice(0, 12);
}

// Candidate depends_on: calls this repo makes to other platform repos.
function detectDeps(self, abs, pkg, files) {
  const others = L.repos().filter(r => r !== self);
  const pkgNames = new Map();                 // other repo -> its package.json name
  const ownedPaths = new Map();               // other repo -> contract path prefixes it owns
  for (const o of others) {
    const op = json(path.join(P.root, o, 'package.json'));
    if (op && op.name) pkgNames.set(o, op.name);
    const e = L.regGet(o);
    if (e) for (const c of e.contracts || []) ownedPaths.set(c, o);
  }
  const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
  const found = new Map();
  const note = (repo, evidence, confidence) => {
    if (!found.has(repo)) found.set(repo, { repo, evidence: [], confidence });
    const e = found.get(repo);
    if (e.evidence.length < 3 && !e.evidence.includes(evidence)) e.evidence.push(evidence);
    if (confidence === 'confirmed') e.confidence = 'confirmed';
  };

  for (const [o, pn] of pkgNames) if (deps[pn]) note(o, `package.json depends on ${pn}`, 'confirmed');

  const envNames = new Set();
  for (const f of files) {
    const rel = path.relative(abs, f);
    const src = slurp(f);
    if (/^\.env/.test(path.basename(f))) {    // names only — never values
      for (const m of src.matchAll(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/gm)) envNames.add(m[1]);
      continue;
    }
    for (const o of others) {
      const pn = pkgNames.get(o);
      // "jet" occurs inside "jetKreate"/"jetsynthesys"; only an import/require specifier is evidence
      if (pn && new RegExp(`(?:from|require\\(|import\\()\\s*['"]${pn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/[^'"]*)?['"]`).test(src)) {
        note(o, `${rel} imports ${pn}`, 'confirmed');
      } else if (new RegExp(`\\b${o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(src)) {
        note(o, `${rel} mentions "${o}"`, 'guessed');
      }
    }
    for (const [cpath, owner] of ownedPaths) if (src.includes(cpath)) note(owner, `${rel} calls ${cpath}`, 'confirmed');
  }

  const urlEnv = [...envNames].filter(n => /(API|BACKEND|SERVICE|GATEWAY)(_|$)|BASE_URL|_URL$/.test(n));
  if (urlEnv.length && !found.size && others.length) {
    note('(unknown)', `env points at an external service: ${urlEnv.slice(0, 5).join(', ')} — confirm which repo serves it`, 'guessed');
  } else if (urlEnv.length) {
    for (const e of found.values()) e.evidence.push(`env: ${urlEnv.slice(0, 4).join(', ')}`);
  }
  return [...found.values()];
}

function missingExcludes(abs) {
  const f = path.join(abs, '.git', 'info', 'exclude');
  const cur = L.read(f);
  return EXCLUDES.filter(e => !cur.split('\n').some(l => l.trim() === e));
}

/* ---------- validation ---------- */
const failures = rep => Object.entries(rep.valid).filter(([, ok]) => !ok).map(([k]) => k);

/* ---------- apply (mechanical steps only) ---------- */
function apply(name, { stack, contracts = [], depends_on = [] } = {}) {
  const rep = detect(name);
  const bad = failures(rep);
  if (bad.length) throw new Error(`preflight failed for ${name}: ${bad.join('; ')}`);
  const done = [];

  L.snapshot(`coord: before onboarding ${name}`);
  done.push('snapshot .coord (before)');

  L.regPut({
    name, path: name,
    remote: rep.git.remote !== 'none' ? rep.git.remote : '',   // so `coord setup` can clone it elsewhere
    stack: stack || rep.stack.summary,
    contracts, depends_on,
    onboarded: L.day(), status: 'active',
  });
  done.push(`repos.json: ${name} added (active)`);

  const sf = path.join(P.status, `${name}.md`);
  if (!L.exists(sf)) { L.atomicWrite(sf, L.statusTemplate(name)); done.push(`status/${name}.md created (idle)`); }
  else done.push(`status/${name}.md already existed — left alone`);

  const ex = addExcludes(rep.abs);
  done.push(ex.length ? `.git/info/exclude += ${ex.join(', ')}` : '.git/info/exclude already covers .serena/ and CLAUDE.local.md');

  L.logActivity(name, 'onboarded');
  L.snapshot(`coord: onboarded ${name}`);
  done.push('snapshot .coord (after)');
  return done;
}

function addExcludes(abs) {                   // local-only; the repo's .gitignore is never touched
  const f = path.join(abs, '.git', 'info', 'exclude');
  const missing = missingExcludes(abs);
  if (!missing.length) return [];
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const cur = L.read(f);
  fs.writeFileSync(f, cur.replace(/\s*$/, '\n') + `\n# added by coord onboard\n${missing.join('\n')}\n`);
  return missing;
}

/* ---------- offboard ---------- */
function offboard(name) {
  const e = L.regGet(name);
  if (!e) throw new Error(`${name} is not in the registry`);
  if (e.status === 'offboarded') throw new Error(`${name} is already offboarded`);
  const done = [];
  L.snapshot(`coord: before offboarding ${name}`);

  L.regPut({ ...e, status: 'offboarded', offboarded: L.day() });
  done.push(`repos.json: ${name} -> offboarded`);

  const sf = path.join(P.status, `${name}.md`);
  if (L.exists(sf)) {
    const dest = path.join(P.archive, 'status', `${name}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(sf, dest);
    done.push(`status/${name}.md -> archive/status/${name}.md`);
  }

  const rows = [];
  for (const f of L.lsMd(P.tickets)) {
    const file = path.join(P.tickets, f);
    const { fm } = L.parse(L.read(file));
    if (fm.from !== name && fm.to !== name) continue;
    const month = (fm.closed || L.day()).slice(0, 7);
    const dest = path.join(P.archive, 'tickets', month);
    fs.mkdirSync(dest, { recursive: true });
    fs.renameSync(file, path.join(dest, f));
    const openNote = ['done', 'rejected'].includes(fm.status) ? '' : ` (was ${fm.status} at offboarding)`;
    rows.push(`| ${fm.id} | ${fm.title}${openNote} | ${fm.from} | ${fm.to} | ${fm.closed || L.day()} | ${(fm.decisions || []).join(' ') || '—'} |`);
    done.push(`${fm.id} -> archive/tickets/${month}/`);
  }
  if (rows.length) {
    const idx = path.join(P.archive, 'tickets-index.md');
    L.atomicWrite(idx, L.read(idx).replace(/\s*$/, '\n') + rows.join('\n') + '\n');
  }
  done.push('decisions left untouched');
  L.logActivity(name, 'offboarded');
  L.snapshot(`coord: offboarded ${name}`);
  done.push('snapshot .coord (after)');
  return done;
}

module.exports = { detect, apply, offboard, failures, addExcludes, missingExcludes, EXCLUDES };
