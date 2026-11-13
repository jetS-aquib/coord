---
id: JET-316
title: 'Updating captions' can stay on forever: the restitch queue lives in memory and nothing clears a stale flag
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-13T13:07:28+05:30
updated: 2026-11-13T13:07:28+05:30
decisions: 
---

## Request

Clear captionsUpdating when the restitch that set it is gone.

## Understanding

This is my own JET-308 code. A restitch takes minutes, so anything older than ~15 minutes is dead. I assume a sweep is enough; a lost restitch does not need to be re-run automatically because the next lyrics edit re-queues it.

## Plan

1. Store captionsUpdatingSince alongside the flag.
2. On startup and on the existing periodic timer, clear captionsUpdating where captionsUpdatingSince is older than 15 minutes (plan and MusicVideo).
3. Clear the project flag only if no other plan of that project is still restitching.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 10. restitchesV1 (orch:3821) is a per-process Map; captionsUpdating is set on plan and MusicVideo (3845/3848) and cleared in a finally (3865). A crash or deploy mid-restitch leaves it true, and the app polls it every 6s forever.

## Related files

src/services/render/renderOrchestratorV1.ts, src/models/RenderPlanV1.ts, src/models/MusicVideo.ts

## Acceptance criteria

After a crash mid-restitch, the flag is cleared within 15 minutes of restart or sweep.

## Test steps

1. Edit lyrics on a finished video so it starts updating captions.
2. Kill the backend mid-restitch and start it again.
3. Within 15 minutes the video screen stops saying 'Updating captions'.

## Thread
2026-11-13T13:07:28+05:30 aquib N: created ticket, status: - -> open
