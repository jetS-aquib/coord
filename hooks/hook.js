#!/usr/bin/env node
'use strict';
// Agent hook: session-start | session-stop | edit. Claude Code and Copilot both call
// this; hooks/io.js hides the difference between their payloads.
// Rules: do nothing unless the session cwd is inside jetKreate; never print to the
// session; always exit 0; errors go to activity/hook-errors.log.
const fs = require('fs'), path = require('path');
let IO = null;                                        // loaded in main(), inside the try
const EVENT = process.argv[2] || '?';
const ARCHIVE_EVERY_DAYS = 7;

function main() {
  IO = require('./io.js');
  const L = require(path.join(__dirname, '..', 'bin', 'lib.js'));
  const data = IO.input();
  const cwd = L.real(data.cwd);
  if (!L.onPlatform(cwd)) return;                                         // another project — do nothing

  // Paused on this machine: nothing automatic runs. Say so once at session start —
  // silently doing nothing is how someone spends an afternoon wondering why the board
  // never moves. Everything else returns without touching a file.
  const why = L.paused();
  if (why) return EVENT === 'session-start'
    ? emit(`coord is paused on this machine (${why.trim()}). No guard, no board updates, no sync until someone runs: coord resume`)
    : undefined;

  const repo = L.repoOf(cwd) || 'platform-root';

  // A git repo that is not in the registry gets one breadcrumb a day and nothing else:
  // no status file, no snapshot, no edit trail.
  if (repo !== 'platform-root' && !L.isOnboarded(repo)) {
    const mark = `${repo}: discovered, not onboarded`;
    if (!L.read(L.activityFile()).includes(mark)) L.logActivity(repo, mark);
    if (EVENT === 'session-start') brief(L, repo, false);
    return;
  }

  if (EVENT === 'edit') {
    // Claude Code's config only sends us edit tools. Copilot's postToolUse is matched by
    // a regex on a tool name we are guessing at, so anything without a file path is
    // simply not an edit and costs us nothing.
    const f = IO.fileOf(data.input);
    if (!f) return;
    const abs = L.realish(f);
    // The repo that owns the FILE, not the folder the editor happened to be opened on.
    // Someone with every repo in one window edits two of them from one session; filing
    // both under "platform-root" throws away the repo, the overlap warning and the sync,
    // and leaves their work attributed to nothing on a board everyone else reads.
    const owner = (L.repoAt(abs) && L.isOnboarded(L.repoAt(abs))) ? L.repoAt(abs) : repo;
    const base = owner === 'platform-root' ? L.P.root : L.repoDir(owner);
    // An edit outside any repo (a scratchpad, /tmp) relativises to ../../../.. and fills
    // the feed with noise. Those are nobody's work; name the file and move on.
    const rel = path.relative(base, abs);
    const name = !rel || rel.startsWith('..') ? path.basename(f) : rel;
    const others = owner === 'platform-root' ? [] : L.othersOn(owner, name);
    L.logActivity(owner, 'edit', name);
    if (owner !== 'platform-root') { crossRepo(L, repo, owner, name, data.session); autoStart(L, owner); heartbeat(L); }
    if (others.length && firstTimeToday(L, owner, name)) warnOverlap(name, others);
    return;
  }

  L.logActivity(repo, EVENT);

  if (EVENT === 'session-stop') {
    autoHandoff(L, repo);                                 // before the snapshot, so they travel with it
    captureWork(L, repo);
    L.snapshot(`coord: session end (${repo})`);          // guarded: commits inside .coord only
    sync(L);                                              // share the board with the rest of the team
  }
  if (EVENT === 'session-start') {
    const last = L.state().lastArchive;
    if (!last || L.daysAgo(last) > ARCHIVE_EVERY_DAYS) {
      try { require(path.join(__dirname, '..', 'bin', 'archive.js')).archive({}); }
      catch (e) { logError(e); L.logFailure('archive', e.message, 'coord archive'); }
    }
    sync(L);                                             // pick up what the others did
    brief(L, repo, true);
  }
}

// Best-effort: no remote, offline, or a conflict all mean "carry on silently".
// A hook must never block a session over a network call.
function sync(L) {
  try {
    const r = require('child_process').spawnSync(
      process.execPath, [path.join(__dirname, '..', 'bin', 'coord'), 'sync', '--quiet'],
      { encoding: 'utf8', timeout: 15000 });
    if (r.error) return fail(L, r.error);
    if (r.status !== 0) fail(L, (r.stderr || r.stdout || 'sync exited ' + r.status));
  } catch (e) { fail(L, e); }
}
const fail = (L, e) => { logError(e); try { L.logFailure('sync', (e && e.message) || e, 'coord sync'); } catch { /* ignore */ } };

// SessionStart stdout becomes session context, so every session opens knowing its own
// situation without the human mentioning coord. Factual statements, not instructions.
function brief(L, repo, onboarded) {
  const lines = [];
  if (!onboarded) {
    lines.push(`This session's repo "${repo}" is a git repo under the jetKreate platform root but is not onboarded into .coord/repos.json.`);
    lines.push(`It therefore has no status file, no board row, and no coordination history. The platform rules in jetKreate/CLAUDE.md still apply.`);
    lines.push(`The runbook .coord/ONBOARDING.md covers onboarding it; the human starts that by saying "onboard ${repo}".`);
    return emit(lines.join('\n'));
  }

  const tickets = L.lsMd(L.P.tickets).map(f => L.parse(L.read(path.join(L.P.tickets, f))).fm);
  const fmt = t => `  ${t.id} [${L.plain(t.status)}] ${t.from} -> ${t.to}: ${t.title}`;
  // Long lists cost context every session and are never read past the first few.
  const some = (ts, head) => ts.length <= 6 ? `${head}:\n${ts.map(fmt).join('\n')}`
    : `${head} (${ts.length}, newest 5 — the rest: coord list):\n${ts.slice(-5).map(fmt).join('\n')}`;

  if (repo === 'platform-root') {
    lines.push(`This session is at the jetKreate platform root, not inside a repo. Coordination state lives in .coord/.`);
    lines.push(`Onboarded repos: ${L.onboarded().join(', ') || 'none'}.`);
    const disc = L.discovered();
    if (disc.length) lines.push(`Discovered but not onboarded: ${disc.join(', ')}. The runbook is .coord/ONBOARDING.md.`);
    const busy = L.onboarded().map(r => L.readStatus(r)).filter(s => s.status !== 'idle');
    for (const s of busy) lines.push(`  ${s.repo}: ${s.status}${s.task && s.task !== '—' ? ` — ${s.task}` : ''}`);
    if (!busy.length) lines.push(`All of them are idle.`);
    const act = tickets.filter(t => !['done', 'rejected'].includes(t.status));
    lines.push(act.length ? some(act, 'Open requests') : `No open requests.`);
  } else {
    const e = L.regGet(repo) || {};
    const s = L.readStatus(repo);
    lines.push(`This session's repo is "${repo}", an onboarded repo of the jetKreate platform (stack: ${e.stack || 'unrecorded'}).`);
    lines.push(`Its status file .coord/status/${repo}.md currently reads: Status "${s.status}", Current task "${s.task || '—'}", Blockers "${s.blockers || '—'}".`);
    if ((e.contracts || []).length) lines.push(`${repo} owns these contracts: ${e.contracts.join(', ')}.`);
    if ((e.depends_on || []).length) lines.push(`${repo} depends on: ${e.depends_on.join(', ')}.`);

    const inbox = tickets.filter(t => t.to === repo && !['done', 'rejected'].includes(t.status));
    const outbox = tickets.filter(t => t.from === repo && !['done', 'rejected'].includes(t.status));
    lines.push(inbox.length ? some(inbox, `Requests addressed to ${repo}`) : `No open requests are addressed to ${repo}.`);
    if (outbox.length) lines.push(some(outbox, `Requests ${repo} is waiting on`));

    // The point of a session boundary: a new session, a /clear or a compaction should
    // not lose what the last one was in the middle of.
    const on = L.currentTicket(repo);
    if (on) lines.push(`${repo} is currently working on ${on}; its commits are tagged with it. "coord show ${on}" has the plan.`);
    const h = L.latestHandoff(repo);
    if (h) {
      const age = L.daysAgo(h.when);                      // NaN if the heading is not a date
      const when = !isFinite(age) ? 'undated' : age < 1 ? 'earlier today' : age < 2 ? 'yesterday' : `${Math.round(age)} days ago`;
      lines.push(`Where the last session in ${repo} left off (${when}): ${h.text.replace(/\s+/g, ' ').slice(0, 400)}`);
    }
  }

  // Anything automatic that broke on this machine. Nobody opens a log file; this is
  // the one moment a person is guaranteed to be looking.
  const f = L.failures();
  if (f.length) lines.push(`${f.length} coord automation(s) failed on this machine since ${f[f.length - 1].first.slice(0, 10)} (${f.map(x => x.scope).join(', ')}). "coord fix" lists each one with the command that does it by hand.`);

  // The rules themselves are in jetKreate/CLAUDE.md, which loads in every session under
  // this folder. Restating them here would cost ~100 tokens a session to say it twice.
  emit(lines.join('\n'));
}

// Declarations, not consts: main() is called at the top of this file, so anything it
// reaches has to be hoisted. A const here is in the temporal dead zone and throws.
function emit(text) { IO.say('SessionStart', { additionalContext: text }); }

// Somebody else has this file open. Not a lock — a sentence, once, at the moment it is
// still cheap to go and ask them.
// Say it once. The same sentence on every keystroke in a shared file is how a helpful
// tool becomes one people turn off.
const REMIND_AFTER_HOURS = 4;
function firstTimeToday(L, repo, file) {
  const key = `${repo}:${file}`;
  const warned = L.localState().warned || {};
  const last = warned[key];
  if (last && (Date.now() - new Date(last).getTime()) < REMIND_AFTER_HOURS * 3600000) return false;
  L.setLocal({ warned: { ...warned, [key]: L.nowISO() } });
  return true;
}

function warnOverlap(file, others) {
  const who = others.map(o => `${o.who} (${o.event === 'commit' ? 'committed' : 'edited'} it ${ago(o.ts)})`).join(', ');
  IO.say('PostToolUse', {
    additionalContext: `coord: ${who} — same file, ${file}. Worth a word before this turns into a merge conflict. ` +
      `"coord who" shows where everyone is. This comes off the board, so it is as fresh as the last sync.`,
  });
}
function ago(ts) {
  const m = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`;
}

// Push what just happened, at most every few minutes. Session start and stop are too
// coarse to notice a collision while it still matters, and a sync per keystroke would
// be absurd — the activity logs merge by union, so frequent small appends are the one
// thing this board is actually safe doing often.
const HEARTBEAT_MINUTES = 4;                          // read inside heartbeat(), after main()
function heartbeat(L) {
  try {
    const last = L.localState().lastSync;
    if (last && (Date.now() - new Date(last).getTime()) < HEARTBEAT_MINUTES * 60000) return;
    L.setLocal({ lastSync: L.nowISO() });              // claim it first: no thundering herd
    const child = require('child_process').spawn(
      process.execPath, [path.join(__dirname, '..', 'bin', 'coord'), 'sync', '--quiet'],
      { detached: true, stdio: 'ignore' });
    child.unref();                                      // never make the human wait on a push
  } catch (e) { logError(e); }
}

// A session can end in ways nobody plans for: a closed window, /clear, a crash. Asking
// the agent to write a handoff note works right up until the moment it matters, so write
// one from what actually happened — unless the agent already wrote its own this session,
// which will always be the better note.
function autoHandoff(L, repo) {
  try {
    if (repo === 'platform-root') return;
    const since = lastSessionStart(L, repo);
    // >=, not >: these timestamps are second-resolution, and a short session can log its
    // start and its first edit inside the same second.
    const mine = L.recentActivity(2).filter(a => a.repo === repo && a.ts >= since);
    const files = [...new Set(mine.filter(a => a.event === 'edit')
      .map(a => a.line.split('\t').slice(4).join('\t')).filter(Boolean))];
    const commits = mine.filter(a => a.event === 'commit').length;
    if (!files.length && !commits) return;                // a session that changed nothing needs no note

    // A handoff heading is normally a timestamp, but nothing stops someone writing prose
    // there. Compare as dates and treat anything unparseable as old, or one hand-written
    // heading would switch auto-handoff off for that repo forever.
    const existing = L.latestHandoff(repo);
    const had = existing ? Date.parse(existing.when) : NaN;
    if (isFinite(had) && had >= Date.parse(since)) return;   // the agent wrote one — leave it alone

    const t = L.currentTicket(repo);
    const shown = files.slice(0, 8).join(', ') + (files.length > 8 ? `, +${files.length - 8} more` : '');
    L.addHandoff(repo, [
      `Session ended${t ? ` while on ${t}` : ''}.`,
      files.length ? `Touched: ${shown}.` : '',
      commits ? `${commits} commit${commits > 1 ? 's' : ''}.` : 'Nothing committed.',
      `(written automatically — no one said what is next)`,
    ].filter(Boolean).join(' '));
  } catch (e) { logError(e); }
}
// The newest session-start recorded for this repo, or the beginning of time.
function lastSessionStart(L, repo) {
  let ts = '';
  for (const a of L.recentActivity(2)) if (a.repo === repo && a.event === 'session-start' && a.ts > ts) ts = a.ts;
  return ts || '';
}

// If this sitting touched more than one repo, write down that it did. Nobody ever
// records that, and it is the first thing missing months later when someone asks why
// both ends changed on the same afternoon. Silent, never blocking, and the note says
// outright that it was written by a machine and that the reason is not in it.
function captureWork(L, repo) {
  try {
    const slug = require(path.join(__dirname, '..', 'bin', 'capture.js'))
      .capture({ since: lastSessionStart(L, repo) });
    if (slug) L.logActivity(repo, 'context', slug);
  } catch (e) { logError(e); }
}

// This edit landed in a different repo than the session is in, which means the guard
// asked and the person said yes. Record it once: the rest of this session between these
// two repos goes through without asking again, and the feed shows that they moved
// together — which is the fact nobody ever writes down, and the one that is missing
// months later when somebody asks why both ends changed on the same afternoon.
function crossRepo(L, sessionRepo, owner, name, session) {
  try {
    // A session opened on one repo speaks for that repo. A session opened on the folder
    // above them all speaks for whichever repo it first wrote in, which is recorded the
    // first time through here.
    const mine = sessionRepo !== 'platform-root' ? sessionRepo : L.sessionRepo(session);
    if (!mine) return L.setSessionRepo(session, owner);
    if (mine === owner) return;
    if (L.grantLicence(session, mine, owner)) {
      L.logActivity(mine, 'cross-repo', `${mine} + ${owner} — ${path.basename(name)}`);
    }
  } catch (e) { logError(e); }
}

// The board follows the work: if exactly one approved ticket is aimed at this repo and
// someone starts editing it, move it along and point the repo at it. Only when there is
// exactly one candidate — with two, guessing would be worse than doing nothing.
function autoStart(L, repo) {
  try {
    if (L.currentTicket(repo)) return;                 // already pointed at something
    const approved = L.lsMd(L.P.tickets)
      .map(f => L.parse(L.read(path.join(L.P.tickets, f))).fm)
      .filter(fm => fm.status === 'approved' && fm.to === repo);
    if (approved.length !== 1) return;
    const id = approved[0].id;
    require(path.join(__dirname, '..', 'bin', 'rules.js')).transition(id, 'in_progress', 'work started in ' + repo);
    L.setCurrentTicket(repo, id);
    L.logActivity(repo, 'auto-start', id);
  } catch (e) { logError(e); }
}

function logError(e) {
  try {
    const f = path.join(process.env.COORD_ROOT || path.join(__dirname, '..'), 'activity', 'hook-errors.log');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.appendFileSync(f, `${new Date().toISOString()}\t${EVENT}\t${(e && e.stack) || e}\n`);
  } catch { /* a hook that cannot log must still not break the session */ }
}

// Last line, deliberately. Function declarations hoist but `const` does not, so calling
// main() from the top of the file put every module-scope constant below it in the
// temporal dead zone — reading one threw, and this hook swallows its own errors, so the
// overlap warning and the heartbeat sync sat dead for days with nothing to show for it.
// Running main() after the whole file has been evaluated is the fix that stays fixed the
// next time somebody adds a constant.
try { main(); } catch (e) { logError(e); }
process.exit(0);
