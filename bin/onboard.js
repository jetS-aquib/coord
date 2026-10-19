'use strict';
// Machine-checkable half of onboarding: validation, stack detection, contract and
// dependency candidates, and the mechanical apply. Judgement stays in ONBOARDING.md.
// Read-only except in apply()/offboard(). Never reads .env *values*, only variable names.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const { P } = L;

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', '.vercel', 'coverage', '.cache', 'out', 'vendor', '__pycache__', '.venv', 'tmp', 'temp']);
const EMPTY = new Set();
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go)$/;
const MAX_FILES = 4000, MAX_BYTES = 200_000;
const EXCLUDES = ['.serena/', 'CLAUDE.local.md', 'graphify-out/', 'repomix-output.*', '.repomix/'];

/* ---------- small helpers ---------- */
const json = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
let truncated = false;
function walk(dir, out = [], depth = 0) {
  if (depth > 8 || out.length > MAX_FILES) { truncated = true; return out; }
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
function detect(name, at) {
  const abs = at ? L.real(path.resolve(at)) : L.repoDir(name);
  const pkg = json(path.join(abs, 'package.json'));
  const reg = L.regGet(name);

  const valid = {
    'the folder exists': fs.existsSync(abs),
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

  truncated = false;
  const files = walk(abs);
  const bytes = files.reduce((n, f) => { try { return n + fs.statSync(f).size; } catch { return n; } }, 0);
  // bytes/9, not the usual bytes/4: that rule is for prose, and code is a third
  // indentation. Calibrated against a repo graphify had already counted for us.
  const size = { files: files.length, bytes, tokens: Math.round(bytes / 9), floor: truncated };
  const stack = detectStack(abs, pkg, files);
  const claude = {
    'CLAUDE.md': fs.existsSync(path.join(abs, 'CLAUDE.md')),
    'CLAUDE.local.md': fs.existsSync(path.join(abs, 'CLAUDE.local.md')),
    '.claude/': fs.existsSync(path.join(abs, '.claude')),
    '.github/copilot-instructions.md': fs.existsSync(path.join(abs, '.github', 'copilot-instructions.md')),
  };
  // What is already indexing this repo, and whether its output is about to be committed.
  const indexes = ['.serena', 'graphify-out', '.repomix'].map(d => ({
    name: d,
    present: fs.existsSync(path.join(abs, d)),
    ignored: L.sh('git', ['check-ignore', '-q', d], abs).ok ||
      L.read(path.join(abs, '.git', 'info', 'exclude')).split('\n').some(l => l.trim() === d + '/'),
  })).filter(i => i.present);
  const contracts = detectContracts(abs, files);
  const depends_on = detectDeps(name, abs, pkg, files);

  return { name, abs, relPath: name, valid, git, stack, claude, contracts, depends_on, files: files.length, size, indexes, excludes: missingExcludes(abs) };
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

// Commented-out code is not a served route. Four of twelve candidates on one repo were
// routers somebody had switched off, reported with the same confidence as live ones.
// Strings are kept whole: a // inside a URL is not a comment.
function decomment(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1'))
    .join('\n');
}

// Express serves a router at wherever it is mounted, not at the path written inside it.
// `app.use('/api', registerRoutes())` means every router.get('/video') in that tree is
// really /api/video — so a scan that reads the file alone names every contract wrongly,
// and those names then collide with a different repo that happens to use the same word.
// Express serves a router at wherever it is mounted, not at the path written inside it.
// `app.use('/api', registerRoutes())` means every router.get('/video') in that tree is
// really /api/video -- so a scan that reads the file alone names every contract wrongly,
// and those names then collide with a different repo that happens to use the same word.
//
// A node is a router, not a file: a file's own exported router is `rel`, and a Router()
// held in a local variable is `rel#var`, because `const v1 = Router(); router.use('/v1', v1)`
// puts everything on v1 one level deeper than the file it lives in.
function mountPrefixes(abs, files) {
  const srcOf = new Map(), byRel = new Map();
  for (const f of files) {
    const rel = path.relative(abs, f);
    if (!/\.(ts|js|tsx|jsx|mjs)$/.test(rel)) continue;
    srcOf.set(rel, decomment(slurp(f)));
    byRel.set(rel.replace(/\.(ts|js|tsx|jsx|mjs)$/, ''), rel);
  }
  // identifier -> the module specifier it was imported from, per file
  const importsIn = src => {
    const m = new Map();
    // `import r from 'x'`, `import * as r from 'x'`, `import r, { a } from 'x'`.
    // The default-import form is the one every Express router arrives by; a regex that
    // missed it resolved nothing below the entry file and left every router unprefixed.
    for (const r of src.matchAll(/import\s+(?:\*\s+as\s+)?(\w+)\s*(?:,[^'"]*)?\s+from\s*['"]([^'"]+)['"]/g)) m.set(r[1], r[2]);
    for (const r of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
      for (const n of r[1].split(',')) {
        const name = n.trim().split(/\s+as\s+/).pop().trim();
        if (name) m.set(name, r[2]);
      }
    }
    for (const r of src.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*['"]([^'"]+)['"]/g)) m.set(r[1], r[2]);
    return m;
  };
  const resolve = (fromRel, spec) => {
    if (!spec || !spec.startsWith('.')) return null;
    const joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel.split(path.sep).join('/')), spec));
    return byRel.get(joined) || byRel.get(joined + '/index') || null;
  };
  const localsOf = new Map();               // file -> Set of `const v = Router()` names
  for (const [rel, src] of srcOf) {
    const s = new Set();
    for (const r of src.matchAll(/(?:const|let|var)\s+(\w+)\s*(?::[^=\n]*)?=\s*(?:express\s*\.\s*)?Router\s*\(/g)) s.add(r[1]);
    localsOf.set(rel, s);
  }
  const ROOT = /^(app|router|server|api)$/;

  // Pass 1 -- raw mounts. `const router = Router()` at the top of a file IS that file's
  // exported router, not a sub-router; only a local that something else mounts (`const v1
  // = Router(); router.use('/v1', v1)`) is a node of its own. That is only knowable once
  // every mount in the file has been read, so nodes are assigned in pass 2.
  const raw = [];                           // { rel, recv, prefix, local, file }
  const mounted = new Set();                // "rel#name" for locals that are mounted
  for (const [rel, src] of srcOf) {
    const imp = importsIn(src);
    const locals = localsOf.get(rel) || EMPTY;
    // Everything between the path and the router is middleware: `router.use('/jobs',
    // ...authAndSign, jobsRoutes)`. Requiring the router to sit immediately after the
    // path skipped every protected route, which is most of them. Take the last argument
    // on the line that actually names a router.
    for (const r of src.matchAll(/\b(\w+)\s*\.\s*use\s*\(\s*['"`]([^'"`]+)['"`]\s*,([^\n;]{0,300})/g)) {
      const [, recv, prefix, tail] = r;
      if (!ROOT.test(recv) && !locals.has(recv)) continue;
      let local = null, file = null;
      for (const id of tail.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
        const n = id[1];
        if (locals.has(n)) { local = n; file = null; }
        else { const t = resolve(rel, imp.get(n)); if (t) { file = t; local = null; } }
      }
      if (!local && !file) continue;
      if (local) mounted.add(rel + '#' + local);
      raw.push({ rel, recv, prefix, local, file });
    }
    // `registerCatalogRoutes(router, ctx)` -- a module handed somebody else's router
    // registers onto it, so it serves wherever that router serves and adds no prefix
    // of its own. Only counted when the callee resolves to a file in this repo.
    for (const r of src.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(\s*([^)\n]{1,200})\)/g)) {
      const callee = resolve(rel, imp.get(r[1]));
      if (!callee) continue;
      const arg = (r[2].match(/\b[A-Za-z_$][\w$]*\b/g) || []).find(n => ROOT.test(n) || locals.has(n));
      if (arg) raw.push({ rel, recv: arg, prefix: '', local: null, file: callee });
    }
  }
  const node = (rel, name) => mounted.has(rel + '#' + name) ? rel + '#' + name : rel;

  // Pass 2 -- edges between nodes
  const direct = new Map();                 // child node -> [{ parent node, prefix }]
  for (const m of raw) {
    const child = m.local ? m.rel + '#' + m.local : m.file;
    (direct.get(child) || direct.set(child, []).get(child)).push({ parent: node(m.rel, m.recv), prefix: m.prefix });
  }

  // A router mounted twice is served twice. `router.use('/jobs', jobsRoutes)` beside
  // `v1.use('/jobs', jobsRoutes)` means /api/jobs AND /api/v1/jobs both answer, and
  // keeping only the first one quietly deleted the legacy half of this platform's API
  // -- paths the humans had correctly listed by hand. So: every mount, not the first.
  const MAX_MOUNTS = 8;                     // ponytail: a diamond of re-mounts is noise, not API
  const prefixOf = new Map();               // node -> every path it is served at
  const chain = (n, seen = new Set()) => {
    if (prefixOf.has(n)) return prefixOf.get(n);
    if (seen.has(n) || seen.size > 12) return [];
    seen.add(n);
    const ups = direct.get(n) || [];
    if (!ups.length) return [];
    const out = [];
    for (const u of ups) {
      const parents = chain(u.parent, new Set(seen));
      for (const p of (parents.length ? parents : [''])) {
        const full = (p + u.prefix).replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
        if (!out.includes(full)) out.push(full);
        if (out.length >= MAX_MOUNTS) break;
      }
      if (out.length >= MAX_MOUNTS) break;
    }
    prefixOf.set(n, out);
    return out;
  };
  for (const n of direct.keys()) chain(n);

  return {
    // always at least [''] -- a file nothing mounts still serves the paths it writes
    prefixesAt: (rel, recv) => { const p = prefixOf.get(node(rel, recv)); return p && p.length ? p : ['']; },
    isRouter: (rel, recv) => ROOT.test(recv) || (localsOf.get(rel) || EMPTY).has(recv),
  };
}

function detectContracts(abs, files) {
  const hits = new Map();                    // group -> {paths:Set, evidence:Set}
  const add = (p, ev) => {
    if (!p.startsWith('/') || p.length < 2) return;
    const segs = p.split('/').filter(Boolean).filter(s => !s.startsWith(':') && !s.startsWith('['));
    if (!segs.length) return;
    // /api/v1/jobs belongs to jobs, not to "v1". Grouping on two segments made every
    // versioned route collapse into one contract called /api/v1, which owns nothing and
    // double-counts routes already grouped under their own name.
    const depth = /^(api|internal)$/.test(segs[0]) ? (/^v\d+$/.test(segs[1] || '') ? 3 : 2)
      : /^v\d+$/.test(segs[0]) ? 2 : 1;
    const g = segs.slice(0, depth).join('/');
    if (!hits.has(g)) hits.set(g, { paths: new Set(), evidence: new Set() });
    hits.get(g).paths.add(p); hits.get(g).evidence.add(ev);
  };
  const { prefixesAt, isRouter } = mountPrefixes(abs, files);
  for (const f of files) {
    const rel = path.relative(abs, f);
    // Next.js / app-router style: app/api/foo/route.ts
    const m = /(?:^|\/)app\/(api\/.+)\/route\.(ts|js|tsx|jsx)$/.exec(rel);
    if (m) { add('/' + m[1], rel); continue; }
    if (!/\.(ts|js|tsx|jsx|mjs|py)$/.test(rel)) continue;
    if (/(^|\/)(test|tests|__tests__|e2e)(\/|$)|\.(test|spec)\./.test(rel)) continue;   // tests describe routes, they don't serve them
    const src = decomment(slurp(f));
    const at = (mount, p) => (mount + (p.startsWith('/') ? p : '/' + p)).replace(/\/+/g, '/').replace(/(.)\/$/, '$1') || '/';
    // `use` is a mount, not a route: it only ever yielded the prefix itself (/api, /api/v1)
    // and static-file mounts (/temp), while the real routes underneath are found anyway.
    const isPy = /\.py$/.test(rel);     // `@router.get("/x")` matches the JS shape too, unprefixed
    for (const r of src.matchAll(/\b(\w+)\s*\.\s*(?:get|post|put|patch|delete|all)\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
      if (isPy || !isRouter(rel, r[1])) continue;        // an http client's .get('/x') is a call, not a route
      for (const mount of prefixesAt(rel, r[1])) add(at(mount, r[2]), rel);
    }
    // FastAPI: APIRouter(prefix="/api/v1") in the same file as its routes.
    // ponytail: in-file prefix only -- add chaining if a repo here starts passing
    // prefix= to include_router() instead.
    const py = isPy ? (/APIRouter\(\s*[^)]*?prefix\s*=\s*['"]([^'"]+)['"]/.exec(src) || ['', ''])[1] : prefixesAt(rel, 'app')[0];
    for (const r of src.matchAll(/@(?:app|router)\.(?:get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g)) add(at(py, r[1]), rel);
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
    // Every one of them. A cap here is not a display choice: `coord contracts` diffs the
    // board against this list, so a truncated tail reported real, registered contracts as
    // missing from the code. /api/models was the 31st. Callers that only show a few slice
    // it themselves.
    .sort((a, b) => b.pathCount - a.pathCount);
}

// Candidate depends_on: calls this repo makes to other platform repos.
function detectDeps(self, abs, pkg, files) {
  const others = L.repos().filter(r => r !== self);
  const pkgNames = new Map();                 // other repo -> its package.json name
  const ownedPaths = new Map();               // other repo -> contract path prefixes it owns
  for (const o of others) {
    const op = json(path.join(L.repoDir(o), 'package.json'));
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
    // A path only counts where a path can start: just after a quote, or just after a
    // template hole holding a base URL. src.includes('/user') was true of the Firebase
    // error string 'auth/user-not-found', and src.includes('/models') of the import
    // '../models/GenerationLog' — both were then reported as confirmed dependencies.
    for (const [cpath, owner] of ownedPaths) {
      const esc = cpath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(?:[\'"\`]|\\}|\\\\\$\\{)\\s*' + esc + '(?=[/?\'"\`\\\\]|$)', 'm');
      if (!re.test(src)) continue;
      // ...unless every place it appears is one of this repo's own route definitions.
      // '/user/:userId' served here matched the other backend's /user contract and was
      // reported as a dependency on it. A route you serve is not a repo you call.
      const serves = new RegExp('\\b(?:app|router|api|server)\\s*\\.\\s*(?:get|post|put|patch|delete|use|all)\\s*\\(\\s*[\'"`]' + esc);
      if (src.split('\n').some(l => re.test(l) && !serves.test(l))) note(owner, `${rel} calls ${cpath}`, 'confirmed');
    }
  }

  const urlEnv = [...envNames].filter(n => /(API|BACKEND|SERVICE|GATEWAY)(_|$)|BASE_URL|_URL$/.test(n));
  if (urlEnv.length && !found.size && others.length) {
    note('(unknown)', `env points at an external service: ${urlEnv.slice(0, 5).join(', ')} — confirm which repo serves it`, 'guessed');
  } else if (urlEnv.length) {
    for (const e of found.values()) e.evidence.push(`env: ${urlEnv.slice(0, 4).join(', ')}`);
  }
  return [...found.values()];
}

// Only what nothing already covers. A repo whose own .gitignore names these is the
// better arrangement — the rule is visible to everyone and survives a fresh clone —
// and writing it a second time into .git/info/exclude just means two places to look
// when somebody asks why a folder is ignored.
function missingExcludes(abs) {
  const f = path.join(abs, '.git', 'info', 'exclude');
  const cur = L.read(f).split('\n').map(l => l.trim());
  return EXCLUDES.filter(e => {
    if (cur.includes(e)) return false;
    const probe = e.replace(/\*$/, 'x');                 // a pattern needs a path to test
    return !L.sh('git', ['check-ignore', '-q', probe], abs).ok;
  });
}

/* ---------- validation ---------- */
const failures = rep => Object.entries(rep.valid).filter(([, ok]) => !ok).map(([k]) => k);

// Each check is named as the condition that must hold, so printing a failed one back
// reads as its own opposite: "not already onboarded" told you it was not onboarded,
// when it meant it already is. Say what is wrong, and what to run instead.
const why = (k, name) => ({
  'the folder exists': `there is no folder for ${name} on this machine -- coord where ${name} <path>`,
  'contains .git': `${name} has no .git -- it is a folder, not a repo`,
  'not a hidden folder': `"${name}" starts with a dot`,
  'not already onboarded': `${name} is already onboarded -- to change what it owns: coord contracts ${name}`,
  'name is usable': `"${name}" is not a usable repo name`,
}[k] || `failed check: ${k}`);

/* ---------- apply (mechanical steps only) ---------- */
// depends_on passed here is a person's answer and is used exactly as given -- never
// merged with, or widened by, anything the scanner thinks.
function apply(name, { stack, contracts = [], depends_on = [], at } = {}) {
  const rep = detect(name, at);
  const bad = failures(rep);
  if (bad.length) throw new Error(`cannot onboard ${name}: ${bad.map(b => why(b, name)).join('; ')}`);
  const clashes = L.contractClashes(contracts, name);
  if (clashes.length) throw new Error(`cannot onboard ${name}: ${L.clashMsg(clashes, name)}`);
  const done = [];

  L.snapshot(`coord: before onboarding ${name}`);
  done.push('snapshot .coord (before)');

  // Record where it is on THIS machine before anything else reads it. Outside the
  // platform root that is the only way back to it; inside, it is the default anyway.
  if (L.real(rep.abs) !== path.join(P.root, name)) {
    L.setRepoPath(name, rep.abs);
    done.push(`paths.json: ${name} -> ${rep.abs} (this machine only)`);
  }

  // regPut replaces the row, it does not merge. The "not already onboarded" check
  // stops a bare --apply from blanking an active repo -- but an OFFBOARDED one passes
  // that check, so bringing a repo back used to erase everything it owned. Keep what
  // was there unless this run names something; emptying a row is `coord contracts
  // <repo> --own`, where it is deliberate.
  const prev = L.regGet(name) || {};
  L.regPut({
    name,
    remote: rep.git.remote !== 'none' ? rep.git.remote : '',   // so `coord setup` can clone it elsewhere
    stack: stack || rep.stack.summary || prev.stack,
    contracts: contracts.length ? contracts : (prev.contracts || []),
    depends_on: depends_on.length ? depends_on : (prev.depends_on || []),
    onboarded: prev.onboarded || L.day(), status: 'active',
  });
  done.push(`repos.json: ${name} ${prev.name ? 'back' : 'added'} (active)`);
  if (prev.name && !contracts.length && (prev.contracts || []).length) done.push(`kept the ${prev.contracts.length} contract(s) it already owned`);

  const sf = L.statusFile(name);
  if (!L.exists(sf)) {
    fs.mkdirSync(L.statusDir(name), { recursive: true });
    L.atomicWrite(sf, L.statusTemplate(name, L.me()));
    done.push(`status/${name}/${path.basename(sf)} created (idle)`);
  }
  else done.push(`status/${name}.md already existed — left alone`);

  const ex = addExcludes(rep.abs);
  done.push(ex.length ? `.git/info/exclude += ${ex.join(', ')}` : '.git/info/exclude already covers .serena/ and CLAUDE.local.md');

  // The scanner guesses -- it cannot tell a live router from a dead one, and it once
  // named this repo's contracts after paths it does not serve. So only what the human
  // named goes on the board; the rest is printed once, here, and written nowhere.
  // The newcomer may also be the missing half of somebody else's dependency. Say so;
  // do not decide it. Nothing below writes to another repo's row.
  const unnamed = rep.contracts.filter(c => !contracts.includes(c.group));
  const asks = unnamed.slice(0, 12)
    .map(c => `contract ${c.group} [${c.confidence}] ${c.pathCount} route(s) — not registered; coord contracts ${name} --add ${c.group}`);
  if (unnamed.length > 12) asks.push(`and ${unnamed.length - 12} more — coord contracts ${name}`);
  try { asks.push(...refreshDeps(name)); }
  catch (e) { done.push(`could not re-read the other repos' dependencies: ${e.message}`); }
  if (asks.length) { done.push('--- suggestions, nothing written ---'); for (const a of asks) done.push(a); }

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

  const sf = L.statusDir(name);
  if (L.exists(sf)) {
    const dest = path.join(P.archive, 'status', name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.rmSync(dest, { recursive: true, force: true });
    fs.renameSync(sf, dest);
    done.push(`status/${name}/ -> archive/status/${name}/`);
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

function sizeOf(abs) {
  truncated = false;
  const files = walk(abs);
  const bytes = files.reduce((n, f) => { try { return n + fs.statSync(f).size; } catch { return n; } }, 0);
  return { files: files.length, bytes, tokens: Math.round(bytes / 9), floor: truncated };
}

// Onboarding repo B teaches coord things about repo A: A may already call B's routes,
// and until B was in the registry there was nothing for that call to point at. So every
// onboarding re-reads the repos already on the board rather than leaving their
// depends_on frozen at whatever was true the day they joined.
// Suggestions, not writes. The first version of this wrote what the scanner found into
// every repo's row, including other people's rows, and union-merged so nothing could
// ever be taken back out -- so onboarding one repo silently asserted four dependencies
// that two rounds of preflight had already disproved. A guess written into shared state
// as fact is worse than no guess: it reaches every session's briefing and nobody knows
// it was a guess. The scanner may only ever ask.
function refreshDeps(newcomer) {
  const asks = [];
  for (const r of L.onboarded()) {
    if (r === newcomer) continue;
    const dir = L.repoDir(r);
    if (!L.isRepoAt(dir)) continue;
    const e = L.regGet(r);
    if (!e || (e.depends_on || []).includes(newcomer)) continue;
    const pkg = json(path.join(dir, 'package.json'));
    truncated = false;
    const hit = detectDeps(r, dir, pkg, walk(dir)).find(d => d.repo === newcomer && d.confidence === 'confirmed');
    if (hit) {
      asks.push(`${r} may now depend on ${newcomer} — ${(hit.evidence || []).slice(0, 2).join('; ')}`);
      asks.push(`  if that is right:  coord depends ${r} --add ${newcomer}`);
    }
  }
  return asks;
}

module.exports = { sizeOf, refreshDeps, detect, apply, offboard, failures, why, addExcludes, missingExcludes, EXCLUDES };
