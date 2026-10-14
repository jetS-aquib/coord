# Onboarding a repo — runbook

Instructions to Claude. Triggered when the human says `onboard <repo>` or similar.
Run from the jetKreate root. Two stages, and **Stage A always stops for confirmation.**

A repo with a `.git` folder that has no entry in `repos.json` is *discovered*, not
*onboarded*. Discovered repos get nothing: no status file, no board row, no activity
trail beyond one "discovered, not onboarded" breadcrumb a day. Onboarding is what
makes a repo part of the platform.

---

## STAGE A — Preflight (read-only, change nothing)

Run `.coord/bin/coord onboard <repo> --preflight`. It does the machine-checkable
work: validation, git state, stack, existing Claude setup, candidate contracts and
dependencies, planned changes. **It writes nothing.**

Then read what it cannot judge, and present one report covering all of this:

### 1. Repo
Name, absolute path, and the validation checklist from the CLI: direct subfolder of
jetKreate, contains `.git`, not hidden, not already in the registry, name usable.
Any unchecked box blocks Stage B — say so plainly.

### 2. Git
Current branch, remote URL, uncommitted change count. **Report uncommitted changes,
never touch them.** If the repo is dirty, say that onboarding won't disturb it, since
nothing we do goes near tracked files.

### 3. Stack
Package manager and lockfile, Node pinning (`.nvmrc`, `engines.node`,
`packageManager`), frameworks, TypeScript, and the test/lint/build/typecheck scripts.
Write a one-line `stack` summary for the registry — the CLI proposes one; sharpen it
if the CLI missed something (a monorepo whose real stack lives in `apps/*`, a Python
service alongside Node, and so on).

### 4. Existing Claude setup
`CLAUDE.md`, `CLAUDE.local.md`, `.claude/`, `.serena/`. If the repo already has its own
`CLAUDE.md`, read it: it may contradict the platform rules in `jetKreate/CLAUDE.md`.
Flag conflicts as open questions — **do not edit that file.**

### 5. Integration
- **Contracts it would own:** the CLI lists route groups it found. Open the evidence
  files for the top few and check they are really served by this repo and really
  public to the platform. Mark each **confirmed** or **guessed**. Drop internal-only
  or dev-only routes. Propose a short contract name per group.
- **depends_on:** which onboarded repos this one calls. The CLI's `confirmed` means an
  import specifier or a call to a known contract path; `guessed` means a name mention
  or a service-shaped env var. Open the evidence for every `guessed` one and either
  promote it or drop it. Never leave a guess unresolved in the report — say what you
  checked and what you concluded.

### 6. Planned changes
List exact paths. It is always these, and nothing else:
```
create   .coord/status/<repo>.md
modify   .coord/repos.json
modify   <repo>/.git/info/exclude          (local only, never committed)
create   .coord/contracts/<name>.md        (one per confirmed contract)
create   .coord/decisions/D-xxx-onboarded-<repo>.md
append   .coord/activity/<today>.log
```

### 7. Risks and open questions
Name conflicts, a repo whose `CLAUDE.md` fights the platform rules, contracts two
repos both appear to serve, a dependency you could not resolve, a monorepo where
"the repo" is really several apps. If the repo itself needs changing — a missing
`.nvmrc`, a lockfile mismatch, secrets in a tracked file — **list it as a suggestion
for the human. Do not change it.**

### Then stop
End the report with exactly:

> Reply `confirm onboarding <repo>` to proceed, or tell me what to change.

**Then STOP.** Do not run Stage B. Do not start anything else in that turn.

---

## STAGE B — Onboard

Only after the human replies `confirm onboarding <repo>` **in the current
conversation**. Anything less — "looks good", "yes", silence — is not confirmation;
ask again. If they asked for changes, redo Stage A with them.

1. **Snapshot** — `coord onboard <repo> --apply` does this first; nothing else needed.
2. **Registry entry**, via the CLI, with the values the human confirmed:
   ```
   .coord/bin/coord onboard <repo> --apply \
     --stack "<summary>" --contracts "<group,group>" --depends-on "<repo,repo>"
   ```
   This refuses unless preflight validation passes. It also does steps 3 and 5.
3. **Status file** — `status/<repo>.md`, status `idle`. (Done by `--apply`.)
4. **Contract stubs** — for each confirmed contract, write `.coord/contracts/<name>.md`:
   ```markdown
   ---
   owner: <repo>
   status: stub
   ---

   # <name>

   **stub: needs review** — generated during onboarding from route scanning.

   ## Endpoints

   - `GET /api/thing` — <one line>

   ## Notes

   Shapes are not documented yet. The owner fills these in; everyone else reads.
   ```
5. **`.git/info/exclude`** — adds `.serena/` and `CLAUDE.local.md` if absent.
   (Done by `--apply`.) **Never edit the repo's `.gitignore`.**
6. **Decision record:**
   ```
   .coord/bin/coord decide --title "Onboarded <repo> to coordination" \
     --repos <repo> --context "<stack; contracts it owns; what it depends on and why>" \
     --decision "<repo> joins the platform registry; it owns <contracts>." \
     --reason "<why now>" --consequences "Cross-repo changes to <repo> now go through tickets."
   ```
7. **Verify** — `coord check` must pass, then `coord repos` should show it onboarded.
   `--apply` already snapshotted after its own changes; take one more snapshot if you
   wrote contract stubs or a decision after it.
8. **Report** what changed, then a short **How to test**:
   - open a Claude session in `<repo>` and let it edit a file
   - `cat .coord/activity/$(date +%F).log` → lines for `<repo>`, not "discovered, not onboarded"
   - start the dashboard → `<repo>` has a board row and is gone from "Not onboarded"

### Never, during onboarding
Touch the repo's source, `package.json`, lockfile, `.gitignore`, CI config, or any
tracked file. Commit anything in the repo. The only repo-local write is
`.git/info/exclude`, which git never commits.

---

## Offboarding

`coord offboard <repo> --yes` — human-only, and it asks for `--yes` first. Marks the
registry entry `offboarded`, moves the status file to `archive/status/` and its tickets
to `archive/tickets/` (open ones are flagged in the index), and leaves every decision
in place. The repo's files are untouched; it reverts to "discovered".
