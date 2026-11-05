---
id: JET-252
title: Wait for the render's finish callback instead of polling /api/v1/jobs every second
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-05T11:38:05+05:30
updated: 2026-11-05T11:38:05+05:30
decisions: 
---

## Request

The v1 render orchestrator calls waitForCompletion, which GETs /api/v1/jobs/{id} once a second for the whole render (about 600 requests for a 10-minute render, each logged on both services). Send callback_requested: true on the stitch calls and settle the wait when the video service's finish callback arrives, keeping a slow poll as the fallback.

## Understanding

I read this as: use the callback we already have instead of polling. Assumptions: (1) callback_requested is already a field on all four stitch calls (video-api.service.ts passes it; renderOrchestratorV1 passes false today, see the comment near line 3273). (2) The existing receiver only handles music_video GenerationJob assemblies: it looks the job up by params.attemptId and updates the row. The v1 orchestrator waits in-process and has no such row, so the receiver needs a second path that wakes a waiter for that jobId. (3) Per contracts/video-jobs.md the callback is a latency optimisation and may be lost, so polling cannot be removed, only slowed. (4) I am NOT claiming this shortens a render. Polling costs about 20ms a second; the 9-minute render is the ffmpeg encode (445s of 612s). This saves request noise and up to ~1s of latency per job.

## Plan

1. Pass callback_requested true on the four stitch calls in renderOrchestratorV1 (stitchDirectV1 and the segment calls).
2. Add an in-memory map jobId -> resolver in video-api.service.ts; waitForCompletion registers a waiter and resolves on callback or on the fallback poll, whichever first.
3. In the webhook receiver, when no music_video GenerationJob matches but a waiter exists for jobId, resolve it (same signature and payload-hash checks).
4. Fallback poll every 15s instead of 1s; keep the 30 min timeout.
5. Limitation to accept or fix: the waiter map is per process, so a second backend instance or a restart loses the callback and falls back to the 15s poll. Fine on one machine.

## Reason

The video service already supports this: with callback_requested true it POSTs {jobId,status,outputFile,error} to MUSIC_VIDEO_CALLBACK_URL with a signed X-Service-Assertion (aud music-video-assembly-callback) when the job settles. Nothing is needed on our side. The change is entirely in video-api.service.ts / renderOrchestratorV1.ts / the webhook receiver.

## Related files

src/modules/video/video-api.service.ts,src/services/render/renderOrchestratorV1.ts,src/modules/video/musicVideoCallback.controller.ts

## Acceptance criteria

A render completes with at most one GET /api/v1/jobs call per 15s while waiting; the job still settles if the callback is dropped (fallback poll); a failed/cancelled job rejects the wait with the job's error.

## Test steps

—

## Thread
2026-11-05T11:38:05+05:30 aquib N: created ticket, status: - -> open
2026-11-05T12:04:28+05:30 aquib N: Constraint from the requester: reuse the existing MUSIC_VIDEO_CALLBACK_URL and its webhook route (POST /webhooks/video-processing/music-video). No new endpoint, no new env var, nothing for the other team to configure. Plan step 3 is that: the SAME receiver gets a second branch. If no music_video GenerationJob matches the attemptId, look for an in-memory waiter on jobId and resolve it, after the same assertion + payload-hash checks. Video service side needs no change; it already posts to that URL when callback_requested is true. Also: the receiver currently answers 404 'Assembly job not found' when no row matches, so that branch must run BEFORE the 404.
