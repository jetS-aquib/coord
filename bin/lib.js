'use strict';
// Shared core for the coord CLI, hooks and dashboard. No external deps.
// Root resolution: COORD_ROOT env (used by `coord drill`) or this file's grandparent.
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');

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
  registry: path.join(COORD, 'repos.json'),
  people: path.join(COORD, 'people.json'),
};

// The repos already carry `JET-nnn` tags in comments — a documented convention
// ("issue tags mark why code exists"). coord continues that series rather than
// inventing a second one.
const TICKET_PREFIX = 'JET';
const TICKET_RE = new RegExp(`${TICKET_PREFIX}-\\d+`, 'g');

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
// DISCOVERY: every git subfolder. Membership is the registry below — not this.
function repos() {                            // direct subfolders with .git, hidden folders (.coord) excluded
  return fs.readdirSync(P.root, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && exists(path.join(P.root, d.name, '.git')))
    // never a platform repo: this coord dir, or any other clone of it sitting alongside
    .filter(d => real(path.join(P.root, d.name)) !== P.coord && !exists(path.join(P.root, d.name, 'bin', 'coord')))
    .map(d => d.name).sort();
}
function repoOf(dir) {                        // repo owning a directory, or null
  const r = sh('git', ['rev-parse', '--show-toplevel'], dir);
  if (!r.ok) return null;
  const top = real(r.out), name = path.basename(top);
  return path.dirname(top) === P.root && !name.startsWith('.') ? name : null;   // .coord is not a platform repo
}

/* ---------- registry (repos.json) — written only by the CLI ---------- */
function registry() {
  try { const j = JSON.parse(read(P.registry, '{}')); return Array.isArray(j.repos) ? j.repos : []; }
  catch { return []; }
}
const writeRegistry = list => atomicWrite(P.registry,
  JSON.stringify({ version: 1, updated: nowISO(), repos: [...list].sort((a, b) => a.name.localeCompare(b.name)) }, null, 2) + '\n');
const regGet = name => registry().find(r => r.name === name) || null;
function regPut(entry) {                       // insert or replace one entry, atomically
  const list = registry().filter(r => r.name !== entry.name);
  list.push(entry);
  writeRegistry(list);
  return entry;
}
const onboarded = () => registry().filter(r => r.status === 'active').map(r => r.name).sort();
const offboarded = () => registry().filter(r => r.status === 'offboarded').map(r => r.name).sort();
const isOnboarded = name => registry().some(r => r.name === name && r.status === 'active');
function discovered() {                        // has .git, not in the registry at all
  const known = new Set(registry().map(r => r.name));
  return repos().filter(r => !known.has(r));
}

/* ---------- people (people.json) — the shared roster, written only by the CLI ---------- */
const TOOLS = ['claude-code', 'copilot', 'both', 'other'];
function people() {
  try { const j = JSON.parse(read(P.people, '{}')); return Array.isArray(j.people) ? j.people : []; }
  catch { return []; }
}
const writePeople = list => atomicWrite(P.people,
  JSON.stringify({ version: 1, updated: nowISO(), people: [...list].sort((a, b) => a.name.localeCompare(b.name)) }, null, 2) + '\n');
function putPerson(entry) {
  const list = people().filter(p => (p.email || '').toLowerCase() !== (entry.email || '').toLowerCase());
  list.push(entry);
  writePeople(list);
  return entry;
}
// Who is at this machine: match the git identity against the roster. No local file needed.
let _me;
// NEVER read identity from .coord: it carries a bot identity ("coord") for its own
// snapshot commits. Use the dev's global config, or a platform repo's.
function gitConfig(key) {
  // Ask from inside a platform repo so git applies its own local > global precedence.
  for (const r of repos()) {
    const v = sh('git', ['config', key], path.join(P.root, r));
    if (v.ok && v.out) return v.out;
  }
  const g = sh('git', ['config', '--global', key], os.tmpdir());   // no repos cloned yet
  return g.ok ? g.out : '';
}
const gitEmail = () => gitConfig('user.email');
function me() {
  if (_me !== undefined) return _me;
  const email = gitEmail().toLowerCase();
  const hit = email && people().find(p => (p.email || '').toLowerCase() === email);
  return (_me = hit ? hit.name : '');
}
const personNamed = name => people().find(p => p.name === name) || null;

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
  const dirs = kind === TICKET_PREFIX
    ? [P.tickets, ...ls(path.join(P.archive, 'tickets')).map(d => path.join(P.archive, 'tickets', d))]
    : [P.decisions];
  return dirs.filter(exists);
}
function nextNum(kind) {
  let max = 0;
  const re = new RegExp(`^${kind}-(\\d+)`);
  for (const d of idDirs(kind)) for (const f of ls(d)) { const m = re.exec(f); if (m) max = Math.max(max, +m[1]); }
  for (const m of read(path.join(P.archive, 'tickets-index.md')).matchAll(new RegExp(`${kind}-(\\d+)`, 'g'))) max = Math.max(max, +m[1]);
  if (kind === TICKET_PREFIX) max = Math.max(max, codeMaxTicket());   // never reuse an id the code already cites
  return max + 1;
}

// Highest JET-nnn appearing anywhere in the repos' source. Keeps new ids clear of the
// 646 references already in comments, and self-corrects if someone cites a higher one.
function codeMaxTicket() {
  let max = 0;
  for (const r of repos()) {
    // source only: a JET-nnn inside a markdown example is documentation, not a claim on
    // that id, and counting it would inflate the sequence every time we write a doc.
    const g = sh('grep', ['-rhoE', `${TICKET_PREFIX}-[0-9]+`, '--include=*.ts', '--include=*.tsx',
      '--include=*.js', '--include=*.jsx', '--include=*.mjs', '--exclude-dir=node_modules',
      '--exclude-dir=.git', '--exclude-dir=dist', '--exclude-dir=.next', '.'], path.join(P.root, r));
    if (!g.ok) continue;
    for (const line of g.out.split('\n')) {
      const n = Number(line.split('-')[1]);
      if (isFinite(n)) max = Math.max(max, n);
    }
  }
  return max;
}

// Every place in the repos that cites a ticket id, with the line it sits on.
function codeRefs(id) {
  const out = [];
  for (const r of repos()) {
    const g = sh('grep', ['-rnoE', `.{0,90}${id}\\b.{0,40}`, '--include=*.ts', '--include=*.tsx',
      '--include=*.js', '--include=*.jsx', '--include=*.mjs', '--include=*.md', '--exclude-dir=node_modules',
      '--exclude-dir=.git', '--exclude-dir=dist', '--exclude-dir=.next', '.'], path.join(P.root, r));
    if (!g.ok || !g.out) continue;
    for (const line of g.out.split('\n')) {
      const m = /^\.?\/?(.+?):(\d+):(.*)$/.exec(line);
      if (m) out.push({ repo: r, file: m[1], line: +m[2], text: m[3].trim() });
    }
  }
  return out;
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
  const dirs = [P.tickets, ...(archived ? idDirs(TICKET_PREFIX).slice(1) : [])];
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
// Name the person when the roster knows them. An agent runs on its dev's machine, so
// this resolves to that dev either way — which is what makes "your agent filed it" work.
const actor = () => me() || (isHuman() ? 'human' : (repoOf(process.cwd()) || 'platform-root'));

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
  for (const d of [P.status, P.tickets, P.decisions, P.contracts, P.activity, P.archive]) fs.mkdirSync(d, { recursive: true });
  // a fresh clone gets the merge strategy too: daily logs are append-only from several machines
  const ga = path.join(P.coord, '.gitattributes');
  if (!exists(ga)) atomicWrite(ga, 'activity/*.log           merge=union\nactivity/hook-errors.log merge=union\narchive/tickets-index.md merge=union\n');
  const made = [];
  for (const r of onboarded()) {              // discovered-but-not-onboarded repos get nothing
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

/* ---------- the ticket you are currently on ---------- */
// Lives in .git/ so it is per-clone and per-person: two devs in one repo can be on
// different tickets. Never committed, like .git/info/exclude.
const ticketPointer = repo => path.join(P.root, repo, '.git', 'coord-ticket');
const currentTicket = repo => read(ticketPointer(repo)).trim();
function setCurrentTicket(repo, id) {
  const f = ticketPointer(repo);
  if (!exists(path.dirname(f))) return false;
  if (id) atomicWrite(f, id + '\n');
  else try { fs.rmSync(f); } catch { /* already gone */ }
  return true;
}

/* ---------- activity ---------- */
const activityFile = (d = new Date()) => path.join(P.activity, `${day(d)}.log`);
// Field 3 is the person. Older lines have `extra` there instead, so readers only accept
// field 3 as a name when it matches the roster.
const logActivity = (repo, event, extra = '') => atomicAppend(activityFile(), `${nowISO()}\t${repo}\t${event}\t${me()}${extra ? '\t' + extra : ''}\n`);
function activityLines(limit = 50, file = activityFile()) {
  return read(file).trimEnd().split('\n').filter(Boolean).slice(-limit).reverse();
}
function lastActivityPerRepo() {              // heartbeat: newest activity timestamp per repo
  const seen = {};
  for (const { ts, repo } of recentActivity()) if (ts && repo) seen[repo] = ts;
  return seen;
}

function recentActivity(days = 3) {
  const names = new Set(people().map(p => p.name));
  const out = [];
  for (const f of ls(P.activity).filter(f => /^\d{4}-\d{2}-\d{2}\.log$/.test(f)).slice(-days)) {
    for (const line of read(path.join(P.activity, f)).split('\n')) {
      if (!line) continue;
      const [ts, repo, event, four] = line.split('\t');
      out.push({ ts, repo, event, who: names.has(four) ? four : '', line });
    }
  }
  return out;
}

// Repos a person has actually touched lately. Tickets carry no assignee, so this is
// how "my work" is derived: where you have been, not what you were assigned.
function reposFor(name, days = 7) {
  const seen = new Map();
  for (const a of recentActivity(days)) {
    if (a.who !== name || !a.repo || a.repo === 'platform-root') continue;
    const prev = seen.get(a.repo);
    if (!prev || a.ts > prev) seen.set(a.repo, a.ts);
  }
  return [...seen.entries()].sort((a, b) => b[1].localeCompare(a[1])).map(([r]) => r);
}

// The newest handoff note in a repo's status file — "what was I doing?"
function latestHandoff(repo) {
  const t = read(path.join(P.status, `${repo}.md`));
  const i = t.indexOf('## Handoff notes');
  if (i < 0) return null;
  const after = t.slice(i);
  const m = /^### (.+)$/m.exec(after);
  if (!m) return null;
  const start = after.indexOf(m[0]);
  const rest = after.slice(start + m[0].length);
  const next = rest.search(/^### /m);
  return { when: m[1].trim(), text: (next < 0 ? rest : rest.slice(0, next)).trim() };
}

// Who has been active lately, and where. People, not repos — one person can be in
// several repos and one repo can have several people.
function whosAround() {
  const seen = new Map();
  for (const a of recentActivity()) {
    if (!a.who || !a.ts) continue;
    const prev = seen.get(a.who);
    if (!prev || a.ts > prev.ts) seen.set(a.who, { ts: a.ts, repo: a.repo, event: a.event });
  }
  return people().map(p => ({ ...p, ...(seen.get(p.name) || {}) }))
    .sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')));
}

module.exports = { P, real, TOOLS, TICKET_PREFIX, TICKET_RE, codeRefs, codeMaxTicket, gitConfig, people, writePeople, putPerson, me, personNamed, recentActivity, whosAround, reposFor, latestHandoff, currentTicket, setCurrentTicket, registry, writeRegistry, regGet, regPut, onboarded, offboarded, isOnboarded, discovered, TICKET_STATUS, REPO_STATUS, TRANSITIONS, read, exists, ls, lsMd, atomicWrite, atomicAppend, nowISO, day, daysAgo, repos, repoOf, parse, stringify, sections, slug, pad3, nextNum, createWithId, findTicket, findDecision, loadTicket, sh, coordGit, snapshot, state, setState, isHuman, actor, statusTemplate, ensureStatusFiles, readStatus, activityFile, logActivity, activityLines, lastActivityPerRepo, idDirs };
