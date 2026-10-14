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
MSG=$(head -1 "$1")
case "$MSG" in
  T-[0-9]*:*|no-ticket:*|Merge\\ *|Revert\\ *|fixup!*|squash!*|amend!*) exit 0 ;;
esac

STRICT=0
[ -n "$COORD_STRICT" ] && STRICT=1
[ -f "$(dirname "$0")/../coord-strict" ] && STRICT=1

if [ "$STRICT" = "1" ]; then
  printf '\\n  coord: REJECTED — no ticket ID.\\n  Use "T-042: %s" or "no-ticket: %s"\\n\\n' "$MSG" "$MSG" >&2
  exit 1
fi
printf '\\n  coord: no ticket ID in this message.\\n  Use "T-042: %s" or "no-ticket: %s"\\n  so "coord why" can explain this line later.   (coord list — what is open)\\n\\n' "$MSG" "$MSG" >&2
exit 0
`;

const postCommit = () => `#!/bin/sh
# installed by: coord devsetup — local to this clone, never committed.
# Records the commit on the board, then syncs .coord if it has a remote. Never blocks.
COORD="${COORD_BIN}"
COORD_ROOT="${P.coord}"
export COORD_ROOT
[ -x "$COORD" ] || exit 0
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
    `This repo is one of ${all.length} in the jetKreate platform${others.length ? ` (the others are ${others.join(' and ')})` : ''}.`,
    'Coordination for all of them lives in a separate repo, `jetkreate-coord`, cloned beside',
    'this one. Its CLI is `coord`. If that command is not found, read that repo\'s README.',
    'It is markdown files, not a service. Read it.',
    '',
    '## Hard rules',
    '',
    '- **Never edit files in another repo.** Reading them to understand an API shape is fine.',
    '- Need a change in another repo? Create a ticket, tell the human, and stop:',
    `  \`coord new --from ${repo} --to <repo> --title "..."\``,
    '  It does nothing until a human approves it.',
    `- Only act on a ticket addressed to ${repo} after a human has approved it.`,
    '- **Every commit message starts with the ticket ID** — `T-042: add GET /v1/jobs` — or',
    '  `no-ticket: <reason>`. A git hook reminds you. This is what lets',
    '  `coord why <file>:<line>` explain a line months from now.',
    '- Record a decision for cross-repo changes, contract changes, new dependencies, real',
    '  choices between alternatives, and security tradeoffs:',
    `  \`coord decide --title "..." --repos ${repo}\``,
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
    'coord list              what is open',
    'coord show T-042        one ticket in full',
    'coord why src/x.ts:88   why is this line like this',
    'coord sync              pull and push the board',
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
  'start with `T-nnn:` or `no-ticket:`. See `.github/copilot-instructions.md` for the full set.',
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
    const dir = path.join(P.root, r);
    if (!L.exists(path.join(dir, '.git'))) { out.push(`${r}: no .git here — skipped (is it cloned beside the coord repo?)`); continue; }
    const hooks = path.join(dir, '.git', 'hooks');
    fs.mkdirSync(hooks, { recursive: true });

    for (const [name, body] of [['commit-msg', commitMsg()], ['post-commit', postCommit()]]) {
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

/* ---------- used by the post-commit hook ---------- */
function logCommit(cwd) {
  const repo = L.repoOf(cwd);
  if (!repo || !L.isOnboarded(repo)) return null;
  const g = L.sh('git', ['log', '-1', '--format=%h %s'], path.join(P.root, repo));
  if (!g.ok) return null;
  L.logActivity(repo, 'commit', g.out);
  return `${repo} ${g.out}`;
}

const pathHint = () => `export PATH="${path.join(P.coord, 'bin')}:$PATH"`;

module.exports = { devsetup, logCommit, copilotDoc, withCoordSection, COORD_BIN, pathHint };
