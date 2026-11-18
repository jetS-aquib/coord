---
id: JET-357
title: Motion-safe clips: travel shots start-pinned only with direction in words; in-place shots end on an edit of their opening still
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-18T17:10:45+05:30
updated: 2026-11-18T17:10:45+05:30
decisions: 
---

## Request

Replace JET-350's blanket closing still. Class each shot from its action: travel (walk, run, cross, drive), in-place (turn, reach, laugh), camera-only. Travel and camera-only: start frame only, prompt states direction of travel. In-place: closing still made by EDITING the opening still (Gemini image edit), connecting move named. Clip prompt with a start frame = motion only. Clips capped at 6 s where the cut allows.

## Understanding

shotPins (JET-350) caused walk-then-reverse: closing still nearly identical to the opening one on travel shots; first/last-frame models read that pair as a return trip (VTG, arXiv 2508.01698). shotPins is off now. Assumed: action class from a verb list on the shot action (no model call), and the 6 s cap is via cutPlan durations only where musical timing allows. Behind flags.render.motionPins.

## Plan

1. shotMotionClassV1 (pure) + tests.
2. renderOneClipV1: per class, start-only or start+edited close.
3. Close still via image edit of the opening still, gated as today.
4. Motion-only clip prompt when start-pinned.
5. Verify on the eval set with JET QA counts.

## Reason

Reversals were the most visible hallucination in the last render.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/renderPromptsV1.ts, src/services/render/cutPlanV1.ts

## Acceptance criteria

Eval renders (Tu Mil Jaaye, Ashke x Zoya, Rohan, Jassi): zero reversals reported by clip QA.

## Test steps

—

## Thread
2026-11-18T17:10:45+05:30 aquib N: created ticket, status: - -> open
