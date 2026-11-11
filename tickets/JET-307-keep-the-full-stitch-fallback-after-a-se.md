---
id: JET-307
title: Keep the full-stitch fallback after a segmented render fails, but make a 4xx from the video API loud enough to notice
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-11T14:22:31+05:30
updated: 2026-11-11T14:22:31+05:30
decisions: 
---

## Request

A segment-concat 422 (JET-306) quietly turned every segmented render into a second full stitch for days. Keep the fallback as the safety net, but make that kind of failure visible.

## Understanding

The dev wants the fallback kept: a render that falls back still reaches the creator, which is the point. What went wrong is that nobody could see it — one console.warn per render, a 'success' at the end. Assumption: a 4xx from the video API means our request is wrong and will fail every time until code changes, whereas a 5xx, timeout or failed segment can be transient, so only the 4xx case needs to stand out. Assumption: there is no alerting tool to hook into, so 'loud' means a distinct console.error with a fixed tag that can be searched for in Cloud Logging, plus a field on the render plan. If there is a better place (Sentry, a metric), say so.

## Plan

1. In stitchInSegmentsV1's catch (renderOrchestratorV1.ts ~3387), tell a 4xx from VideoApiService apart from everything else.
2. 4xx: console.error with a fixed tag, e.g. [RenderV1][SEGMENT_CONTRACT_BROKEN], including status and the response body; then fall back exactly as today.
3. Anything else: keep today's console.warn and fallback.
4. Record segmentFallback: { reason, status } on the render plan so a finished render shows it took the slow path.
5. No change to the fallback itself.

## Reason

Staging render mvr_1794384735775_ed42df55 (2026-11-11 08:22:36 UTC): segment-concat answered 422 extra_forbidden on callback_requested, Node logged a warn and re-stitched the whole song, re-downloading every clip. Fixed on the video side in JET-306, but the same kind of mismatch can come back with any new field, and today it would again look like 'renders are slow'.

## Related files

src/services/render/renderOrchestratorV1.ts, src/modules/video/video-api.service.ts (if the error does not carry the status)

## Acceptance criteria

A forced 4xx on segment-concat still produces the video via the fallback, and logs one [SEGMENT_CONTRACT_BROKEN] error line with the status and body; the render plan records segmentFallback.

## Test steps

—

## Thread
2026-11-11T14:22:31+05:30 aquib N: created ticket, status: - -> open
