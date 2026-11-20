---
id: JET-378
title: Every shot comes back reworded for 'Image tags representing real people will not render'
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-20T12:24:27+05:30
updated: 2026-11-20T12:24:27+05:30
decisions: 
---

## Request

On a render with a cast (Rohan directing, 66 shots), GET render state returned 66 warnings, one per shot, all with reason 'Image tags representing real people will not render.' The cast are generated characters, not real people, so the rewrite looks like it fires on the cast's image tags in every prompt rather than on actual real-person content. Find out why and stop it rewriting shots that name only the generated cast.

## Understanding

The app just shows plan.warnings (served at renderOrchestratorV1.ts ~2388). The reason string is not in the backend source (grep finds no 'Image tags representing real people'), so it is most likely written by a model in the plan-time prompt-policy rewrite and stored on plan.warnings. Assumption: cast references like image tags or @cast tags in scene prompts are being read as 'real people'. If those tags really do get refused by the video model, the rewrite is right and only the wording of the reason should change; that is for the backend to decide.

## Plan

1. Find where plan.warnings is filled at plan time and what produces the reason text.
2. Reproduce with a cast render; check whether the cast's image tags trigger the real-person rule.
3. Exclude the generated cast from that rule, or, if the video model really refuses them, say so in a plain reason.
4. Confirm a cast render comes back with 0 warnings (or only real ones).

## Reason

Every shot of a cast render is silently reworded, so the video drifts from the shot list the person approved, and the app's notice reads as noise.

## Related files

src/services/render/renderOrchestratorV1.ts, src/models/RenderPlanV1.ts

## Acceptance criteria

A render whose only people are its generated cast returns no 'real people' warnings.

## Test steps

—

## Thread
2026-11-20T12:24:27+05:30 aquib N: created ticket, status: - -> open
