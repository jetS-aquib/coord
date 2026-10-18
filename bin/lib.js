'use strict';
// Shared core for the coord CLI, hooks and dashboard. No external deps.
// Root resolution: COORD_ROOT env (used by `coord drill`) or this file's grandparent.
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');

// realpath everywhere: on macOS /var is a symlink to /private/var, and git reports the resolved
// path — comparing unresolved paths silently breaks repo detection and the .coord git guard.
const real = p => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };

// A file that does not exist yet cannot be realpath'd, and the fallback leaves the path
// unresolved — so on macOS a brand-new file under /var compares against a repo recorded
// under /private/var and looks like it is somewhere else entirely. Resolve the deepest
// ancestor that does exist and re-append the rest.
function realish(p) {
  let cur = path.resolve(p);
  const tail = [];
  for (let i = 0; i < 64; i++) {
    try { return path.join(fs.realpathSync(cur), ...tail); } catch { /* keep walking up */ }
    const parent = path.dirname(cur);
    if (parent === cur) return path.resolve(p);
    tail.unshift(path.basename(cur));
    cur = parent;
  }
  return path.resolve(p);
}

const isWindows = process.platform === 'win32';

const COORD = real(process.env.COORD_ROOT || path.join(__dirname, '..'));
const P = {
  coord: COORD,
  root: real(path.resolve(COORD, '..')),
  status: path.join(COORD, 'status'),
  tickets: path.join(COORD, 'tickets'),
  decisions: path.join(COORD, 'decisions'),
  contracts: path.join(COORD, 'contracts'),
  context: path.join(COORD, 'context'),
  activity: path.join(COORD, 'activity'),
  archive: path.join(COORD, 'archive'),
  state: path.join(COORD, 'state.json'),
  registry: path.join(COORD, 'repos.json'),
  people: path.join(COORD, 'people.json'),
  paths: path.join(COORD, 'paths.json'),
  local: path.join(COORD, 'local.json'),
  notify: path.join(COORD, 'notify.json'),
};

/* ---------- where each repo lives ON THIS MACHINE ---------- */
// The board is shared; disks are not. One dev keeps every repo under the platform root,
// the next has them spread over ~/work and D:\code. So repos.json holds what is true
// everywhere (name, clone URL) and paths.json holds what is true here. Never committed —
// a teammate's absolute path is worse than useless on your machine.
function pathMap() {
  try { const j = JSON.parse(read(P.paths, '{}')); return j && typeof j.paths === 'object' ? j.paths : {}; }
  catch { return {}; }
}
function setRepoPath(name, dir) {
  const paths = pathMap();
  if (dir) paths[name] = real(path.resolve(dir)); else delete paths[name];
  atomicWrite(P.paths, JSON.stringify({ version: 1, updated: nowISO(), paths }, null, 2) + '\n');
  _dirs = undefined;
  return paths[name] || null;
}
// The default stays the simple case: a folder next to the board. Nobody who keeps their
// repos together ever has to know paths.json exists.
const repoDir = name => pathMap()[name] || path.join(P.root, name);
const isRepoAt = dir => exists(path.join(dir, '.git'));
// Windows compares paths without case; a drive letter typed either way must still match.
const key = p => (isWindows ? p.toLowerCase() : p);
const within = (abs, dir) => key(abs) === key(dir) || key(abs).startsWith(key(dir) + path.sep);

// The repos already carry `JET-nnn` tags in comments — a documented convention
// ("issue tags mark why code exists"). coord continues that series rather than
// inventing a second one.
const TICKET_PREFIX = 'JET';
const TICKET_RE = new RegExp(`${TICKET_PREFIX}-\\d+`, 'g');

const TICKET_STATUS = ['open', 'approved', 'in_progress', 'review', 'done', 'rejected'];

// The lifecycle is real and the CLI still enforces every step of it. What a person reads
// is never more than three words. Nobody should have to learn a workflow to answer a
// question, and "in_progress" tells a dev nothing they cannot see in the diff.
const PLAIN = {
  open: 'waiting', review: 'waiting',              // waiting on a person
  approved: 'go', in_progress: 'go',               // nothing is waiting; it is being done
  done: 'done', rejected: 'dropped',
};
const plain = s => PLAIN[s] || s;
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
// Every repo ON THIS MACHINE: the registered ones wherever they live, plus any git
// folder sitting beside the board that nobody has onboarded yet. A repo on the board but
// not on this disk is simply absent here — that is normal, you clone what you work on.
let _dirs;
function repoDirs() {                         // { name: absolute dir } for what is actually here
  if (_dirs) return _dirs;
  const out = {};
  for (const e of registry()) {
    const dir = real(repoDir(e.name));
    if (isRepoAt(dir)) out[e.name] = dir;
  }
  let here = [];
  try { here = fs.readdirSync(P.root, { withFileTypes: true }); } catch { /* root may not be readable */ }
  for (const d of here) {
    if (!d.isDirectory() || d.name.startsWith('.') || out[d.name]) continue;
    const dir = real(path.join(P.root, d.name));
    // never a platform repo: this coord dir, or any other clone of it sitting alongside
    if (!isRepoAt(dir) || dir === P.coord || exists(path.join(dir, 'bin', 'coord'))) continue;
    out[d.name] = dir;
  }
  return (_dirs = out);
}
const repos = () => Object.keys(repoDirs()).sort();

function repoOf(dir) {                        // repo owning a directory, or null
  const r = sh('git', ['rev-parse', '--show-toplevel'], dir);
  if (!r.ok) return null;
  const top = real(r.out);
  for (const [name, d] of Object.entries(repoDirs())) if (key(d) === key(top)) return name;
  return null;                                // .coord, and anything not on the platform
}
// Is this directory inside the platform at all — the board, the root, or any repo of it?
function onPlatform(dir) {
  const d = real(dir);
  if (within(d, P.root) || within(d, P.coord)) return true;
  return Object.values(repoDirs()).some(r => within(d, r));
}

/* ---------- registry (repos.json) — written only by the CLI ---------- */
function registry() {
  try { const j = JSON.parse(read(P.registry, '{}')); return Array.isArray(j.repos) ? j.repos : []; }
  catch { return []; }
}
// repos.json is SHARED, so nothing in it may describe one machine. Where a repo sits on
// disk lives in paths.json; `path` here is a leftover from before that existed and is
// dropped on every write, so an older clone cannot reintroduce it.
const shareable = ({ path: _drop, ...rest }) => rest;
const writeRegistry = list => atomicWrite(P.registry,
  JSON.stringify({ version: 1, updated: nowISO(), repos: [...list].map(shareable).sort((a, b) => a.name.localeCompare(b.name)) }, null, 2) + '\n');
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
function gitConfig(k) {
  // Ask from inside a platform repo so git applies its own local > global precedence.
  for (const r of repos()) {
    const v = sh('git', ['config', k], repoDir(r));
    if (v.ok && v.out) return v.out;
  }
  const g = sh('git', ['config', '--global', k], os.tmpdir());     // no repos cloned yet
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

/* ---------- scanning the repos' source ---------- */
// A plain JS walk, no spawn. Started as a Windows fallback (no grep outside Git Bash)
// and replaced grep outright: measured over these three repos it returns the identical
// 41 refs for JET-154 in 1.4s against grep's 40s, because it rejects a file on
// `includes('JET')` before any regex runs. One code path, same on every OS.
const SRC_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo']);

function walkFiles(dir, exts, fn, depth = 0) {
  if (depth > 12) return;
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walkFiles(f, exts, fn, depth + 1); }
    else if (exts.includes(path.extname(e.name))) fn(f);
  }
}

// Matches of `re` under one repo, as { repo, file, line, text }.
function scanRepo(repo, exts, re) {
  const base = repoDir(repo), out = [];
  const rx = new RegExp(re.source, 'g');
  walkFiles(base, exts, f => {
    let text;
    try { if (fs.statSync(f).size > 2e6) return; text = fs.readFileSync(f, 'utf8'); } catch { return; }
    if (!text.includes(TICKET_PREFIX)) return;                  // cheap reject before the regex
    text.split('\n').forEach((line, i) => {
      rx.lastIndex = 0;
      for (const m of line.matchAll(rx)) out.push({ repo, file: path.relative(base, f).split(path.sep).join('/'), line: i + 1, text: m[0].trim() });
    });
  });
  return out;
}

// Highest JET-nnn appearing anywhere in the repos' source. Keeps new ids clear of the
// 646 references already in comments, and self-corrects if someone cites a higher one.
function codeMaxTicket() {
  let max = 0;
  // source only: a JET-nnn inside a markdown example is documentation, not a claim on
  // that id, and counting it would inflate the sequence every time we write a doc.
  const re = new RegExp(`${TICKET_PREFIX}-[0-9]+`);
  for (const r of repos()) for (const hit of scanRepo(r, SRC_EXT, re)) {
    const n = Number((TICKET_RE.exec(hit.text) || [''])[0].split('-')[1] || hit.text.split('-')[1]);
    TICKET_RE.lastIndex = 0;
    if (isFinite(n)) max = Math.max(max, n);
  }
  return max;
}

// Every place in the repos that cites a ticket id, with the line it sits on.
const codeRefs = id => repos().flatMap(r => scanRepo(r, [...SRC_EXT, '.md'], new RegExp(`.{0,90}${id}\\b.{0,40}`)));
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
// The board, not the toolchain. `add -A` would sweep half-finished edits to bin/ or
// hooks/ into a commit labelled "session end" — true of anyone working on coord itself.
const BOARD_PATHS = ['status', 'tickets', 'decisions', 'contracts', 'context', 'activity',
  'archive', 'repos.json', 'people.json', 'state.json', 'notify.json', '.gitattributes', '.gitignore'];
function snapshot(msg) {
  const here = BOARD_PATHS.filter(p => exists(path.join(P.coord, p)));
  if (!here.length || !coordGit(['add', '-A', '--', ...here]).ok) return false;
  if (sh('git', ['diff', '--cached', '--quiet'], P.coord).ok) return false;   // nothing changed
  return coordGit(['commit', '-q', '-m', msg]).ok;
}

/* ---------- state ---------- */
// state.json is SHARED: it travels with the board, so only things that are true for
// everyone belong in it (lastArchive — the archive moved files for all of us).
const state = () => { try { return JSON.parse(read(P.state, '{}')); } catch { return {}; } };
const setState = patch => atomicWrite(P.state, JSON.stringify({ ...state(), ...patch }, null, 2) + '\n');

// local.json is this machine's own: when I last synced, when I last nagged. Shared, it
// would conflict on every single sync — two people cannot both be the last to sync.
const localState = () => { try { return JSON.parse(read(P.local, '{}')); } catch { return {}; } };
const setLocal = patch => atomicWrite(P.local, JSON.stringify({ ...localState(), ...patch }, null, 2) + '\n');

// notify.json is SHARED and committed: "the board has already nudged about JET-003" is
// true for everyone. It cannot live on a machine, because the thing that sends runs in
// CI on a fresh checkout every time and would otherwise nudge daily forever.
// Most cross-repo work here is one person changing both ends in one sitting. Making
// them file a request and then approve their own request is theatre, so the guard asks
// once instead, and a yes licenses that pair of repos for the rest of the session.
// Local to this machine and short-lived on purpose: this is about one sitting, not a
// policy, and it must never travel to anyone else's board.
const LICENCE_HOURS = 12;
function licences() {
  const all = localState().licences || {};
  const live = {}, cut = Date.now() - LICENCE_HOURS * 3600000;
  for (const [k, v] of Object.entries(all)) if (new Date(v).getTime() > cut) live[k] = v;
  return live;
}
const licenceKey = (sid, a, b) => `${sid || 'no-session'}:${[a, b].sort().join('+')}`;
const hasLicence = (sid, a, b) => !!licences()[licenceKey(sid, a, b)];
function grantLicence(sid, a, b) {
  const live = licences();
  if (live[licenceKey(sid, a, b)]) return false;              // already said yes this session
  live[licenceKey(sid, a, b)] = nowISO();
  setLocal({ licences: live });
  return true;
}

const notifyState = () => { try { return JSON.parse(read(P.notify, '{}')); } catch { return {}; } };
const setNotify = patch => atomicWrite(P.notify, JSON.stringify({ ...notifyState(), ...patch }, null, 2) + '\n');

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
  for (const d of [P.status, P.tickets, P.decisions, P.contracts, P.context, P.activity, P.archive]) fs.mkdirSync(d, { recursive: true });
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
const ticketPointer = repo => path.join(repoDir(repo), '.git', 'coord-ticket');
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

/* ---------- who else is in this file ---------- */
// Not a lock and not a presence server — just the activity log, which already records
// every edit, read back the other way round. Two people on one component usually find
// out at merge time; this is the same information a few hours earlier, and it costs
// nobody a new habit because the edits were already being logged.
function othersOn(repo, file, minutes = 180) {
  const me_ = me(), cut = Date.now() - minutes * 60000, seen = new Map();
  for (const a of recentActivity(2)) {
    if (a.repo !== repo || !a.who || a.who === me_) continue;
    if (!['edit', 'commit'].includes(a.event)) continue;
    const extra = a.line.split('\t').slice(4).join('\t');
    if (!extra || !sameFile(extra, file)) continue;
    if (new Date(a.ts).getTime() < cut) continue;
    const prev = seen.get(a.who);
    if (!prev || a.ts > prev.ts) seen.set(a.who, { who: a.who, ts: a.ts, event: a.event });
  }
  return [...seen.values()].sort((a, b) => b.ts.localeCompare(a.ts));
}
// An edit logs a path; a commit logs "<sha> <subject>". Match a path either way, and
// compare on the basename too so a commit message mentioning the file still counts.
function sameFile(extra, file) {
  const norm = s => s.replace(/\\/g, '/');
  const f = norm(file), b = f.split('/').pop();
  const e = norm(extra);
  return e === f || e.endsWith('/' + f) || f.endsWith('/' + e) || (b.length > 3 && e.includes(b));
}

// How stale is the board? You cannot trust what you are looking at without this.
function lastSync() {
  const s = localState().lastSync;
  return s ? { at: s, minutes: Math.round((Date.now() - new Date(s).getTime()) / 60000) } : null;
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

// Add a "### <timestamp>" block at the top of Handoff notes. Newest first, so a new
// session reads the latest one without scrolling — and so does the next person.
function addHandoff(repo, text) {
  const f = path.join(P.status, `${repo}.md`);
  const t = read(f);
  const head = '## Handoff notes';
  const i = t.indexOf(head);
  if (i < 0) return false;
  const cut = i + head.length;
  const rest = t.slice(cut);
  // keep the template comment line, if it is still there, above the notes
  const m = /^\s*\n(<!--[\s\S]*?-->\n)?/.exec(rest);
  const keep = (m && m[1]) || '';
  const after = rest.slice(m ? m[0].length : 0).replace(/^\n+/, '');
  atomicWrite(f, `${t.slice(0, cut)}\n\n${keep}### ${nowISO()}\n\n${text.trim()}\n${after ? '\n' + after : ''}`);
  return true;
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

/* ---------- failures: anything automatic that did not work ---------- */
// hook-errors.log is a stack dump nobody reads. This is the half a human can act on:
// one line per failure, carrying the command that does the same job by hand. Local to
// this machine (gitignored) — someone else's broken hook is not the team's business.
const FAIL_LOG = () => path.join(P.activity, 'failures.log');
const oneLine = s => String(s == null ? '' : s).split('\n')[0].replace(/\t/g, ' ').slice(0, 300);
function logFailure(scope, msg, remedy = '') {
  try { atomicAppend(FAIL_LOG(), [nowISO(), scope, oneLine(msg), oneLine(remedy)].join('\t') + '\n'); }
  catch { /* a failure logger that fails must not throw */ }
}
// Newest first, one row per (scope + remedy) with a count — a hook that broke 40 times
// is one problem, not forty.
function failures() {
  const by = new Map();
  for (const line of read(FAIL_LOG()).split('\n')) {
    if (!line) continue;
    const [ts, scope, msg, remedy = ''] = line.split('\t');
    if (!ts || !scope) continue;
    const k = scope + '\u0000' + remedy;
    const prev = by.get(k);
    by.set(k, { ts, scope, msg, remedy, n: (prev ? prev.n : 0) + 1, first: prev ? prev.first : ts });
  }
  return [...by.values()].sort((a, b) => b.ts.localeCompare(a.ts));
}
// With no scope, forget everything; with one, forget only that scope — a sync that
// finally works says nothing about a guard that is still crashing.
function clearFailures(scope) {
  try {
    if (!scope) return fs.rmSync(FAIL_LOG());
    const keep = read(FAIL_LOG()).split('\n').filter(l => l && l.split('\t')[1] !== scope);
    if (keep.length) atomicWrite(FAIL_LOG(), keep.join('\n') + '\n'); else fs.rmSync(FAIL_LOG());
  } catch { /* already clean */ }
}

/* ---------- pause: the escape hatch ---------- */
// Everything automatic is off on this machine until resumed: no guard, no briefing, no
// sync, no commit hooks. A coordination tool that can wedge someone's day with no way
// out is worse than no coordination tool. Local file, never committed.
const PAUSE_FILE = () => path.join(P.coord, 'paused');
const paused = () => exists(PAUSE_FILE()) ? (read(PAUSE_FILE()).trim() || 'paused') : null;
function setPaused(on, why = '') {
  if (!on) { try { fs.rmSync(PAUSE_FILE()); } catch { /* already running */ } return false; }
  atomicWrite(PAUSE_FILE(), `paused by ${me() || 'someone'} at ${nowISO()}${why ? ' — ' + why : ''}\n`);
  return true;
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

module.exports = { P, plain, real, realish, TOOLS, hasLicence, grantLicence, licences, isWindows, scanRepo, othersOn, lastSync, addHandoff, localState, setLocal, notifyState, setNotify, repoDir, repoDirs, setRepoPath, pathMap, onPlatform, within, isRepoAt, SRC_EXT, logFailure, failures, clearFailures, paused, setPaused, TICKET_PREFIX, TICKET_RE, codeRefs, codeMaxTicket, gitConfig, people, writePeople, putPerson, me, personNamed, recentActivity, whosAround, reposFor, latestHandoff, currentTicket, setCurrentTicket, registry, writeRegistry, regGet, regPut, onboarded, offboarded, isOnboarded, discovered, TICKET_STATUS, REPO_STATUS, TRANSITIONS, read, exists, ls, lsMd, atomicWrite, atomicAppend, nowISO, day, daysAgo, repos, repoOf, parse, stringify, sections, slug, pad3, nextNum, createWithId, findTicket, findDecision, loadTicket, sh, coordGit, snapshot, state, setState, isHuman, actor, statusTemplate, ensureStatusFiles, readStatus, activityFile, logActivity, activityLines, lastActivityPerRepo, idDirs };
