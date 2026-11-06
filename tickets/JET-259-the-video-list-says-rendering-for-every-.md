---
id: JET-259
title: The video list says Rendering for every render that failed, paused or got stuck
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-06T13:27:02+05:30
updated: 2026-11-06T13:27:44+05:30
decisions: 
---

## Request

MusicVideo.status is enum draft|in_production|completed (models/MusicVideo.ts:56). renderOrchestratorV1 sets in_production at start (line ~1687) and completed at the end, and nothing ever moves it on failure, pause, block or cancel. So GET /api/music-videos returns in_production for a render that is failed, paused, blocked, cancelled or dead after a restart, and the mobile home grid badges all of them RENDERING. Please put the render's own state on each project in the list response: e.g. renderStatus (queued|planning|review|anchoring|rendering|verifying|stitching|blocked|paused|completed|failed|cancelled) and resumable, taken from the latest job for that musicVideoId, and ideally flip a stalled job (no checkpoint for N minutes with no live worker) to failed so it is not stuck forever. Do not change MusicVideo.status semantics for the web client.

## Understanding

Seen on the mobile home grid: failed and stuck renders show RENDERING. I read the backend: project status has only three values and the orchestrator never writes a failure to it. I assume the latest render job per project is the right source and that a list-time join is acceptable. I have not checked how the web client reads status.

## Plan

1. Join the latest render job per musicVideoId into the list response as renderStatus and resumable. 2. Add stall detection that marks a worker-less job failed. 3. Keep MusicVideo.status as is. 4. Tell mobile when it lands.

## Reason

Creators cannot tell a render that is working from one that needs them, and a dead render looks alive indefinitely. Mobile cannot derive it: asking activeRender() per project from a list of N videos is N extra calls on every refresh.

## Related files

src/models/MusicVideo.ts,src/modules/musicVideo/musicVideo.controller.ts,src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

List response includes renderStatus and resumable for every project that has a render job. A failed, paused, blocked and cancelled render each show their own value. A render with no live worker and no checkpoint past the stall window reports failed. Web client unaffected.

## Test steps

—

## Thread
2026-11-06T13:27:02+05:30 aquib N: created ticket, status: - -> open
2026-11-06T13:27:44+05:30 aquib N: status: open -> approved
2026-11-06T13:32:10+05:30 aquib N: Part 1 built (renderStatus, resumable, read-only stalled flag on GET /api/music-videos). Deliberately NOT flipping stalled jobs to failed: 'running' is per-process (JET-254 may run several instances), a stitch can go ~12 min with no write, and failed lets a second render start over a live one (double spend). Needs a cross-instance heartbeat first; suggest its own ticket.
