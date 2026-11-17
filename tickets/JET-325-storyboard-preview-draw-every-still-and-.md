---
id: JET-325
title: Storyboard preview: draw every still and stop, so the user approves the real keyframes before any clip is paid for
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T15:35:49+05:30
updated: 2026-11-17T15:56:01+05:30
decisions: D-083
---

## Request

Add a preview stage between the call sheet and filming. Accept gets a mode: 'preview' draws all anchor stills and stops; 'film' behaves as today. Call sheet rows carry each shot's opening/closing still. Filming after a preview reuses the approved stills. Edits before spend redraw only the stills they touch.

## Understanding

Every clip is already pinned to its opening and closing anchor still (omniVideoService, isSceneBoundaryV1), so approved stills = approved first/last frame of each clip; the preview is the real keyframes, not a mock-up. Assumptions: a new status 'previewing' that returns to 'review' with stills present; the still costs (~$0.03 each, ~$1-1.5/song) are acceptable pre-spend; the animatic is played on the device, so no server slideshow is needed (D- to be recorded). Stills drawn in preview count toward the plan's cost line. Frame gate (gateAnchorV1) still runs per tier.

## Plan

1. Add 'previewing' to RenderPlanV1 statuses; treat it as pre-spend for edits.
2. POST /render/:jobId/accept takes {mode:'preview'|'film'} (default film for back-compat).
3. runPlanV1: in preview mode run renderAnchorsV1 only, then park in review with stills.
4. callSheetV1: add openingStillUrl/closingStillUrl per row + anchor status.
5. renderAnchorsV1 skips anchors that already have an image when filming starts.
6. Pre-spend edits (PATCH clip, shot regenerate, scoped edit) mark only touched anchors stale and redraw them.
7. Update api-music-videos contract; tests for skip-existing-anchor and preview→film.

## Reason

Users only see pictures after paying for a full render; serious users need to steer before spend.

## Related files

src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/callSheetV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A preview render ends in review with every row showing its stills and no clip spend in GenerationLog; 'film' afterwards draws no new stills for untouched shots.

## Test steps

1. Start a render with `POST /api/v1/music-videos/:id/render` body `{ "review": true }`, wait for status `review`.
2. `POST /api/v1/music-videos/render/:jobId/accept` body `{ "mode": "preview" }` → status goes `previewing` then back to `review`.
3. `GET …/render/:jobId/call-sheet` → every row has `openingStillUrl`/`closingStillUrl` and `stillStatus: "drawn"`; `stillsDone == stillsTotal`. Clips are all still `pending` on the poll (no clip spend).
4. `PATCH …/render/:jobId/clips/3` body `{ "action": "she walks away in the rain" }` → only row 3's opening still goes `pending`, is redrawn, and the plan returns to `review`.
5. `POST …/accept` (empty body) → filming starts; `anchorsDone` already equals `anchorsTotal` and no new stills are drawn for the untouched shots.

## Thread
2026-11-17T15:35:49+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
2026-11-17T15:40:08+05:30 aquib N: status: open -> approved
2026-11-17T15:56:00+05:30 aquib N: status: approved -> in_progress
2026-11-17T15:56:01+05:30 aquib N: status: in_progress -> review — Built in music-jetkreate-backend (uncommitted). Contract api-music-videos updated. Render tests green.
