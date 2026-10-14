'use strict';
// Shared core for the coord CLI, hooks and dashboard. No external deps.
// Root resolution: COORD_ROOT env (used by `coord drill`) or this file's grandparent.
const fs = require('fs'), path = require('path'), cp = require('child_process');

// realpath everywhere: on macOS /var is a symlink to /private/var, and git reports the resolved
// path — comparing unresolved paths silently breaks repo detection and the .coord git guard.
const real = p => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };

const COORD = real(process.env.COORD_ROOT || path.join(__dirname, '..'));
const P = {
  coord: COORD,
  root: real(path.resolve(COORD, '..')),
  status: path.join(COORD, 'status'),
  tickets: path.join(COORD, 'tickets'),
  decisions: path.join(COORD, 'decisions'),
  contracts: path.join(COORD, 'contracts'),
  activity: path.join(COORD, 'activity'),
  archive: path.join(COORD, 'archive'),
  state: path.join(COORD, 'state.json'),
};

const TICKET_STATUS = ['open', 'approved', 'in_progress', 'review', 'done', 'rejected'];
const REPO_STATUS = ['working', 'blocked', 'waiting on human', 'idle'];
// who may drive each transition; `human` is enforced by requireHuman()
const TRANSITIONS = {
  open: { approved: 'human', rejected: 'human' },
  approved: { in_progress: 'assignee', rejected: 'human' },
  in_progress: { review: 'assignee', rejected: 'human' },
  review: { done: 'human', rejected: 'human' },
  done: {},
  rejected: {},
};

/* ---------- fs ---------- */
const read = (f, fb = '') => { try { return fs.readFileSync(f, 'utf8'); } catch { return fb; } };
const exists = f => fs.existsSync(f);
const ls = d => { try { return fs.readdirSync(d).sort(); } catch { return []; } };
const lsMd = d => ls(d).filter(f => f.endsWith('.md') && !f.startsWith('_'));

function atomicWrite(file, text) {            // one writer per file; tmp + rename is atomic on the same fs
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
function atomicAppend(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, text);              // short single-line appends are atomic enough
}

/* ---------- time ---------- */
const pad = n => String(n).padStart(2, '0');
function nowISO(d = new Date()) {
  const o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o);
  return `${day(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${s}${pad((a / 60) | 0)}:${pad(a % 60)}`;
}
const day = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = iso => (Date.now() - new Date(iso).getTime()) / 86400000;

/* ---------- repos ---------- */
function repos() {                            // direct subfolders with .git, hidden folders (.coord) excluded
  return fs.readdirSync(P.root, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && exists(path.join(P.root, d.name, '.git')))
    .map(d => d.name).sort();
}
function repoOf(dir) {                        // repo owning a directory, or null
  const r = sh('git', ['rev-parse', '--show-toplevel'], dir);
  if (!r.ok) return null;
  const top = real(r.out), name = path.basename(top);
  return path.dirname(top) === P.root && !name.startsWith('.') ? name : null;   // .coord is not a platform repo
}

/* ---------- markdown ---------- */
const LIST_KEYS = new Set(['repos', 'tickets', 'decisions']);
function parse(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    fm[k] = LIST_KEYS.has(k) ? (v ? v.split(',').map(s => s.trim()).filter(Boolean) : []) : v;
  }
  return { fm, body: m[2] };
}
const stringify = (fm, body) =>
  `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : (v ?? '')}`).join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`;

function sections(body) {
  const out = {}; let cur = null;
  for (const line of body.split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) { cur = m[1]; out[cur] = []; } else if (cur) out[cur].push(line);
  }
  for (const k of Object.keys(out)) out[k] = out[k].join('\n').trim();
  return out;
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'untitled';

/* ---------- ids ---------- */
function idDirs(kind) {
  const dirs = kind === 'T'
    ? [P.tickets, ...ls(path.join(P.archive, 'tickets')).map(d => path.join(P.archive, 'tickets', d))]
    : [P.decisions];
  return dirs.filter(exists);
}
function nextNum(kind) {
  let max = 0;
  const re = new RegExp(`^${kind}-(\\d+)`);
  for (const d of idDirs(kind)) for (const f of ls(d)) { const m = re.exec(f); if (m) max = Math.max(max, +m[1]); }
  for (const m of read(path.join(P.archive, 'tickets-index.md')).matchAll(new RegExp(`${kind}-(\\d+)`, 'g'))) max = Math.max(max, +m[1]);
  return max + 1;
}
// Allocate + create in one shot: 'wx' fails if the file exists, so two writers can never land on one id.
function createWithId(kind, dir, titleSlug, content) {
  fs.mkdirSync(dir, { recursive: true });
  for (let n = nextNum(kind); n < nextNum(kind) + 200; n++) {
    const id = `${kind}-${pad3(n)}`;
    if (idDirs(kind).some(d => ls(d).some(f => f.startsWith(id + '-')))) continue;
    const file = path.join(dir, `${id}-${titleSlug}.md`);
    try { fs.writeFileSync(file, content(id), { flag: 'wx' }); return { id, file }; }
    catch (e) { if (e.code !== 'EEXIST') throw e; }
  }
  throw new Error(`could not allocate a free ${kind} id`);
}
const pad3 = n => String(n).padStart(3, '0');

/* ---------- lookup ---------- */
function findTicket(id, { archived = true } = {}) {
  const dirs = [P.tickets, ...(archived ? idDirs('T').slice(1) : [])];
  for (const d of dirs) for (const f of lsMd(d)) if (f.startsWith(id + '-')) return path.join(d, f);
  return null;
}
function findDecision(id) {
  for (const f of lsMd(P.decisions)) if (f.startsWith(id + '-')) return path.join(P.decisions, f);
  return null;
}
function loadTicket(id) {
  const file = findTicket(id);
  if (!file) return null;
  const { fm, body } = parse(read(file));
  return { file, fm, body, sec: sections(body), archived: !file.startsWith(P.tickets + path.sep) };
}

/* ---------- git ---------- */
function sh(cmd, args, cwd) {
  const r = cp.spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
// Every write to git goes through here: refuses unless .coord is itself the repo root.
function coordGit(args) {
  const top = sh('git', ['rev-parse', '--show-toplevel'], P.coord);
  if (!top.ok || real(top.out) !== P.coord) return { ok: false, out: '', err: '.coord is not its own git repo — refusing' };
  return sh('git', args, P.coord);
}
function snapshot(msg) {
  if (!coordGit(['add', '-A']).ok) return false;
  if (sh('git', ['diff', '--cached', '--quiet'], P.coord).ok) return false;   // nothing changed
  return coordGit(['commit', '-q', '-m', msg]).ok;
}

/* ---------- state ---------- */
const state = () => { try { return JSON.parse(read(P.state, '{}')); } catch { return {}; } };
const setState = patch => atomicWrite(P.state, JSON.stringify({ ...state(), ...patch }, null, 2) + '\n');

/* ---------- actor ---------- */
// Claude's Bash tool is not a TTY; a human in a terminal is. COORD_ACTOR=human overrides for scripts.
const isHuman = () => process.env.COORD_ACTOR === 'human' || (!!process.stdout.isTTY && process.env.COORD_ACTOR !== 'repo');
const actor = () => (isHuman() ? 'human' : (repoOf(process.cwd()) || 'platform-root'));

/* ---------- templates ---------- */
const statusTemplate = repo => `# ${repo}

- **Current task:** —
- **Status:** idle
- **Blockers:** —
- **Last updated:** ${nowISO()}

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
`;

function ensureStatusFiles() {
  const made = [];
  for (const r of repos()) {
    const f = path.join(P.status, `${r}.md`);
    if (!exists(f)) { atomicWrite(f, statusTemplate(r)); made.push(r); }
  }
  return made;
}
function readStatus(repo) {
  const t = read(path.join(P.status, `${repo}.md`));
  const field = k => (t.match(new RegExp(`^-\\s*\\*\\*${k}:\\*\\*\\s*(.*)$`, 'mi')) || [, ''])[1].trim();
  return { repo, task: field('Current task'), status: field('Status'), blockers: field('Blockers'), updated: field('Last updated'), notes: (t.match(/^### .*/gm) || []).length, text: t };
}

/* ---------- activity ---------- */
const activityFile = (d = new Date()) => path.join(P.activity, `${day(d)}.log`);
const logActivity = (repo, event, extra = '') => atomicAppend(activityFile(), `${nowISO()}\t${repo}\t${event}${extra ? '\t' + extra : ''}\n`);
function activityLines(limit = 50, file = activityFile()) {
  return read(file).trimEnd().split('\n').filter(Boolean).slice(-limit).reverse();
}
function lastActivityPerRepo() {              // heartbeat: newest activity timestamp per repo
  const seen = {};
  const files = ls(P.activity).filter(f => f.endsWith('.log') && f !== 'hook-errors.log').slice(-3);
  for (const f of files) for (const line of read(path.join(P.activity, f)).split('\n')) {
    const [ts, repo] = line.split('\t');
    if (ts && repo) seen[repo] = ts;
  }
  return seen;
}

module.exports = { P, real, TICKET_STATUS, REPO_STATUS, TRANSITIONS, read, exists, ls, lsMd, atomicWrite, atomicAppend, nowISO, day, daysAgo, repos, repoOf, parse, stringify, sections, slug, pad3, nextNum, createWithId, findTicket, findDecision, loadTicket, sh, coordGit, snapshot, state, setState, isHuman, actor, statusTemplate, ensureStatusFiles, readStatus, activityFile, logActivity, activityLines, lastActivityPerRepo, idDirs };
