#!/usr/bin/env node
'use strict';
// PreToolUse guard. CLAUDE.md is context, not enforcement — this is the enforcement.
// Denies writes into another platform repo, and writes to .coord files this session
// does not own. Reads are never blocked. Silent and allow-by-default everywhere else.
const fs = require('fs'), path = require('path');

// Loaded inside main(), never at the top: everything up here runs outside the try/catch
// at the foot of the file, so a require that throws would exit non-zero with no verdict
// — which the harness reads as "allow". deny() therefore depends on nothing but fs.
let IO = null;

// Which harness called us. Set the moment the payload is read; 'claude' until then, so
// a crash before that still answers in the dialect that needs no exit code.
let DIALECT = 'claude';

function deny(reason) {
  const flat = { permissionDecision: 'deny', permissionDecisionReason: reason };
  try { fs.writeSync(1, JSON.stringify({ ...flat, hookSpecificOutput: { hookEventName: 'PreToolUse', ...flat } })); }
  catch { /* nobody listening */ }
  // Copilot's CLI documents exit 2 as a deny regardless of what stdout said. A guard
  // that fails open enforces nothing, so where we know the harness, use its strongest
  // signal as well as its JSON.
  if (DIALECT === 'copilot') { try { fs.writeSync(2, reason); } catch { /* ignore */ } process.exit(2); }
  process.exit(0);
}

function main() {
  IO = require('./io.js');
  const L = require(path.join(__dirname, '..', 'bin', 'lib.js'));
  const data = IO.input();
  DIALECT = data.dialect;
  const cwd = L.real(data.cwd);
  if (!L.onPlatform(cwd)) return;                 // another project — not ours to police
  if (L.paused()) return;                        // paused on this machine: allow everything

  const own = L.repoOf(cwd);                       // null => platform-root session (onboarding/admin)
  const tool = data.tool, input = data.input;
  if (READ_TOOLS.test(tool)) return;               // reading another repo is always allowed
  const targets = SHELL_TOOLS.test(tool)
    ? bashTargets(String(input.command || input.cmd || input.script || ''))
    : fileTargets(input);

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
// Claude Code's config names the tools this hook sees, so a Read never reaches it. On
// Copilot, preToolUse fires for anything that matched its config and tool names differ
// per harness — and a Read carries a file path exactly like a Write does. So the guard
// has to recognise a read on its own rather than trust the caller to have filtered.
// Reads are never blocked: that promise is load-bearing, so it is checked twice.
const READ_TOOLS = /read|view|cat|grep|search|glob|find|list|fetch|lookup|describe|diagnost/i;
const SHELL_TOOLS = /bash|shell|terminal|command|exec|process/i;

function fileTargets(input) {
  const out = [];
  for (const k of IO.FILE_KEYS) if (typeof input[k] === 'string') out.push({ path: input[k], why: 'this edit' });
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
  // Write-ish commands: every path-looking argument — but only within the segment that
  // actually contains one. A single `cp` used to make every path in a long "a && b && c"
  // line look like a write target, including paths belonging to a plain `cat` further on.
  for (const seg of cmd.split(/\n|;|&&|\|\||\|/)) {
    if (!WRITEISH.test(seg)) continue;
    for (const tok of seg.split(/\s+/)) {
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
  if (L.within(abs, L.P.coord)) {
    return judgeCoord(L, path.relative(L.P.coord, abs).split(path.sep), own, why);
  }
  // Which repo owns this path — by where each one actually sits on this machine, not by
  // assuming they are all folders under one root.
  const seg = Object.entries(L.repoDirs()).find(([, dir]) => L.within(abs, dir));
  if (!seg) return null;                                                // not a repo of ours
  if (seg[0] === own) return null;                                      // your own repo — go ahead

  // Everyone here owns every repo, so a change that genuinely spans two of them is
  // normal work, not a violation. What the guard is for is the UNSANCTIONED version —
  // an agent wandering next door on its own. An in-progress ticket between these two
  // repos is a person having already said yes, in writing, with an id on it.
  const lic = licence(L, own, seg[0]);
  if (lic) return null;

  const where = own ? `You are in ${own}` : 'This session is at the platform root';
  return `${where}, and ${why} writes into ${seg[0]}/. Repos do not edit each other unless a ticket says so. ` +
    `Either work in ${seg[0]} from its own session, or open the change properly:  ` +
    `.coord/bin/coord new --from ${own || '<your repo>'} --to ${seg[0]} --title "..."  ` +
    `— once someone approves it and it is in progress, this write is allowed from here. Reading ${seg[0]}/ is always fine.`;
}

// An in_progress ticket linking the two repos, either direction. Cheap enough to run
// only on the path that is about to be denied.
function licence(L, own, other) {
  if (!own) return null;                                                // platform-root session: no repo to speak for
  try {
    for (const f of L.lsMd(L.P.tickets)) {
      const { fm } = L.parse(L.read(path.join(L.P.tickets, f)));
      if (fm.status !== 'in_progress') continue;
      if ((fm.from === own && fm.to === other) || (fm.from === other && fm.to === own)) return fm.id;
    }
  } catch { /* unreadable board: fall through to the deny */ }
  return null;
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
// Fail CLOSED: if the guard cannot evaluate a call, it blocks rather than waving it
// through — an enforcement hook that fails open enforces nothing.
function failClosed(e) {
  deny(`The coord guard could not evaluate this call and blocks it rather than guessing: ${(e && e.message) || e}. ` +
    `Run ".coord/bin/coord drill" to check the guard, or ".coord/bin/coord pause" to turn ` +
    `everything coord does off on this machine until it is fixed. "coord fix" has the details.`);
}

function logError(e) {
  try {
    const dir = path.join(process.env.COORD_ROOT || path.join(__dirname, '..'), 'activity');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'hook-errors.log'), `${new Date().toISOString()}\tguard\t${(e && e.stack) || e}\n`);
    // The human-facing half: a guard that fails closed blocks real work, so this is the
    // one failure that must never sit unread in a log.
    fs.appendFileSync(path.join(dir, 'failures.log'),
      [new Date().toISOString(), 'guard', String((e && e.message) || e).split('\n')[0].slice(0, 300),
        'coord drill    # then, if it is still broken: coord pause'].join('\t') + '\n');
  } catch { /* a guard that cannot log must still not break the session */ }
}

try { main(); } catch (e) { logError(e); failClosed(e); }
process.exit(0);
