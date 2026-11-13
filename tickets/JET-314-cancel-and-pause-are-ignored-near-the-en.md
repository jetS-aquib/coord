---
id: JET-314
title: Cancel and pause are ignored near the end: the run writes stitching/completed/blocked over the user's stop
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-13T13:07:26+05:30
updated: 2026-11-13T13:07:26+05:30
decisions: 
---

## Request

Make the run's own status changes conditional, so a user's cancel or pause always wins.

## Understanding

The run holds its own in-memory plan document, so its save does not see a cancel written through another document. I assume the fix is a conditional update on the status the run expects, and that losing that race means 'the user stopped it: exit quietly'.

## Plan

1. Add moveStatusV1(plan, from[], to, extra) = findOneAndUpdate({jobId, status: {$in: from}}, {$set}) returning null when the stored status moved.
2. Use it for planning/review/anchoring/rendering/verifying/stitching/completed/blocked in setPhase, the completion block and the completeness gate.
3. On null: stop the run without writing anything else (no MusicVideo update).
4. Test: cancel during stitching ends cancelled, and MusicVideo is not marked completed.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 4. cancelRenderV1 is allowed during stitching (orch:730) but the run then saves status completed over it (orch:2028), and also sets the project's finalVideoUrl. setPhase('stitching') (2018) and the blocked gate (2864) can likewise overwrite a pause/cancel made after the last stoppedSince check. doc.save() only $sets changed fields; the stored status is never in the filter.

## Related files

src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Cancel or pause at any point, including during stitching, is the final status. No completed write after a cancel.

## Test steps

1. Start a render and wait until the app says it is cutting/stitching.
2. Tap Stop.
3. When the stitch would have finished, the render is still cancelled and the project is not marked completed.

## Thread
2026-11-13T13:07:26+05:30 aquib N: created ticket, status: - -> open
