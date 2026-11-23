---
id: JET-388
title: Deleting an unfinished project should stop its render and remove its plan
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T15:47:48+05:30
updated: 2026-11-23T16:50:53+05:30
decisions: 
---

## Request

DELETE /api/music-videos/:id (musicVideo.controller.ts:119-127) only deletes the MusicVideo row: a running render keeps going (and spending) and its RenderPlanV1 rows stay. The app will offer Delete on stopped, failed, paused and in-progress projects (Library long-press, the stopped screen).

## Understanding

Assumptions: (1) delete cancels any non-terminal render for that project through the existing cancel path (POST /render/:jobId/cancel logic) before removing rows; (2) RenderPlanV1 rows for the project are deleted (or marked deleted if other code needs them for cost accounting — implementer's call, say which); (3) GCS media cleanup can be a later job and is out of scope; (4) ownership check stays userId-scoped as today; JET-278 covers related delete permissions — check it does not conflict.

## Plan

1. In delete: find active plans for projectId, cancel them.
2. Remove/mark plan rows.
3. Delete the project.
4. Test: delete during filming -> render stops, no further spend logged.

## Reason

Without it, deleting a running project leaves it filming and billing in the background.

## Related files

src/modules/musicVideo/musicVideo.controller.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Start a render, delete the project from the API while filming; within one poll the plan is cancelled, no new clips are requested, and GET /api/music-videos no longer lists it.

## Test steps

—

## Thread
2026-11-23T15:47:48+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:50:53+05:30 aquib N: status: open -> approved
