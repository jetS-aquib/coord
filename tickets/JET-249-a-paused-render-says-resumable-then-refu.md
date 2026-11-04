---
id: JET-249
title: A paused render says resumable, then refuses resume until its in-flight clips land
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-04T00:13:28+05:30
updated: 2026-11-04T11:43:02+05:30
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

1. Start a render and let it reach `anchoring` or `rendering` with clips in flight.
2. `POST /api/v1/music-videos/render/:jobId/pause` -> 202, status `paused`.
3. **Immediately** `POST .../resume` -> 202, not 409. Poll `GET .../render/:jobId`:
   status still `paused`, `resumable: true`, `resumeQueued: true`. The log reads
   `resume accepted — picks up once the shots in flight land`.
4. Keep polling. Once the in-flight clips land, status goes to `queued` and then
   `rendering` with no further tap, `resumeQueued` back to `false`, and the log reads
   `resuming — N/M clips already done`. No new clip is billed twice.
5. Repeat steps 1-3, then `POST .../cancel` before the clips land. It ends `cancelled`
   and does NOT start again on its own.
6. `POST .../resume` on a `rendering` render still 409s — and names `rendering`.

## Thread
2026-11-04T00:13:28+05:30 aquib N: created ticket, status: - -> open
2026-11-04T11:40:40+05:30 aquib N: status: open -> approved
2026-11-04T11:41:23+05:30 aquib N: status: approved -> in_progress — picked it up
2026-11-04T11:43:02+05:30 aquib N: status: in_progress -> review — Built: resume is now accepted the instant a render stops (paused, or cancelled), even while its in-flight shots are still landing. The draining run hands over when it exits; status stays paused until then on purpose — flipping it to queued mid-drain would let the old run skip the pending clips and block the song. New resumeQueued on the state payload so mobile can say 'picking up' instead of looking as if the tap did nothing. 409 now only ever names a status that really cannot resume. Contract updated. Mobile: drop the retry note, and show resumeQueued if you want the in-between to read right.
