#!/usr/bin/env node
'use strict';
// PreToolUse guard. CLAUDE.md is context, not enforcement — this is the enforcement.
// Denies writes into another platform repo, and writes to .coord files this session
// does not own. Reads are never blocked. Silent and allow-by-default everywhere else.
const fs = require('fs'), path = require('path');

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}

function main() {
  const L = require(path.join(__dirname, '..', 'bin', 'lib.js'));
  const data = readInput();
  const cwd = L.real(data.cwd || process.cwd());
  if (cwd !== L.P.root && !cwd.startsWith(L.P.root + path.sep)) return;   // another project — not ours to police

  const own = L.repoOf(cwd);                       // null => platform-root session (onboarding/admin)
  const tool = data.tool_name || '';
  const input = data.tool_input || {};
  const targets = tool === 'Bash' ? bashTargets(String(input.command || '')) : fileTargets(input);

  for (const t of targets) {
    const abs = realish(path.resolve(cwd, t.path));
    const verdict = judge(L, abs, own, t.why);
    if (verdict) deny(verdict);
  }
}

// A target that does not exist yet (a Write) cannot be realpath'd, so resolve the
// deepest ancestor that does and re-append the rest. Without this, /var vs /private/var
// on macOS makes every cross-repo path look like it is outside the platform.
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

/* ---------- what the tool is about to write ---------- */
function fileTargets(input) {
  const out = [];
  for (const k of ['file_path', 'notebook_path', 'path']) if (typeof input[k] === 'string') out.push({ path: input[k], why: 'this edit' });
  return out;
}

// Best-effort for Bash: only commands that can write, and only when a path argument
// actually resolves into another repo. Reads (cat/grep/ls) never match.
const WRITEISH = /(^|[;&|]\s*)(sed\s+-i|tee|cp|mv|rm|truncate|dd|rsync|install|touch|mkdir|chmod|chown|ln)\b/;
const GIT_WRITE = /\bgit\s+(?:-C\s+(\S+)\s+)?(commit|push|add|checkout|switch|reset|revert|merge|rebase|stash|clean|apply|am|cherry-pick|tag|branch\s+-[dD])\b/g;

function bashTargets(cmd) {
  const out = [];
  // redirections:  > file   >> file
  for (const m of cmd.matchAll(/(?:^|[^>\d])>>?\s*(?:"([^"]+)"|'([^']+)'|([^\s;|&)]+))/g)) {
    const p = m[1] || m[2] || m[3];
    if (p && !p.startsWith('/dev/') && !p.startsWith('&')) out.push({ path: p, why: 'this shell redirection' });
  }
  // write-ish commands: every path-looking argument
  if (WRITEISH.test(cmd)) {
    for (const tok of cmd.split(/\s+/)) {
      const p = tok.replace(/^['"]|['"]$/g, '');
      if (p.includes('/') && !p.startsWith('-') && !p.startsWith('/dev/')) out.push({ path: p, why: 'this shell command' });
    }
  }
  // git write subcommands aimed elsewhere with -C
  for (const m of cmd.matchAll(GIT_WRITE)) {
    if (m[1]) out.push({ path: m[1], why: `this git ${m[2]}` });
  }
  return out;
}

/* ---------- the rules ---------- */
function judge(L, abs, own, why) {
  const rel = path.relative(L.P.root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;        // outside the platform entirely
  const seg = rel.split(path.sep)[0];

  if (seg === '.coord') return judgeCoord(L, rel.split(path.sep).slice(1), own, why);

  if (!L.repos().includes(seg)) return null;                            // not a repo folder
  if (seg === own) return null;                                         // your own repo — go ahead

  const where = own ? `You are in ${own}` : 'This session is at the platform root';
  return `${where}, and ${why} writes into ${seg}/. Repos never edit each other. ` +
    `File a ticket instead:  .coord/bin/coord new --from ${own || '<your repo>'} --to ${seg} --title "..."  ` +
    `then tell the human and stop. Reading ${seg}/ is fine.`;
}

function judgeCoord(L, parts, own, why) {
  const [dir, file = ''] = parts;

  if (dir === 'repos.json') return `repos.json is written only by the CLI (${why} would hand-edit it). Use: coord onboard <repo> --apply  /  coord offboard <repo> --yes`;

  if (dir === 'people.json') return `people.json is written only by the CLI (${why} would hand-edit it). Use: coord setup  /  coord who --tool <tool>`;

  if (dir === 'decisions') {
    if (file === 'index.md') return `decisions/index.md is rebuilt by the CLI (${why} would hand-edit it). Use: coord decide ...`;
    return `Decision records are immutable and CLI-written (${why} targets ${file}). Use: coord decide ... , or coord supersede <old> <new> to retire one.`;
  }

  if (dir === 'status' && file.endsWith('.md')) {
    const repo = file.replace(/\.md$/, '');
    if (own && repo !== own) return `status/${file} belongs to ${repo}; you are ${own}. Each repo writes only its own status file.`;
    return null;
  }

  if (dir === 'contracts' && file.endsWith('.md') && own) {
    const f = path.join(L.P.contracts, file);
    if (!L.exists(f)) return null;                                      // a new stub is fine
    const { fm } = L.parse(L.read(f));
    if (fm.owner && fm.owner !== own) {
      return `contracts/${file} is owned by ${fm.owner}; you are ${own}. Only the owner edits a contract, and only under an approved ticket. Reading it is fine.`;
    }
  }
  return null;
}

/* ---------- plumbing ---------- */
function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
// Fail CLOSED: if the guard cannot evaluate a call, it blocks rather than waving it
// through — an enforcement hook that fails open enforces nothing.
function failClosed(e) {
  deny(`The coord guard could not evaluate this call and blocks it rather than guessing: ${(e && e.message) || e}. ` +
    `Details in .coord/activity/hook-errors.log. Run ".coord/bin/coord drill" to check the guard, ` +
    `or remove the guard.js PreToolUse hook from ~/.claude/settings.json to disable it.`);
}

function logError(e) {
  try {
    const f = path.join(__dirname, '..', 'activity', 'hook-errors.log');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.appendFileSync(f, `${new Date().toISOString()}\tguard\t${(e && e.stack) || e}\n`);
  } catch { /* a guard that cannot log must still not break the session */ }
}

try { main(); } catch (e) { logError(e); failClosed(e); }
process.exit(0);
