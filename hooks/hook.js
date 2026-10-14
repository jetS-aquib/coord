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
  if (cwd !== L.P.root && !cwd.startsWith(L.P.root + path.sep)) return;   // another project — do nothing

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
    const base = repo === 'platform-root' ? L.P.root : path.join(L.P.root, repo);
    L.logActivity(repo, 'edit', path.relative(base, L.real(path.resolve(f))) || path.basename(f));
    return;
  }

  L.logActivity(repo, EVENT);

  if (EVENT === 'session-stop') {
    L.snapshot(`coord: session end (${repo})`);          // guarded: commits inside .coord only
    sync();                                              // share the board with the rest of the team
  }
  if (EVENT === 'session-start') {
    const last = L.state().lastArchive;
    if (!last || L.daysAgo(last) > ARCHIVE_EVERY_DAYS) {
      try { require(path.join(__dirname, '..', 'bin', 'archive.js')).archive({}); }
      catch (e) { logError(e); }
    }
    sync();                                              // pick up what the others did
    brief(L, repo, true);
  }
}

// Best-effort: no remote, offline, or a conflict all mean "carry on silently".
// A hook must never block a session over a network call.
function sync() {
  try {
    const r = require('child_process').spawnSync(
      process.execPath, [path.join(__dirname, '..', 'bin', 'coord'), 'sync', '--quiet'],
      { encoding: 'utf8', timeout: 15000 });
    if (r.error) logError(r.error);
  } catch (e) { logError(e); }
}

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

  if (repo === 'platform-root') {
    lines.push(`This session is at the jetKreate platform root, not inside a repo. Coordination state lives in .coord/.`);
    lines.push(`Onboarded repos: ${L.onboarded().join(', ') || 'none'}.`);
    const disc = L.discovered();
    if (disc.length) lines.push(`Discovered but not onboarded: ${disc.join(', ')}. The runbook is .coord/ONBOARDING.md.`);
    for (const r of L.onboarded()) {
      const s = L.readStatus(r);
      lines.push(`  ${r}: ${s.status}${s.task && s.task !== '—' ? ` — ${s.task}` : ''}`);
    }
    const act = tickets.filter(t => !['done', 'rejected'].includes(t.status));
    lines.push(act.length ? `Open tickets:\n${act.map(fmt).join('\n')}` : `No open tickets.`);
  } else {
    const e = L.regGet(repo) || {};
    const s = L.readStatus(repo);
    lines.push(`This session's repo is "${repo}", an onboarded repo of the jetKreate platform (stack: ${e.stack || 'unrecorded'}).`);
    lines.push(`Its status file .coord/status/${repo}.md currently reads: Status "${s.status}", Current task "${s.task || '—'}", Blockers "${s.blockers || '—'}".`);
    if ((e.contracts || []).length) lines.push(`${repo} owns these contracts: ${e.contracts.join(', ')}.`);
    if ((e.depends_on || []).length) lines.push(`${repo} depends on: ${e.depends_on.join(', ')}.`);

    const inbox = tickets.filter(t => t.to === repo && !['done', 'rejected'].includes(t.status));
    const outbox = tickets.filter(t => t.from === repo && !['done', 'rejected'].includes(t.status));
    lines.push(inbox.length ? `Tickets addressed to ${repo}:\n${inbox.map(fmt).join('\n')}` : `No open tickets are addressed to ${repo}.`);
    if (inbox.some(t => t.status === 'approved')) lines.push(`Approved tickets are the ones cleared to start, with: coord start <id>.`);
    if (outbox.length) lines.push(`Tickets ${repo} is waiting on:\n${outbox.map(fmt).join('\n')}`);
  }

  lines.push(`Writes into other repos, and into .coord files this repo does not own, are blocked by a PreToolUse hook — not by convention. Cross-repo changes go through: .coord/bin/coord new --from ${repo === 'platform-root' ? '<repo>' : repo} --to <repo> --title "..."`);
  lines.push(`The full rules are in jetKreate/CLAUDE.md, loaded automatically from the parent directory. The CLI is .coord/bin/coord (list, show, new, start, review, why, search, check).`);
  emit(lines.join('\n'));
}

function emit(text) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text },
  }));
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
