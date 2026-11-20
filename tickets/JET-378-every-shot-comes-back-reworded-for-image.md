---
id: JET-378
title: Every shot comes back reworded for 'Image tags representing real people will not render'
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-20T12:24:27+05:30
updated: 2026-11-20T13:07:05+05:30
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

1. Film a render with a cast (any director with people, e.g. Rohan / bollywood). GET render state: warnings is empty, or only names real people/brands that were actually in the shot list; never "Image tags representing real people".
2. The call sheet's shot prompts still say @image1 / @image2 where the shot list put them (not "a woman").
3. A special request naming a real actor ("styled like Deepika Padukone") still comes back with a warning and the name replaced.
4. Server log, if the model misfires again: "[PromptSafetyV1] ignored N rewrite(s) that removed our own cast tags".
Regression sheet row TC-096.

## Thread
2026-11-20T12:24:27+05:30 aquib N: created ticket, status: - -> open
2026-11-20T13:03:26+05:30 aquib N: status: open -> approved
2026-11-20T13:07:05+05:30 aquib N: Cause: the plan-time safety pass (promptSafetyV1.sanitizePromptsV1, one text call at MINIMAL thinking) sometimes reads the shot list's @image1/@image2 cast tags as real people and replaces them with 'a woman'. Intermittent: 1 of the last 12 cast renders (mvr_1795156396084_b3d17799, all 66 shots), 0 on the other 11. It was not harmless rewording: renderPromptsV1 later swaps each @imageN for that cast member's description, so the rewritten shots lost which person they were. Fix in the shared function, so every caller (plan, special-request rewrite, typed edits, shot action, single-shot refilm) gets it: (1) the instruction says @imageN tags are our invented characters, never refused, keep them as written (also in the refusal-fix prompt); (2) code drops any rewrite whose set of @imageN tags differs from the original's, logged. A real name next to a tag is still rewritten. Live: the 66 original prompts of that render re-run through the pass -> 0 rewrites. No mobile change: the app keeps showing plan.warnings, which will now be real ones only.
2026-11-20T13:07:05+05:30 aquib N: status: approved -> in_progress
2026-11-20T13:07:05+05:30 aquib N: status: in_progress -> review — Built and tested. Not committed.
