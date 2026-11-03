---
id: JET-249
title: A paused render says resumable, then refuses resume until its in-flight clips land
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-04T00:13:28+05:30
updated: 2026-11-04T00:13:28+05:30
decisions: 
---

## Request

Make resume on a paused render work immediately, or make the state honest until it can.

## Understanding

Resume's guard rejects while the runner is still draining, though the contract says resume is valid on paused. Assumptions: (1) the 409 is the running.has(jobId) half of the guard, not the status half, since RESUMABLE_STATUSES_V1 includes 'paused'; I read this from the code and have not reproduced it server-side; (2) mobile is not blocked, it already handles this 409 by staying on the paused screen and asking the person to retry; (3) which fix is yours: either resume waits for the drain, or pause returns only once in-flight clips have landed, or resumable reads false until the runner has exited.

## Plan

1. Pick one: resume awaits the runner exit then continues, or pause awaits the drain before answering, or resumable is false while running.has(jobId). 2. Make the 409 message say 'still finishing in-flight shots' when that is the cause, not 'is paused'. 3. Update the contract paragraph on pause. 4. Mobile then drops its retry note, no other change.

## Reason

pauseRenderV1 sets status 'paused' straight away but the run stays in the in-process running set until in-flight clips land (up to minutes). resumeRenderV1 then 409s on running.has(jobId) with 'Only a stopped render can be resumed; this one is paused.' — wrong message, and the payload meanwhile says resumable: true. Seen on a real device pausing at 0 of 45 and tapping Pick it up at once. Follow-up to JET-242.

## Related files

src/services/render/renderOrchestratorV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

Pause a render mid-anchoring, tap resume at once: it either continues or the state says it cannot yet, and no 409 reads 'this one is paused'.

## Test steps

1. Start a render, pause during anchoring or rendering. 2. Immediately POST .../resume. 3. Expect 202 (continues once the in-flight clips land) or resumable:false with a reason; never a 409 naming paused.

## Thread
2026-11-04T00:13:28+05:30 aquib N: created ticket, status: - -> open
