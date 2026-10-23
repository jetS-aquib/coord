# music-jetkreate-mobile — aquib N

- **Current task:** v1 render + the blocked-render decision screen. Both in code, neither verified against a live render.
- **Status:** working
- **Blockers:** none in code. JET-198 landed and is used. A live render costs ~$25 for a full song, ~$0.80 for a one-scene project.
- **Last updated:** 2026-10-23T11:00:00+05:30

> Note: this per-person file had not been written since 2026-10-21 and the
> entries below it are auto-generated. The substantive handoff notes for
> 2026-10-21 and 2026-10-22 — durable runs, retry, resume, the design pass,
> JET-194/196 — went to `.coord/status/music-jetkreate-mobile.md` instead.
> Read that one too; the two should probably be reconciled.

## Handoff notes

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

