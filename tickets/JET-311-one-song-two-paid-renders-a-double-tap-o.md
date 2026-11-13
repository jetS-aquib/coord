---
id: JET-311
title: One song, two paid renders: a double tap or retry starts a second render for the same project
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-13T13:07:24+05:30
updated: 2026-11-13T13:13:46+05:30
decisions: 
---

## Request

Make it impossible for one project to have two active renders.

## Understanding

The check-then-create in startRenderV1 is not atomic, and RenderPlanV1 has only a plain index on musicVideoId. I assume 'active' means every non-terminal status (RENDER_ACTIVE set in RenderPlanV1.ts) and that 409 is already the agreed answer for 'already rendering' in api-music-videos.md.

## Plan

1. Add a partial unique index on RenderPlanV1 {musicVideoId} where status is active (non-terminal).
2. In startRenderV1, catch the duplicate-key error on create and return the existing 409 with the active jobId.
3. Check existing data for projects with two active plans before the index is built; log and fail the older one.
4. Test: two concurrent startRenderV1 calls for one project create exactly one plan.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 1. startRenderV1 checks findActivePlanV1 (orch:403), then waits on songReadV1/fillLyricsV1 (often 20s+) before RenderPlanV1.create (orch:483). Two requests in that window both pass the check and both render, and both are paid for.

## Related files

src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Two simultaneous POST /:id/render for one project: one 202, one 409 with the same jobId. Only one plan in Mongo.

## Test steps

1. Pick a project with no render.
2. Fire two POST /api/music-videos/<id>/render requests at the same time (two curl calls with &).
3. One returns 202, the other 409 naming the same jobId.
4. In Mongo, renderplanv1s has one active plan for that musicVideoId.

## Thread
2026-11-13T13:07:24+05:30 aquib N: created ticket, status: - -> open
2026-11-13T13:09:28+05:30 aquib N: status: open -> approved
2026-11-13T13:10:09+05:30 aquib N: status: approved -> in_progress
2026-11-13T13:13:46+05:30 aquib N: Built. Mongo now enforces one unfinished render per project: partial unique index one_active_render_per_project on RenderPlanV1.musicVideoId over ACTIVE_STATUSES_V1. A lost race on create, resume, rerender or the startup stitch sweep becomes the usual 409 (sweep just skips). On boot, ensureOneActiveRenderV1 marks older duplicate unfinished renders failed (newest kept, as the app already shows it) and then builds the index. Needs MongoDB 6.0+; if staging is older the boot log says 'one-render-per-project index not built' and the old guard stays. Verified on local Mongo 8.0: cleanup fails the older duplicate, two simultaneous creates give one plan + one 409. Uncommitted, waiting on the commit go-ahead.
2026-11-13T13:13:46+05:30 aquib N: status: in_progress -> review
