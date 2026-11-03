---
id: JET-242
title: Pause a render, so somebody watching it go wrong can stop the spend without throwing the plan away
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-03T15:19:52+05:30
updated: 2026-11-03T23:34:06+05:30
decisions: 
---

## Request

POST /api/v1/music-videos/render/:jobId/pause, a 'paused' status on the state payload, and resume valid on it.

## Understanding

9.6, and only half of it exists. Cancel is there and mobile uses it; resume is there and mobile now calls it (JET-239, so a dead render offers Pick it up where it stopped instead of a Try again that would re-pay for all 45 clips). Pause is not a route, so there is nothing for mobile to put a button on. The difference is the point: cancel ends the render, pause keeps the plan, stops dispatching new clips, and lets the ones in flight land because they are already paid for. Resume then continues from the per-clip checkpoints 2.3 and 2.4 already wrote, which is the same route mobile is calling today. Assumptions: (1) 'paused' arrives as a new status on the state payload with resumable true, which means the contract api-music-videos.md changes and music-jetkreate-backend owns it; (2) mobile's RenderStatus union widens the same day, otherwise an unseen status is read as queued and a paused render looks like one that never started; (3) pause is valid only while a render is actually dispatching (anchoring, rendering, verifying) and 409s elsewhere, same shape as the stitch route; (4) a paused render does not time out and get swept, or pause is just a slow cancel.

## Plan

1. POST /api/v1/music-videos/render/:jobId/pause, 202. Stops dispatch at the next clip boundary, lets in-flight clips land and be recorded, keeps the plan.
2. status 'paused' on the state payload, resumable true.
3. resume accepted on 'paused' alongside cancelled, failed and blocked.
4. 409 on a status where pausing means nothing, and say which in the body.
5. Update .coord/contracts/api-music-videos.md, which you own.
6. Tell mobile. Our half: widen the status union, a Pause beside Leave it running, and the same pickUp path we already have for resume.

## Reason

A render is roughly fourteen minutes and real money. Today the only way to stop one is cancel, and the only thing offered after a stop used to be a fresh render from the top. A person who sees the plan going wrong at shot 9 has no way to hold it.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

Pausing a render mid-flight stops new clips being dispatched, the clips already in flight finish and are kept, the state reads 'paused' with resumable true, and resuming it afterwards costs only the clips that were never started.

## Test steps

—

## Thread
2026-11-03T15:19:52+05:30 aquib N: created ticket, status: - -> open
2026-11-03T23:34:06+05:30 aquib N: status: open -> approved
