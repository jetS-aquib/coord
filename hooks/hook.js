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
  }
  if (EVENT === 'session-start') {
    const last = L.state().lastArchive;
    if (!last || L.daysAgo(last) > ARCHIVE_EVERY_DAYS) {
      try { require(path.join(__dirname, '..', 'bin', 'archive.js')).archive({}); }
      catch (e) { logError(e); }
    }
  }
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
