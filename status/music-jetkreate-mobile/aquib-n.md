# music-jetkreate-mobile — aquib N

- **Current task:** v1 render integration is committed on branch `v1-render-and-design-pass` (4 commits, not merged, not pushed). Next is one live render to verify it.
- **Status:** waiting on human
- **Blockers:** nothing in code. The whole v1 path is UNRUN — that is the next job, not a blocker on writing more.
- **Last updated:** 2026-10-23T11:00:00+05:30

> Note: this per-person file had not been written since 2026-10-21 and the
> entries below it are auto-generated. The substantive handoff notes for
> 2026-10-21 and 2026-10-22 — durable runs, retry, resume, the design pass,
> JET-194/196 — went to `.coord/status/music-jetkreate-mobile.md` instead.
> Read that one too; the two should probably be reconciled.

## Handoff notes

### 2026-10-26T17:22:28+05:30

Session ended. Touched: src/app/(app)/video/[id].tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-10-24T15:26:18+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-24 — session end: committed, unverified, here is where to start

**Where the code is.** Branch `v1-render-and-design-pass`, 4 commits ahead of
`main`, nothing pushed. Working tree clean, tip typechecks, `npm run
check:retry` passes. Merge with `git merge --ff-only` when you want it on main.

One wart: the deletion of `src/app/(create)/working.tsx` landed in the
reliability commit (e460e21) instead of the route-restructure one (58cc55e).
The tree is right at the tip; only the per-commit tidiness is off. Also, only
the tip is guaranteed to build — the four commits are thematic groupings, not
bisectable states.

**START HERE: nothing in the v1 path has executed.** Not the render call, not
polling, not re-attach, not the blocked decision, not the finished-video
autoplay. The backend's own plan records its batches as built and unit-tested
but never run end to end either. Use a ONE-SCENE project, about $0.80; a full
song is ~31 shots and ~$24.80. The order I would test in:

1. One tap renders a song, and the hero shows planning -> shots -> collage ->
   the finished video autoplaying with a toast.
2. Background the app mid-render and return. Then force-quit and reopen the
   project from the Library — it must re-attach, not offer to start (that is
   JET-198 doing its job, and the thing most likely to be subtly wrong).
3. A direction naming a real person, to reach `blocked`. Under 4 refusals you
   should get per-shot prompt editing; at 4+ the screen should blame the
   direction instead.
4. `docker restart` the backend mid-render; the phone should keep polling.

**Things I would look at first if something is off**
- The reel-to-collage-to-finished handoffs are three animations swapping in
  one slot; I have never seen them run together.
- After a re-render or stitch from the blocked screen I optimistically flip to
  `running` with a locally-patched status and let the next poll correct it. If
  the backend 202s without leaving `blocked`, expect a bounce.
- The warnings panel is capped at 180px expanded and shows 2 reasons collapsed.
  Untested with many warnings; the sanitizer has never run live.

**Open requests, all waiting on a person**
- JET-194 media host (fixes "Could not reach the media host" for good)
- JET-196 portrait output — IMPLEMENTED but the container serving :5005 was
  running a pre-fix image. `docker compose up -d --build`, then ffprobe a new
  master for 1080x1920 before closing it.
- JET-193 captcha — implemented, needs closing once you have seen mobile sign in.

**Unverified beyond v1:** light mode, 1.3x font scale, and the orb field's cost
on a low-end device (three animated views per screen, never profiled).

**One open question for the backend:** `POST /api/video/music-storyboard` still
takes `videoModel`, and Batch 0.3 ("re-point mobile's hardcoded MODEL_KEY") is
unstarted. We now send `undefined` rather than the retired `'lite'`. If that
route needs a real model name to size scenes, step one of every render has a
gap. Not filed — it is the kind of thing to ask before filing.

`coord check` warns this file has more than 5 handoff notes; `coord archive`
trims it. I have not run it.

### 2026-10-24T15:23:17+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T18:17:01+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T17:36:17+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T17:25:25+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23 (later) — blocked renders

`blocked` is handled as a decision, not an ending. It IS in `TERMINAL` (no
worker will touch it) but it is not "finished" — `GET /:id/render` still
returns it, which is how reopening the app lands back on the decision instead
of a start button that would 409.

**Product call, and it is a guess worth revisiting with real data:** per-shot
prompt editing for **3 or fewer** refused shots; above that the screen names
the direction as the cause and offers to change it. Reasoning: every scene
prompt carries the direction, so many refusals share one cause, and nobody
edits twenty prompts on a phone. `EDIT_INDIVIDUALLY_UP_TO` in
`features/create/blocked-decision.tsx`.

Also: the re-render button on a refused shot is disabled until the text
actually differs from the original, because a refusal is deterministic and
re-sending the same words just spends another call to get the same answer.

`warnings` are shown during healthy renders too, not only blocked ones.

### 2026-10-23T16:56:09+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23 — task 2.8: the client loop is deleted

`lib/generation.ts` lost `createClip`, `assemble` and `runGeneration`. What
replaced them: `startRender`, `activeRender`, `pollRender`, `cancelRender`,
`rerenderClip`, plus `readyClips()` and `describeRender()`. Kept, as instructed:
`createStoryboard`, `saveProject`, `reachable-url`, and `retry` — the last now
wraps only the storyboard call.

Order is load-bearing and the screen enforces it: storyboard, save, THEN render.
The render derives its plan from the storyboard on the project document and
reads showLyrics / includeClipAudio from there, so the save is not optional.

Decisions worth knowing:
- **No local jobId cache.** JET-198's lookup is authoritative; a cache is a
  second source of truth that goes stale when a render finishes while the app
  is closed. One call on a screen that already fetches the project.
- **409 re-attaches via the endpoint, not by parsing the message.** The jobId
  is in that prose string but depending on its wording was the reason JET-198
  was filed.
- **Out-of-order arrival broke the reel in a way that was not obvious.** Six
  clips render at once, so a later poll can insert a shot BEFORE the one
  playing. The reel tracked array position, so it silently cut to a different
  shot when a gap filled behind it. It now tracks the shot's own index.
- **Back no longer stops anything.** The render is server-side, so leaving is
  free. The Nav Read's original claim is finally true.
- `MODEL_KEY` is now `undefined` so the server picks omni. It is still passed
  to the v0 storyboard call, which nobody has re-pointed (Batch 0.3) — see
  below.

**Unverified, all of it.** No song has rendered through this path, and the
backend's own plan records Batches 2 and 3 as built and unit-tested but never
run live. Treat shapes as right and timings as claims.

**Open question for the backend:** `POST /api/video/music-storyboard` still
takes a `videoModel`, and Batch 0.3 ("re-point mobile's hardcoded MODEL_KEY")
is still unstarted. We now send `undefined` rather than the retired `'lite'`.
If the storyboard route needs a real model name to size scenes, that is a gap
on the one v0 call v1 kept.

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-10-23T16:44:12+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T17:54:07+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +32 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T17:16:02+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +31 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T17:03:29+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +30 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T16:48:51+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +30 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T16:37:29+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +30 more. Nothing committed. (written automatically — no one said what is next)

