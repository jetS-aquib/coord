# Archived handoff notes — music-jetkreate-mobile/aquib-n

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

### 2026-10-21T16:27:07+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +28 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T16:02:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +27 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:57:50+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +27 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:45:02+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +26 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:38:56+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +26 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:28:44+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +15 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:22:26+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +14 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:15:12+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +13 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T15:01:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +13 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T14:53:47+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +11 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T14:47:35+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +10 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T13:43:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +8 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T12:06:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +8 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T12:01:39+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +6 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:57:18+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +6 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:51:28+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:46:13+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-20T20:53:26+05:30

Session ended. Touched: aquib-n.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-20T21:05+05:30

Scaffolded the repo from scratch and shipped the auth flow.

**Done.** Expo SDK 58 (RN 0.88, Expo Router, Hermes), Android-first. Design tokens
ported from iris: OKLCH converted to sRGB hex, contrast measured rather than assumed
(`inkFaint` fails AA in both modes and is marked decorative-only). Full design record
in `MOBILE-DESIGN.md` including the RISK register. Auth screens: sign-in,
create-account, verify. Request signing in `src/lib/signing.ts` mirrors the backend's
`requireSignature` canonical string exactly, with clock-skew correction because the
backend allows only 60s of drift and phone clocks wander.

**The blocker.** reCAPTCHA v3 is browser-only; there is no React Native SDK. The
backend rejects an empty captcha token with 403 before checking credentials, so
`/api/auth/login` and `/api/auth/users` are unreachable from this client. JET-193 asks
for a non-production exemption at the `captchaService.verify()` chokepoint.

**Interim.** `/api/auth/refresh` checks no captcha and no signature and returns a real
access token with a real `snonce`, so a pre-minted refresh token exchanged at launch
gives a genuine session. Dev-only, behind `__DEV__` and
`EXPO_PUBLIC_DEV_REFRESH_TOKEN`. Remove it once JET-193 lands.

**Next.** Approve or reject JET-193. Then run `mobile-nav-plan` for the
upload-and-generate tree before building those screens. The pipeline shape is already
traced: presigned GCS upload (not base64), `/api/video/music-storyboard`, per-scene
jobs, then `/api/video/assemble-music-video`. SSE will not work in React Native, so
job progress has to poll `/api/jobs/:id/status`.

**Housekeeping.** The repo has no git remote and zero commits; everything is still
untracked. Other machines will see a registry row for a repo they cannot clone until
that is fixed.
