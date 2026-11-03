---
id: JET-245
title: The seam threshold was calibrated on 9:16 only, so a 16:9 render redraws three quarters of its clips
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-03T16:19:01+05:30
updated: 2026-11-03T16:19:01+05:30
decisions: 
---

## Request

Re-base SEAM_THRESHOLD_V1 for 16:9 the way JET-200 re-based it for 9:16, off real renders rather than hand-picked pairs. Then decide whether to cap the redraw at a first-take score above which it has historically never paid.

## Understanding

Reported as 'too many regenerations' off a working screen showing four of five clips with the rotate-cw glyph — which shot-strip.tsx maps to the 'regenerating' state, so it is a status and not a button. The report is accurate.

Measured across all 42 scored renders in renderplanv1, 1509 clips:

  frame   renders  clips   over 9.0        median seam
  9:16    42       1484    375  (25%)      5.50
  16:9     1         25     19  (76%)     16.36

SEAM_THRESHOLD_V1 is 9.0, set from the 132 clips in renderV1.test.ts's LIVE_SEAM_SCORES, read 2026-10-26. Every one of those renders is 9:16. On 16:9 there is no gap for it to sit in: the median clip is at 16.36, nearly double the threshold, so three quarters of them trip it and the whole re-render budget is spent in the intro.

The prompt is not the lever, and this is the part worth not re-deriving. The seam score measures whether the model honoured its pinned start and end frames, not what the text said. A second take reproduces the first take's band rather than scattering — [29.61, 32.70], [13.19, 13.00], [28.48, 27.55], [37.02, 36.55]. Across 160 redraws of an over-threshold clip only 50 ended under 9.0 (31%), and above a first take of 30 it is 5 of 39 (13%).

Assumptions, each worth correcting rather than inheriting: (1) 16:9 is ONE render, so the frame is a hypothesis and not yet a measurement — the gap is large but n=1, and this repo has been wrong this way before, which is why the existing comment insists the threshold come from real renders. (2) The 29 clips redrawn despite passing the seam check are NOT part of this: they are the continuity supervisor catching wardrobe, people count, lettering and anatomy, that path already rewrites the prompt with the failure sentence and reverts when the retake is no better, and it is working as designed. (3) 25% on 9:16 is by design, not a defect — renderV1.test.ts asserts the threshold trips at most a quarter of clips, so 9:16 is already at its intended limit and nothing here should move it.

## Plan

1. Render two or three more 16:9 songs so the frame is a measurement and not one data point. Nothing else starts before that.
2. If the gap holds, read every 16:9 seamScore the way LIVE_SEAM_SCORES was read, and find the body/tail gap for that frame.
3. Make the threshold per-frame rather than a single constant, and extend the LIVE_SEAM_SCORES test with the 16:9 set so the next person checks against both.
4. Separately decide the redraw ceiling: a first take above ~30 rescues 13% of the time, so skipping it saves ~34 clips of spend per 42 renders and loses 5 marginal rescues. Spend against visible cuts — a person's call, and a decision record if taken.
5. Leave the drift and refusal paths alone.

## Reason

A 16:9 render spends its whole re-render budget in the intro and then keeps every later over-threshold clip anyway, so it pays for a second full pass that changes nothing and still ships the cuts. That is the exact failure the October re-base fixed for 9:16 — the orchestrator even warns for it: 'If this fires every render the threshold is wrong, not the clips.'

## Related files

src/services/render/seamCheckV1.ts, src/services/render/renderV1.test.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

A 16:9 render trips the threshold on a minority of its clips, the way a 9:16 one does, and the LIVE_SEAM_SCORES test carries a 16:9 set alongside the 9:16 one so neither frame can be re-tuned without checking the other. 9:16 behaviour is unchanged: the same 132 clips still give the same answers.

## Test steps

—

## Thread
2026-11-03T16:19:01+05:30 aquib N: created ticket, status: - -> open
