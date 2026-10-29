---
id: D-040
title: The frame gate spends on what it can count, and only records what it must judge
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

Batch 7B.1. A vision model now reads every anchor still against that shot's stated constraints before any clip is pinned to it. The gate produces five verdicts per frame — people count, location, wardrobe, text artefacts, malformed anatomy — and each one can trigger a redraw costing one image call. Nothing in this codebase has ever measured how often a vision model is WRONG about a generated frame, so the false-fail rate of all five is unknown. Measured first: 28 render plans in Mongo, 25-74 anchors each (typically 32-46); on the baseline render mvr_1793274379080_caa2155d every one of 45 clips carries castTags (38 want 1 person, 7 want 2) and an environment, and the look bible states a location per section label and wardrobe per cast tag. So the gate has a stated constraint on every frame and costs 32-46 vision calls against a ~$25 render.

## Options considered

1. Redraw on any of the five. Maximum catch, and the unknown false-fail rate is multiplied by five kinds and 45 frames. 2. Redraw on none — record everything, spend nothing, decide next render. Free and catches nothing, which is the empty chair this batch exists to fill. 3. Score the five and redraw above a threshold. This is the 4.0 seam threshold again, built the same way, against a distribution nobody has. 4. Split by how objective the verdict is: spend on the countable and categorical, record the rest.

## Decision

Option 4. GATE_REDRAW_ON_V1 in frameGateV1.ts holds exactly three kinds — people, location, text. A people failure is an integer against the integer the shot list stated. A location failure is a named place, present or absent. Lettering in a frame is a defect under any treatment. Those three are redrawn once, with the failure sentence appended to the prompt. Wardrobe and anatomy are recorded on the anchor and never paid for: both are a 'does this match' judgement over detail, and vision models over-report malformed hands loudly. Every verdict — pass, fail and unchecked alike — is written to RenderPlanV1.anchors[].gate (7B.5), and one summary line per render goes to the log. There is no score and no threshold anywhere in the file.

## Reason

Three numbers in this codebase have now been chosen against a distribution nobody had measured: the 4.0 seam threshold, the 0.70/0.90 cut-rate line, and trusting Whisper's language field. A confidence threshold on a vision verdict would be the fourth, so the gate does not have one — it compares integers and booleans in code, where the comparison is readable and unit-tested without an API key. The split is not a compromise between options 1 and 2, it is the line between a verdict that can be checked by reading it and one that cannot. 'It counted 3 people and the shot said 2' is auditable from the stored verdict months later; 'it felt the jacket was wrong' is not, and paying for the second kind before measuring it is how an unmeasured number gets into the pipeline. Recording both halves is what lets the list move on evidence: when the stored verdicts show wardrobe failing rarely and correctly, moving it into GATE_REDRAW_ON_V1 is one line.

## Consequences

A wrong jacket and a six-fingered hand still reach the master in this version; they are visible on the plan rather than invisible, which they were not before. The gate costs one vision call per anchor plus a fifth of that again for re-checks (gateBudgetV1), capped the same way rerenderBudgetV1 caps clip re-renders — a song the model dislikes costs a log line and a flagged render, not an unbounded bill. A plan with no shot list and no look bible states nothing, is skipped entirely and costs zero, which is what makes the gate safe to leave on by default (RENDER_FRAME_GATE=0 turns it off). Every path fails soft: an unavailable vision model records the anchor 'unchecked' and the render proceeds exactly as before. The first render under this produces the distribution that decides whether the list widens, whether MAX_ANCHOR_REDRAWS_V1 should be more than 1, and whether D10's second vision provider is worth the dependency.
