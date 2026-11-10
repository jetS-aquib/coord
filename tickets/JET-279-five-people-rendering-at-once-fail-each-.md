---
id: JET-279
title: Five people rendering at once fail each other: no limit across renders, and no timeout on any planning or video call
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:56:02+05:30
updated: 2026-11-10T14:04:02+05:30
decisions: 
---

## Request

Hold the whole server to a fixed number of in-flight video, image and text calls, treat a quota 429 as wait-your-turn rather than a failed clip, and give every planning call and every video create a timeout so a hung call can never freeze a render.

## Understanding

Deployment is a monolith on 1 instance, at most 2, so an in-process limiter is enough: no queue, no Redis. With 2 instances each holds its own cap, set to half the project quota. Assumption: one shared limiter per call kind (video, image, text) is enough; per-user fairness is not needed at 5-10 users. A 429 that has waited past a ceiling (assume 5 min) still fails, with cause=quota (the field comes from the failure-transparency request). Provider-neutral: the limiter wraps the call site, not Omni specifics, so a second provider later gets its own cap.

## Plan

1. A small semaphore per call kind (video, image, text) in one module, caps from env with defaults (video 12, image 12, text 8).
2. Route generateClipV1, the still and vision calls, and every planning text call through it.
3. 429 inside the semaphore: back off and retry up to a ceiling instead of 4 tries; does not count as a clip attempt.
4. AbortSignal timeouts: planning text 90s, image 90s (already), video create 6 min; a timeout is one retryable failure.
5. Check stoppedSince between script, treatment, shot list and safety pass.
6. startRenderV1 uses songReadOrPendingV1 (202 after 20s) like the other routes.
7. Load script scripts/rnd/concurrentRenders.ts: start N renders against one song and report 429s, waits, blocked renders.

## Reason

Audit 2026-11-10. Each render runs 6 clips and 6 stills at once (videoModelsV1.ts:52, RENDER_IMAGE_CONCURRENCY), with no cap across renders. 10 users means ~60 video + ~60 image calls on one Gemini quota. shared.ts:39-79 retries a 429 four times (2+4+8+16s), then the clip is failed and the render ends blocked: congestion shown to the user as a broken shot. No planning call (script, treatment, shot list, safety pass) and no Omni interactions.create() has a timeout. Cancel isn't checked until all four planning calls return (renderOrchestratorV1.ts:1337), and the 30-min stall flag is read-only (:518), so one hung call freezes 'writing the shot list' forever. startRenderV1 awaits songReadV1 with no 20s cap (:392), so the 30s load balancer can cut POST /render.

## Related files

src/services/ai/shared.ts, src/services/render/videoModelsV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/ai/omniVideoService.ts, scripts/rnd/concurrentRenders.ts

## Acceptance criteria

8 renders started together on one instance: none ends blocked because of 429s, the total in-flight video calls never exceed the cap, a planning call forced to hang is abandoned at its timeout and the render carries on or fails cleanly, and Stop during planning takes effect within one call.

## Test steps

—

## Thread
2026-11-10T01:56:02+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:04:02+05:30 aquib N: status: open -> approved
