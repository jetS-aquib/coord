---
id: JET-313
title: Every deploy brings cancelled videos back: the startup sweep re-queues user-cancelled renders
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-13T13:07:26+05:30
updated: 2026-11-13T13:30:31+05:30
decisions: 
---

## Request

Stop the startup stitch-only sweep from resurrecting renders the user cancelled.

## Understanding

The sweep was meant for renders stranded by a crash during stitching, which end as failed, not cancelled. Cancelled is always the user's word. I assume no other code relies on cancelled plans being revived.

## Plan

1. Select only status: failed.
2. Skip a plan if its project already has another active plan.
3. Test: a cancelled fully-filmed plan stays cancelled after resumeStitchOnlyPlansV1 runs.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 3. resumeStitchOnlyPlansV1 (orch:1213-1229) selects status in ['failed','cancelled'] with no finalVideoUrl and all clips done, sets queued and kicks it. A user who cancelled gets the video stitched anyway, and if a newer render exists for the project the old one can overwrite its finalVideoUrl.

## Related files

src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

After a restart, a cancelled render stays cancelled. A failed fully-filmed render with no newer render is still picked up.

## Test steps

1. Start a render, let all clips finish, cancel it during stitching.
2. Restart the backend.
3. The render is still cancelled in the app and in Mongo; no new stitch is logged.

## Thread
2026-11-13T13:07:26+05:30 aquib N: created ticket, status: - -> open
2026-11-13T13:28:10+05:30 aquib N: status: open -> approved
2026-11-13T13:29:28+05:30 aquib N: status: approved -> in_progress
2026-11-13T13:30:31+05:30 aquib N: Built. The startup stitch sweep now takes status 'failed' only (cancelled is always the user's word), and skips any render whose song has a newer render, finished or not, so an old stitch can't replace a newer video. That also covers renders JET-311's boot cleanup marked failed. Verified on local Mongo: cancelled stays cancelled, a failed latest render is picked up, a failed render with a newer completed one stays failed. No mobile change: a cancelled render already shows as stopped.
2026-11-13T13:30:31+05:30 aquib N: status: in_progress -> review
