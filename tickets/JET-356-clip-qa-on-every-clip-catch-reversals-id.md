---
id: JET-356
title: Clip QA on every clip: catch reversals, identity/size changes, ownerless limbs, missing legs and garbled text; re-render once, then drop from the edit
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T17:10:44+05:30
updated: 2026-11-18T17:51:53+05:30
decisions: 
---

## Request

Every clip, every tier, gets a narrow QA over ~6 ordered frames plus a model-free motion-direction check. A fail re-renders once with the failure in the prompt; a second fail drops the clip from the EDIT_V2 cut. renderReport prints the verdicts so hallucinations are a number per render.

## Understanding

Our seam metric only checks a clip lands on its stills: mvr_1794998373760_2de1c52f scored 3/57 drifted yet visibly reversed walks and floating hands. Research says VLM 'is it realistic' scores are unreliable, so questions are narrow yes/no per frame sequence. Assumed: reuse the existing clipCheck path (today hero-only) and frameGate vision model; motion check is ffmpeg frame-difference/flow on the clip, sign flip of horizontal/vertical drift or subject-size trend on travel shots. Cost goes up (one vision call per clip, more re-renders): approved, quality first.

## Plan

1. clipQaV1: 6 frames, schema of yes/no failure kinds (reversal, identity, size, orphan_limb, missing_legs, text).
2. motionTrendV1: ffmpeg-based direction/scale trend; flags reversal on travel shots.
3. Wire into verify: fail -> one re-render with correction -> fail again -> dropped set for EDIT_V2.
4. renderReport columns + totals.
5. Tests on synthetic verdicts and a known reversed clip from mvr_1794998373760_2de1c52f.

## Reason

Without this every fix is judged by eye on one video; other songs will hallucinate in other ways.

## Related files

src/services/render/clipQaV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/subShotV1.ts, scripts/rnd/renderReport.ts

## Acceptance criteria

On mvr_1794998373760_2de1c52f's clips, QA flags the 0:32/0:46 reversals and the 1:51 orphan hand; a new render reports its counts and ships none of the flagged clips.

## Test steps

1. `npx ts-node --transpile-only scripts/rnd/clipQa.ts mvr_1794998373760_2de1c52f` -> about 15/57 failing (baseline).
2. Render Tu Mil Jaaye with Zoya (all flags as in flags.ts). Logs show `went wrong` re-renders for QA kinds.
3. `renderReport.ts <jobId>`: qaFails / qaKinds totals; those clips are in the editV2 dropped list.
4. Watch it: no reversal, vanishing person, ownerless hand or legless figure on screen.

## Thread
2026-11-18T17:10:44+05:30 aquib N: created ticket, status: - -> open
2026-11-18T17:12:20+05:30 aquib N: status: open -> approved
2026-11-18T17:51:53+05:30 aquib N: status: approved -> in_progress
2026-11-18T17:51:53+05:30 aquib N: status: in_progress -> review — Built behind its flag; see docs/rnd/02-realism-plan.md 'Built' section for what was measured.
