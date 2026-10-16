'use strict';
// Per-machine, per-repo setup. Editor-agnostic: git hooks are the one thing every dev
// shares whatever they code in. Hooks live in .git/hooks (local, never committed).
// The Copilot instruction file is the single TRACKED file, left uncommitted for review —
// so it must never contain a machine-specific path. Everyone puts `coord` on their PATH.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const { P } = L;

const COORD_BIN = path.join(P.coord, 'bin', 'coord');
const AGENTS_BEGIN = '<!-- BEGIN:coord -->', AGENTS_END = '<!-- END:coord -->';

/* ---------- hook bodies (absolute paths are fine here: never committed) ---------- */
const commitMsg = () => `#!/bin/sh
# installed by: coord devsetup — local to this clone, never committed.
# Warns when a commit message carries no ticket ID. To reject instead:
#   coord devsetup --strict        (or export COORD_STRICT=1)
COORD_ROOT="${P.coord}"

# "coord pause" switches everything off on this machine. Nothing below runs until resume.
[ -f "$COORD_ROOT/paused" ] && exit 0

MSG=$(head -1 "$1")
case "$MSG" in
  JET-[0-9]*:*|no-ticket:*|Merge\\ *|Revert\\ *|fixup!*|squash!*|amend!*) exit 0 ;;
esac

STRICT=0
[ -n "$COORD_STRICT" ] && STRICT=1
[ -f "$(dirname "$0")/../coord-strict" ] && STRICT=1

# Default is silent: prepare-commit-msg already added the ID when it knew one, and a
# commit with no ticket is a normal thing. coord why falls back to time-matching.
if [ "$STRICT" = "1" ]; then
  printf '\\n  coord: REJECTED — no ticket ID.\\n  Use "JET-193: %s" or "no-ticket: %s"\\n\\n' "$MSG" "$MSG" >&2
  exit 1
fi
exit 0
`;

// Writes the ticket prefix the dev would otherwise have to remember. Silent when it
// has nothing to add — plenty of commits genuinely have no ticket.
const prepareCommitMsg = () => `#!/bin/sh
# installed by: coord devsetup — local to this clone, never committed.
COORD_ROOT="${P.coord}"

# "coord pause" switches everything off on this machine. Nothing below runs until resume.
[ -f "$COORD_ROOT/paused" ] && exit 0

MSGFILE="$1"
SOURCE="$2"
case "$SOURCE" in merge|squash) exit 0 ;; esac

FIRST=$(head -1 "$MSGFILE")
case "$FIRST" in
  JET-[0-9]*:*|no-ticket:*|Merge\\ *|Revert\\ *|fixup!*|squash!*|amend!*) exit 0 ;;
esac

TICKET=$(cat "$(dirname "$0")/../coord-ticket" 2>/dev/null | tr -d '[:space:]')
[ -n "$TICKET" ] || exit 0

printf '%s: %s\\n' "$TICKET" "$FIRST" > "$MSGFILE.coord"
tail -n +2 "$MSGFILE" >> "$MSGFILE.coord"
mv "$MSGFILE.coord" "$MSGFILE"
exit 0
`;

const postCommit = () => `#!/bin/sh
# installed by: coord devsetup — local to this clone, never committed.
# Records the commit on the board, then syncs .coord if it has a remote. Never blocks.
COORD="${COORD_BIN}"
COORD_ROOT="${P.coord}"
export COORD_ROOT

# "coord pause" switches everything off on this machine. Nothing below runs until resume.
[ -f "$COORD_ROOT/paused" ] && exit 0

[ -x "$COORD" ] || exit 0
# Silent on success and on failure alike — a commit must never be held up by the board.
# What failed is recorded by coord itself and shown by "coord fix".
"$COORD" log-commit >/dev/null 2>&1
"$COORD" sync --quiet >/dev/null 2>&1
exit 0
`;

/* ---------- the tracked instruction file: no paths, Copilot does not read parent dirs ---------- */
function copilotDoc(repo) {
  const e = L.regGet(repo) || {};
  const all = L.onboarded();
  const others = all.filter(r => r !== repo);
  const contracts = e.contracts || [];
  const deps = e.depends_on || [];

  return [
    `# ${repo} — platform rules`,
    '',
    // Name the siblings while there are few enough to be useful; past that the list is
    // churn in a tracked file and ``coord repos`` is the better answer.
    `This repo is one of ${all.length} in the jetKreate platform${
      others.length === 0 ? '' : others.length <= 4 ? ` (the others: ${others.join(', ')})` : ' — run ``coord repos`` to see them all'}.`,
    'Coordination for all of them lives in a separate repo, `jetkreate-coord`, cloned beside',
    'this one. Its CLI is `coord`. If that command is not found, read that repo\'s README.',
    'It is markdown files, not a service. Read it.',
    '',
    '## Start of every session',
    '',
    'Run `coord` first, every time. Claude Code has a hook that injects this; you do not, so it is',
    'the one thing to do by hand. It prints what this repo is on, what is waiting on a person, and',
    'where the last session left off — which is how work survives a new chat window.',
    '',
    `Before you stop, update \`.coord/status/${repo}.md\`: Current task, Status, and a handoff note`,
    'at the top of Handoff notes saying what you did and what is next. The next session, yours or',
    'someone else\u2019s, starts by reading that note.',
    '',
    '## Hard rules',
    '',
    '- **Never edit files in another repo on your own initiative.** Reading them is always fine.',
    '- Once a ticket between the two repos is `in_progress`, writes to both are allowed —',
    '  someone approved it, so the change is sanctioned and carries an id.',
    '- Need a change in another repo? Create a ticket, tell the human, and stop:',
    `  \`coord new --from ${repo} --to <repo> --title "..." --understanding "..." --plan "..."\``,
    '  It does nothing until a human approves it.',
    '- **Always fill `--understanding` and `--plan`.** Understanding is the request restated in',
    '  your own words with every assumption spelled out; Plan is the steps you intend to take, one',
    '  line each. That is what the person reads before approving, and the cheapest place to catch a',
    '  misunderstanding. `coord show <id>` renders it and prints the commands for answering.',
    '- Asked a question on a ticket? Answer with `coord note <id> "..."` — it adds to the thread',
    '  without moving the ticket.',
    `- Only act on a ticket addressed to ${repo} after a human has approved it.`,
    '- **Every commit message starts with the ticket ID** — `JET-nnn: add GET /v1/jobs` — or',
    '  `no-ticket: <reason>`. A git hook reminds you. This is what lets',
    '  `coord why <file>:<line>` explain a line months from now.',
    '- Record a decision for cross-repo changes, contract changes, new dependencies, real',
    '  choices between alternatives, and security tradeoffs:',
    `  \`coord decide --title "..." --repos ${repo}\``,
    '',
    'The `JET-nnn` tags already scattered through this codebase mark why code exists.',
    '`coord show <id>` finds every place one is cited. New tickets continue that series.',
    '',
    '## Shared facts',
    '',
    '`coord ctx` holds things that are true across the platform and belong to no one repo.',
    'Read it before guessing at how something outside this repo works, and write down what',
    'you learn: `coord ctx --add "<title>" --body "..."`.',
    '',
    '## If coord gets in the way',
    '',
    'Nothing here should slow you down. `coord fix` shows anything automatic that failed,',
    'with the command that does it by hand. `coord pause` turns all of it off on your',
    'machine until `coord resume` — commit hooks included.',
    ...(contracts.length ? [
      '',
      `## Contracts ${repo} owns`,
      '',
      contracts.join(', '),
      '',
      'Described in `jetkreate-coord/contracts/`. Only this repo edits those files, and only',
      'under an approved ticket. Everyone else reads them.',
    ] : []),
    ...(deps.length ? [
      '',
      `## ${repo} depends on`,
      '',
      `${deps.join(', ')} — check their contracts before assuming a response shape.`,
    ] : []),
    '',
    '## Useful',
    '',
    '```',
    'coord                   what is waiting on a person right now',
    'coord list              what is open',
    'coord show JET-nnn      one ticket in full (works for the tags already in code)',
    'coord why src/x.ts:88   why is this line like this',
    'coord ctx               shared facts across the repos',
    'coord sync              pull and push the board',
    'coord fix               anything automatic that failed, and how to do it by hand',
    '```',
    '',
    'Full rules: `CLAUDE.md` and `ONBOARDING.md` in the jetkreate-coord repo.',
    '',
  ].join('\n');
}

const agentsSection = () => [
  AGENTS_BEGIN,
  '## Platform coordination',
  '',
  'This repo is part of the jetKreate platform. Never edit another repo; file a ticket with',
  '`coord new` instead (the `jetkreate-coord` repo, cloned beside this one). Commit messages',
  'start with `JET-nnn:` or `no-ticket:`. See `.github/copilot-instructions.md` for the full set.',
  AGENTS_END,
  '',
].join('\n');

// Managed block, like turbo's own: replaced in place so a re-run updates instead of stacking.
function withCoordSection(text) {
  let t = text;
  const b = t.indexOf(AGENTS_BEGIN), e = t.indexOf(AGENTS_END);
  if (b >= 0 && e > b) t = t.slice(0, b) + t.slice(e + AGENTS_END.length);
  else {                                       // an older unmarked section, written before markers existed
    const h = t.indexOf('\n## Platform coordination');
    if (h >= 0) {
      const next = t.indexOf('\n## ', h + 1);
      t = t.slice(0, h) + (next >= 0 ? t.slice(next) : '\n');
    }
  }
  return t.replace(/\s*$/, '\n') + '\n' + agentsSection();
}

/* ---------- apply ---------- */
function devsetup({ repo, strict = false, copilot = true } = {}) {
  const repos = repo ? [repo] : L.onboarded();
  if (!repos.length) throw new Error('no onboarded repos — run: coord repos');
  const out = [];

  for (const r of repos) {
    const dir = L.repoDir(r);
    if (!L.isRepoAt(dir)) { out.push(`${r}: not on this machine — skipped (clone it, or: coord where ${r} <path>)`); continue; }
    const hooks = path.join(dir, '.git', 'hooks');
    fs.mkdirSync(hooks, { recursive: true });

    for (const [name, body] of [['prepare-commit-msg', prepareCommitMsg()], ['commit-msg', commitMsg()], ['post-commit', postCommit()]]) {
      const f = path.join(hooks, name);
      const existing = L.read(f);
      if (existing && !existing.includes('coord devsetup')) {
        out.push(`${r}: ${name} already exists and is not ours — left alone, add the coord lines by hand`);
        continue;
      }
      const changed = existing !== body;
      fs.writeFileSync(f, body, { mode: 0o755 });
      if (changed) out.push(`${r}: .git/hooks/${name} installed (local, not committed)`);
    }

    const strictFlag = path.join(dir, '.git', 'coord-strict');
    if (strict && !L.exists(strictFlag)) { fs.writeFileSync(strictFlag, 'commit-msg rejects messages with no ticket ID\n'); out.push(`${r}: strict mode ON`); }
    else if (!strict && L.exists(strictFlag)) { fs.rmSync(strictFlag); out.push(`${r}: strict mode OFF`); }

    if (copilot) {
      const f = path.join(dir, '.github', 'copilot-instructions.md');
      const body = copilotDoc(r);
      if (L.read(f) !== body) {
        fs.mkdirSync(path.dirname(f), { recursive: true });
        const existed = L.exists(f);
        fs.writeFileSync(f, body);
        out.push(`${r}: .github/copilot-instructions.md ${existed ? 'updated' : 'written'}  << TRACKED — review and commit`);
      }
      const agents = path.join(dir, 'AGENTS.md');
      if (L.exists(agents)) {
        const before = L.read(agents), after = withCoordSection(before);
        if (after !== before) {
          fs.writeFileSync(agents, after);
          out.push(`${r}: AGENTS.md coordination block ${before.includes('Platform coordination') ? 'updated' : 'added'}  << TRACKED — review and commit`);
        }
      }
    }
  }
  return out.length ? out : ['everything already in place — nothing to do'];
}

/* ---------- Claude Code's own hooks (~/.claude/settings.json) ---------- */
// Copilot users get git hooks; Claude Code users get these as well — the guard and the
// session briefing live here, not in any repo. Without this step a dev who clones the
// board has no enforcement at all, and would never know.
const CLAUDE_HOOKS = [
  { event: 'SessionStart', script: 'hook.js', arg: 'session-start' },
  { event: 'Stop', script: 'hook.js', arg: 'session-stop' },
  { event: 'PostToolUse', script: 'hook.js', arg: 'edit', matcher: 'Edit|Write|MultiEdit' },
  { event: 'PreToolUse', script: 'guard.js', matcher: 'Edit|Write|NotebookEdit|MultiEdit|Bash', timeout: 10 },
];
// process.execPath is the realpath — on Homebrew that is .../Cellar/node/26.8.2/bin/node,
// which stops working at the next `brew upgrade`. The symlink `which node` reports survives.
function nodeCmd() {
  const w = L.sh(L.isWindows ? 'where' : 'which', ['node'], P.coord);
  const first = w.ok && w.out.split('\n')[0].trim();
  return first || process.execPath;
}
const claudeSettings = () => path.join(require('os').homedir(), '.claude', 'settings.json');
const isOurs = entry => (entry.hooks || []).some(h =>
  typeof h.command === 'string' && /[\\/]hooks[\\/](hook|guard)\.js/.test(h.command));

function installClaudeHooks({ file = claudeSettings() } = {}) {
  const out = [];
  let cfg = {};
  const before = L.read(file);
  if (before.trim()) {
    try { cfg = JSON.parse(before); }
    // Never clobber a settings file we cannot parse — that is someone's whole setup.
    catch (e) { return [`~/.claude/settings.json is not valid JSON (${e.message}) — left alone. Fix it, then: coord devsetup --claude`]; }
  }
  const q = s => `"${s}"`, node = nodeCmd();
  cfg.hooks = cfg.hooks || {};
  for (const h of CLAUDE_HOOKS) {
    const cmd = [q(node), q(path.join(P.coord, 'hooks', h.script)), h.arg].filter(Boolean).join(' ');
    const entry = { ...(h.matcher ? { matcher: h.matcher } : {}), hooks: [{ type: 'command', command: cmd, timeout: h.timeout || 15 }] };
    const kept = (cfg.hooks[h.event] || []).filter(e => !isOurs(e));   // drop ours, keep everyone else's
    cfg.hooks[h.event] = [...kept, entry];
  }
  const after = JSON.stringify(cfg, null, 2) + '\n';
  if (after === before) return ['~/.claude/settings.json already has the coord hooks'];
  if (before) {
    const bak = `${file}.bak.${Date.now()}`;
    fs.writeFileSync(bak, before);
    out.push(`backed up your settings to ${path.basename(bak)}`);
  }
  L.atomicWrite(file, after);
  out.push(`~/.claude/settings.json: coord hooks installed (guard + session briefing) — restart Claude Code to pick them up`);
  return out;
}

/* ---------- used by the post-commit hook ---------- */
function logCommit(cwd) {
  const repo = L.repoOf(cwd);
  if (!repo || !L.isOnboarded(repo)) return null;
  const g = L.sh('git', ['log', '-1', '--format=%h %s'], L.repoDir(repo));
  if (!g.ok) return null;
  L.logActivity(repo, 'commit', g.out);
  autoStart(repo);                                  // Copilot users have no edit hook
  return `${repo} ${g.out}`;
}

// Same rule as the session hook: exactly one approved ticket for this repo, or nothing.
function autoStart(repo) {
  try {
    if (L.currentTicket(repo)) return;
    const approved = L.lsMd(P.tickets)
      .map(f => L.parse(L.read(path.join(P.tickets, f))).fm)
      .filter(fm => fm.status === 'approved' && fm.to === repo);
    if (approved.length !== 1) return;
    require('./rules.js').transition(approved[0].id, 'in_progress', 'work started in ' + repo);
    L.setCurrentTicket(repo, approved[0].id);
    L.logActivity(repo, 'auto-start', approved[0].id);
  } catch { /* never break a commit over bookkeeping */ }
}

const pathHint = () => `export PATH="${path.join(P.coord, 'bin')}:$PATH"`;

module.exports = { devsetup, logCommit, copilotDoc, withCoordSection, installClaudeHooks, claudeSettings, COORD_BIN, pathHint };
