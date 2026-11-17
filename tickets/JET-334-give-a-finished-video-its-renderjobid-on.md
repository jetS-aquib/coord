---
id: JET-334
title: Give a finished video its renderJobId on GET /api/music-videos/:id so the app can open the editor studio
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T16:19:16+05:30
updated: 2026-11-17T16:57:12+05:30
decisions: 
---

## Request

Return renderJobId (the jobId of the project's newest completed render) on the music video record from GET /api/music-videos/:id.

## Understanding

The video screen (opened by project id) can call pollRender(jobId) for clipMap, undoableEdits, per-clip locked/takes and thumbnails, then proposeEdit/applyEdit/undoEdit/lockClip. I assume the cheapest fix mirrors JET-310: write renderJobId onto the MusicVideo record when a render completes (and keep it on a re-stitch or edit), absent = no studio. Alternative I would accept: GET /:id/render also returns the newest completed plan.

## Plan

1. Set MusicVideo.renderJobId when a render completes (and backfill from the newest completed RenderPlanV1 on read for older projects). 2. Return it on GET /api/music-videos/:id. 3. Document it in api-music-videos.md. 4. Mobile (JET-332) shows the editor only when it is present.

## Reason

JET-326/327 put every edit, undo, lock and clipMap under /render/:jobId, but GET /:id/render answers 404 once a render is completed and the project record carries no jobId. The video screen only knows the project id, so the editor studio (JET-332) cannot reach the render it must edit.

## Related files

src/models/MusicVideo.ts, src/modules/musicVideo (GET /api/music-videos/:id), .coord/contracts/api-music-videos.md

## Acceptance criteria

A project with a finished render returns renderJobId; GET /render/:jobId for it returns clipMap and undoableEdits; a project with no finished render omits it.

## Test steps

1. Open a project with a finished v1 render: `GET /api/music-videos/:id` → has `renderJobId`.
2. `GET /api/v1/music-videos/render/<renderJobId>` → payload has `clipMap` and `undoableEdits`.
3. A project that never finished a render → no `renderJobId` field.
4. Start a re-film from the editor (`…/clips/rerender`); while it runs, `GET /api/music-videos/:id` still returns the same `renderJobId`.

## Thread
2026-11-17T16:19:16+05:30 aquib N: created ticket, status: - -> open
2026-11-17T16:54:38+05:30 aquib N: status: open -> approved
2026-11-17T16:57:12+05:30 aquib N: status: approved -> in_progress
2026-11-17T16:57:12+05:30 aquib N: status: in_progress -> review — Built in music-jetkreate-backend (uncommitted). Contract updated. Tests green (captchaBypass failure is pre-existing, unrelated).
