---
id: D-043
title: The measured check spends first; the clip check gets what is left, and never for a judgement
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-222
---

## Context

Batch 7B.2 and 7B.3. The clip check samples two frames from the middle of every finished clip and judges them against the same stated constraints the still was judged against, plus whether the people still match the plate. It now sits in verifyClipV1 beside the seam check, which the delivery plan asked for in those words: one place decides whether a shot is kept, on the same re-render budget, or there will be two thresholds disagreeing — which is exactly what the 4.0 seam cost. That raises a question D-040 did not have to answer. D-040 governed the frame gate, where acting on a failure means redrawing a still for cents. Here acting on a failure means re-rendering a clip for dollars, out of the fifth-of-the-song budget (rerenderBudgetV1) that the seam check already draws on. Same split, different stake.

## Options considered

1. Copy D-040 unchanged — people, location and text all re-render. Treats a dollar like a cent. 2. Give the clip check its own separate budget. Two budgets is two fuses and, in practice, two thresholds that disagree — the thing the plan explicitly warned against. 3. Record everything, spend nothing. Safe, and leaves the empty chair empty: a clip that drifted still ships. 4. One budget, one place, with an explicit order of claim: the measured check spends first and the unmeasured one spends what is left, on a narrower list.

## Decision

Option 4. verifyClipV1 now calls verifySeamOfClipV1 and then checkInsideClipV1, in that order, against the one RerenderBudgetV1 the render already had. The seam check is unchanged and has first claim. CLIP_REDRAW_ON_V1 is ['people','location'] — strictly narrower than the gate's GATE_REDRAW_ON_V1, which also holds 'text'. Lettering is dropped because a still with a caption is cents to redraw and the stills feeding every clip have already been through the gate's text check, so paying a dollar for it is paying twice for one defect. Continuity (7B.3) is recorded and never spent on. Every verdict lands on RenderPlanV1.clips[].clipCheck, passes included, with one summary line per render. A re-render for drift re-measures BOTH checks and keeps the first take unless the drift actually improved.

## Reason

The ordering is the whole decision and it is not a convenience. The seam threshold is 9.0 measured over 132 clips across five renders (D-018); the clip check is measured over nothing at all, because this is the commit that creates it. An unmeasured check that can consume the budget a measured one needs is a regression against the current baseline dressed as an improvement — on a strict vision model it would spend the entire fifth on false positives and leave genuine seam failures unfixed, and the log would look like the gate working. Evaluating the seam first in the same function makes the order structural rather than a comment. Narrowing the list rather than copying D-040 follows from the stake changing by two orders of magnitude: a cent buys a guess, a dollar should not. Continuity stays unpaid for the reason D-040 already gave about wardrobe — 'is this the same person' over a generated face is the fuzziest judgement in the batch, and it is the one most likely to be wrong in the direction that costs money. 7B.3 is asked against the PLATE rather than against the previous clip, which answers the same question transitively for all 45 clips, needs no ordering between clips that are checked concurrently as they land, and costs no extra call.

## Consequences

A clip that drifts in a way the vision model calls wardrobe, text or continuity still ships; it is now visible on the plan where it was invisible before, which is the 7B 'done when' — the number of hallucinated shots reaching the master is measured rather than estimated. Spend is bounded by the existing budget and cannot exceed it, so the worst case of a strict model is that the budget is spent on drift instead of seams, never that it is spent twice. The clip check costs one extraction call (two frames, maxWidth 768, JET-222) and one vision call per clip — about 45 of each on a 45-clip song, against ~$25. A render with no shot list and no look bible states nothing, so every clip is skipped and the cost is zero, same as the gate. RENDER_CLIP_CHECK=0 turns it off independently of RENDER_FRAME_GATE. The first render under this produces the distribution that decides whether CLIP_REDRAW_ON_V1 widens, whether continuity is trustworthy enough to pay for, and whether D10's second vision provider is worth the dependency. Nothing about the seam check, its threshold or its band moved, so the numbers already held stay comparable.
