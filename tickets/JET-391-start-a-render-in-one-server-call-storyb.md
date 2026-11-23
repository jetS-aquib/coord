---
id: JET-391
title: Start a render in one server call: storyboard, save project and start, so leaving the app cannot lose it
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:47:52+05:30
updated: 2026-11-23T15:47:52+05:30
decisions: 
---

## Request

The app runs the opening as three calls from the phone (mobile lib/generation.ts:213 createStoryboard -> :245 saveProject -> :579 startRender). If the app is backgrounded, killed (JET-371 shows the low-memory killer does this) or loses signal in that minute, the project is lost or left half-made, and the user's choices go with it.

## Understanding

Assumptions: (1) new POST /api/v1/music-videos/create-and-render takes the same draft the app sends today (song, window, director, picks, where, special, style, aspect, tier, caption settings, reviewFirst) and returns {projectId, jobId} as soon as the project row exists, doing storyboard + render start in the background on the server; (2) the project row is written FIRST, so a failure later leaves a resumable project ('idle' in the app) with every choice saved; (3) the existing three endpoints stay for the web and older app builds; (4) limits (generationLimiter) are checked before anything is written, returning the same codes; (5) idempotency key from the client so a retried request does not create two projects.

## Plan

1. Route + zod schema mirroring the app's draft.
2. Write project, then storyboard + start render asynchronously; record failures on the project.
3. Idempotency-Key header support.
4. Tests: success, limit refusal, storyboard failure leaves a resumable project.

## Reason

Removes the one minute in the app where leaving loses work; the app can show 'safe to leave' from the first tap.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts, storyboard service

## Acceptance criteria

Tap Film now in the app and kill the app within 2s; reopen: the project is in the Library and the render is progressing. Make the storyboard call fail: the project exists with its choices and can be retried.

## Test steps

—

## Thread
2026-11-23T15:47:52+05:30 aquib N: created ticket, status: - -> open
