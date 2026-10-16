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

On Claude Code that same briefing is injected automatically at the start of every
session, so you only type `coord` when you want it. **On Copilot there's no hook — typing
`coord` when you sit down is the one habit worth having.**

## 5. Work

That's it. Commits get tagged, tickets move themselves along, the board syncs, your
handoff note writes itself when the session ends.

The only two commands in normal use:

```bash
coord ok              # yes — approves what's open, closes what you've checked
coord no "<why>"      # no
```

Neither needs a ticket ID when only one thing is waiting on you.

---

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
