---
id: JET-352
title: No grid still reaches a clip: redraw without the six-panel plate, then crop the largest panel
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T15:30:13+05:30
updated: 2026-11-18T15:52:35+05:30
decisions: 
---

## Request

When the still check says a still is a grid (panels), redraw it without the six-panel cast plate as a reference (cast text plus the place plate). Allow up to 3 redraws for panels. If it is still a grid, crop the largest panel with ffmpeg and use that. A grid is never pinned.

## Understanding

Quality first: more redraws, and crop rather than film unpinned. Assumed: panel borders show as near-uniform horizontal or vertical lines, found with a per-row and per-column variance scan of the image. The cropped panel is scaled back up and re-checked once. Other failure kinds keep MAX_ANCHOR_REDRAWS_V1 = 1.

## Plan

1. gateAnchorV1: a panels fail switches paintFor to a no-sprite reference and allows 3 redraws.
2. cropLargestPanelV1 (ffmpeg plus a pure border-scan function) as the last step, then one more check.
3. Tests: border scan on synthetic 2- and 3-panel images; the redraw path drops the sprite.

## Reason

On mvr_1794989625320_48693f7a 10 of 58 stills were multi-panel grids, redrawn once, still grids, and filmed anyway. That is also where the split-panel clips in the Rohan render came from.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/frameGateV1.ts

## Acceptance criteria

In a stills preview, zero stills whose final verdict includes panels; no split frame in the finished video.

## Test steps

1. `npx vitest run src/services/render/panelCropV1.test.ts src/services/render/frameGateV1.test.ts` passes.
2. Start a stills preview (preview: true) of Tu Mil Jaaye with Zoya, 9:16.
3. Logs: a `panels` gate fail is followed by redraws (up to 3), and if still a grid, `grid replaced by one of its panels`.
4. renderReport on that job: gridStills 0 (the final verdict on no still includes panels).
5. Look at the stills: no split screens.

## Thread
2026-11-18T15:30:13+05:30 aquib N: created ticket, status: - -> open
2026-11-18T15:33:50+05:30 aquib N: status: open -> approved
2026-11-18T15:46:56+05:30 aquib N: status: approved -> in_progress
2026-11-18T15:46:56+05:30 aquib N: Built: grid redrawn up to 3x without the six-panel plate, then up to 3 panel crops, each checked; best kept. Panel detection verified on all 10 grids of mvr_1794989625320_48693f7a. Also raised the still-check budget to 2N under flags.render.gridFix (the Zoya render ran out at anchor 45). Needs a stills preview before review.
2026-11-18T15:52:35+05:30 aquib N: status: in_progress -> review — Committed in e204b8c. Grid stills redrawn up to 3x without the six-panel plate, then up to 3 panel crops checked by the gate, best kept; check budget 2N under flags.render.gridFix. Panel detection verified on all 10 grids of mvr_1794989625320_48693f7a. Verify with a stills preview per Test steps.
