---
id: JET-339
title: Shots open on a split-panel grid, the still check passes it, and the editor cannot be asked to fix it
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-17T18:19:29+05:30
updated: 2026-11-17T18:23:27+05:30
decisions: 
---

## Request

Stop split-panel stills reaching filming, and let a typed edit ask for composition fixes (no panels, a wider/tighter shot).

## Understanding

Seen in E2E: several stills (and so the shots pinned to them, and the Library poster) are 2-4 panel grids. Cause: every still is drawn against the plate, which is itself a 6-panel character/location sheet, and the image model sometimes copies the layout despite the 'SINGLE FRAME' line. gateAnchorV1 checks people/location/wardrobe/anatomy but never 'is this one frame', so these pass (gate 'pass' on the panel stills of mvr_1794916057996_8297cb2e). In the editor, 'One full-frame shot, no split screen, no panels' returns 'Nothing would change' because the interpreter can only change light/place/cast/action; 'one wide shot' was likewise dropped. Rewording a shot fixed the panels as a side effect of the redraw, so a redraw is the cure. Assumption: an objective single-frame check is reliable enough to trigger a redraw (it is the kind of objective failure the gate already redraws on).

## Plan

1. frameGateV1: add a 'single frame' check (no grid, split screen or panel borders) and put it in GATE_REDRAW_ON_V1.
2. editsV1: let the interpreter return redraw-only/composition changes (single frame, shot size) so the dry run offers 'redraw these stills' (+ re-film after filming) instead of 'Nothing would change'.
3. Map shot size asks onto the existing shotSize override.
4. Tests for the new gate check wiring and the interpreter normalization.

## Reason

Grids in the first seconds of a video (and on the Library card) are the most visible quality defect in the demo.

## Related files

src/services/render/frameGateV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/editsV1.ts

## Acceptance criteria

A render's stills are single frames (a panel still is redrawn by the gate); typing 'no split screen' on a shot gives a dry run that redraws it; 'make it a wide shot' changes the shot size.

## Test steps

—

## Thread
2026-11-17T18:19:29+05:30 aquib N: created ticket, status: - -> open
2026-11-17T18:23:27+05:30 aquib N: status: open -> approved
