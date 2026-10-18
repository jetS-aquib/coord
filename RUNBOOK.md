# Getting started

From nothing to working, in order. Everything here is safe to re-run.

```
   1  clone the board        git clone git@github.com:jetS-aquib/coord.git
   2  run setup              ./coord/bin/coord setup
         ├── it finds your repos, or asks where they are
         ├── it asks what to call you and which agent you use
         └── it installs the hooks and leaves you a to-do list
   3  finish that list       usually just: put coord on your PATH
   4  open a repo            coord          ← what's waiting, where you left off
   5  work                   nothing else to do
```

If a repo you need isn't on the board yet, that's step 6 — see **Adding a repo** below.

---

## 1. Clone the board

Put it wherever you keep code. Your repos do **not** have to sit next to it.

```bash
git clone git@github.com:jetS-aquib/coord.git
```

## 2. Run setup

```bash
./coord/bin/coord setup
```

It checks node and git, pulls the latest board, then stops to ask only where it genuinely
cannot tell:

- **Where are your repos?** It looks beside the board, one level up, and in the usual
  `~/work`-ish places. If it spots one it asks before using it — it never assumes. If you
  haven't cloned a repo yet it offers to, or you can skip it entirely.
- **What should we call you, and which agent do you use?** The name goes on the board so
  activity has a person against it. The tool matters because Claude Code gets hooks and
  Copilot doesn't.
- **Can it add `coord` to your shell profile?** Say no and it prints the line for you.

On Windows it prints a `setx` line instead of touching a profile. If you use Claude Code
it also merges four hooks into `~/.claude/settings.json`, backing the file up first and
leaving every other hook you have alone.

**Re-run it any time.** Every step is idempotent, and it's the right move after you clone
another repo.

### What it writes into your repos

Each repo gets git hooks in `.git/hooks/` (local, never committed) and one **tracked**
file, `.github/copilot-instructions.md`, which is how a Copilot session learns the
platform rules.

If that file already exists and somebody wrote it by hand, **coord does not touch it**:

```
beta: .github/copilot-instructions.md already has instructions that are not ours — LEFT ALONE
beta:   to add our rules as a marked block, keeping theirs:  coord devsetup --repo beta --merge
```

With `--merge` (or by saying yes when setup asks), your file keeps every line it had and
gains one block between `<!-- BEGIN:coord -->` and `<!-- END:coord -->`. Later runs
refresh only that block. The same applies to `AGENTS.md` where a repo has one.

## 3. Finish whatever it listed

Setup ends with the things it couldn't do itself. Usually one line about your PATH.
Nothing on that list is urgent; coord works from `./coord/bin/coord` either way.

## 4. Open a repo and type `coord`

```
$ coord
api
  on JET-194  Return job state on /v1/jobs   (commits here are tagged with it)
  last session here, yesterday:
    Added the state enum. Next: regenerate the shared schema.

1 thing is waiting on you:
  JET-197  Rate limit /v1/export

  read it   coord show JET-197
  yes       coord ok
  no        coord no "<why>"
```

Both tools inject that same briefing automatically at the start of every session, so you
only type `coord` when you want it again mid-session. If one never appears, the hooks
aren't installed: `coord devsetup --hooks`.

## 5. Work

That's it. Commits get tagged, requests move themselves along, the board syncs, your
handoff note writes itself when the session ends.

The only two commands in normal use:

```bash
coord ok              # yes — approves what's open, closes what you've checked
coord no "<why>"      # no
```

Neither needs an id when only one thing is waiting on you.

## Touching two repos at once

The one time coord interrupts you. Your agent goes to edit a file in a different repo
than the one you're in, and you get asked:

```
  You are in api, and this edit writes into web/.

  If you asked for this — one change across both ends — say yes.
  If this was the agent's idea and not yours, say no.
```

Say yes and it's recorded that the two repos moved together, and you're not asked again
for that pair for the rest of the session. Say no and your agent files a request instead,
which someone approves with `coord ok`.

**Reading another repo is never interrupted.** Only writing.

That's the whole of it. There's no request to file for work inside your own repo, ever.

---

## Terminal, or just say it to your agent?

Your agent can run shell commands, so almost everything works either way. One rule:
**decisions you type, questions you ask.**

| | |
| --- | --- |
| **type it** | `coord ok` · `coord no "<why>"` — a decision has to come from a person, and the CLI refuses an agent that tries |
| **say it** | everything else, in plain English. "what's JET-197 about?", "why is this line like this?", "the API needs to return job state", "leave a handoff note" |

Ask your agent to approve something and it will tell you to do it yourself. That refusal is
the point: a gate an agent can walk through is not a gate.

**Nothing runs in the background.** No server, no daemon, no account — every command
starts, does one thing and exits. The one exception is optional: `node
coord/dashboard/server.js` serves the board at `localhost:4747`. Start it when you want
the overview, close it when you don't; nothing else depends on it.

## Windows + GitHub Copilot

Both tools have a hook API, so both get the same four things without being asked: the
briefing at session start, the guard before a write, the overlap warning, and a handoff
note when you stop. `coord setup` writes them to `~/.copilot/hooks/coord.json`
(`%USERPROFILE%\.copilot\hooks\` on Windows).

In VS Code that needs `chat.useHooks` — on by default — and a trusted workspace. Agent
hooks there are still marked preview, so if briefings stop arriving after an update,
`coord` by hand does the same job and `coord devsetup --hooks` puts the file back.

**One thing to do by hand, once.** Setup prints this rather than editing a profile for
you. Run it in PowerShell, then **open a new terminal** — `setx` only affects terminals
opened after it:

```powershell
setx PATH "$env:PATH;C:\path\to\coord\bin"
```

`coord help` should then print. A `coord.cmd` ships beside the CLI, so PowerShell and
cmd find it; Git Bash finds `coord` directly.

**When something needs an answer:** `coord ok` or `coord no "<why>"`. That stays yours
to type — see the rule above.

Git hooks run the same on Windows, because Git for Windows runs them, so commits get
tagged, land on the board and sync without you doing anything.

## Adding a repo

Any repo, anywhere on your disk. Ask your agent to **"onboard `<name>`"**, or:

```bash
coord onboard <name> --at <path> --preflight    # read-only report, changes nothing
coord onboard <name> --at <path> --apply        # after you've read it
```

The preflight tells you what it found — stack, branch, uncommitted files, which API
routes look like contracts, which other repos it seems to talk to. Nothing is written
until you run `--apply`, and `--apply` never touches the repo's tracked files.

`--at` is only needed if the repo isn't sitting beside the board.

## When something's wrong

```bash
coord check     # is the board consistent?
coord fix       # anything automatic that failed, and how to do it by hand
coord pause     # switch all of it off on this machine, until: coord resume
```

`pause` kills the guard, the sync, the board updates and the commit hooks. It's local to
you. If you ever need it, say so — that's a bug worth fixing.

## Where things live

| | |
| --- | --- |
| the board | wherever you cloned it; `coord where` shows your repos |
| your repos | anywhere — recorded in `paths.json`, which is yours alone |
| per-repo rules | `.github/copilot-instructions.md` in each repo (tracked) |
| hooks | each repo's `.git/hooks/` (local, never committed) |
| Claude Code hooks | `~/.claude/settings.json` |

Full detail: `README.md` here, `CLAUDE.md` at the platform root, and `coord help`.
