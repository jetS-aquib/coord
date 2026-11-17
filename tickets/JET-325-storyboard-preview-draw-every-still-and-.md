---
id: JET-325
title: Storyboard preview: draw every still and stop, so the user approves the real keyframes before any clip is paid for
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-17T15:35:49+05:30
updated: 2026-11-17T15:35:49+05:30
decisions: 
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

—

## Thread
2026-11-17T15:35:49+05:30 aquib N: created ticket, status: - -> open
