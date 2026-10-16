#!/usr/bin/env node
'use strict';
// Claude Code hook: session-start | session-stop | edit
// Rules: do nothing unless the session cwd is inside jetKreate; never print to the
// session; always exit 0; errors go to activity/hook-errors.log.
const fs = require('fs'), path = require('path');
const EVENT = process.argv[2] || '?';
const ARCHIVE_EVERY_DAYS = 7;

try { main(); } catch (e) { logError(e); }
process.exit(0);

function main() {
  const L = require(path.join(__dirname, '..', 'bin', 'lib.js'));
  const data = readInput();
  const cwd = L.real(data.cwd || process.cwd());
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
    const f = data.tool_input && data.tool_input.file_path;
    if (!f) return;
    const base = repo === 'platform-root' ? L.P.root : L.repoDir(repo);
    // An edit outside the repo (a scratchpad, /tmp) relativises to ../../../.. and fills
    // the feed with noise. Those are not this repo's work; name the file and move on.
    const rel = path.relative(base, L.real(path.resolve(f)));
    L.logActivity(repo, 'edit', !rel || rel.startsWith('..') ? path.basename(f) : rel);
    if (repo !== 'platform-root') autoStart(L, repo);
    return;
  }

  L.logActivity(repo, EVENT);

  if (EVENT === 'session-stop') {
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
  const fmt = t => `  ${t.id} [${t.status}] ${t.from} -> ${t.to}: ${t.title}`;
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
    lines.push(act.length ? some(act, 'Open tickets') : `No open tickets.`);
  } else {
    const e = L.regGet(repo) || {};
    const s = L.readStatus(repo);
    lines.push(`This session's repo is "${repo}", an onboarded repo of the jetKreate platform (stack: ${e.stack || 'unrecorded'}).`);
    lines.push(`Its status file .coord/status/${repo}.md currently reads: Status "${s.status}", Current task "${s.task || '—'}", Blockers "${s.blockers || '—'}".`);
    if ((e.contracts || []).length) lines.push(`${repo} owns these contracts: ${e.contracts.join(', ')}.`);
    if ((e.depends_on || []).length) lines.push(`${repo} depends on: ${e.depends_on.join(', ')}.`);

    const inbox = tickets.filter(t => t.to === repo && !['done', 'rejected'].includes(t.status));
    const outbox = tickets.filter(t => t.from === repo && !['done', 'rejected'].includes(t.status));
    lines.push(inbox.length ? some(inbox, `Tickets addressed to ${repo}`) : `No open tickets are addressed to ${repo}.`);
    if (outbox.length) lines.push(some(outbox, `Tickets ${repo} is waiting on`));
  }

  // Anything automatic that broke on this machine. Nobody opens a log file; this is
  // the one moment a person is guaranteed to be looking.
  const f = L.failures();
  if (f.length) lines.push(`${f.length} coord automation(s) failed on this machine since ${f[f.length - 1].first.slice(0, 10)} (${f.map(x => x.scope).join(', ')}). "coord fix" lists each one with the command that does it by hand.`);

  // The rules themselves are in jetKreate/CLAUDE.md, which loads in every session under
  // this folder. Restating them here would cost ~100 tokens a session to say it twice.
  emit(lines.join('\n'));
}

function emit(text) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text },
  }));
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

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
function logError(e) {
  try {
    const f = path.join(__dirname, '..', 'activity', 'hook-errors.log');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.appendFileSync(f, `${new Date().toISOString()}\t${EVENT}\t${(e && e.stack) || e}\n`);
  } catch { /* a hook that cannot log must still not break the session */ }
}
