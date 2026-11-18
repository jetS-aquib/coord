---
id: JET-358
title: Believable stills: no camera words in still prompts, framing rules per shot size, no hand close-ups, anatomy/people redraw, crop only empty shots
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T17:10:46+05:30
updated: 2026-11-18T17:51:54+05:30
decisions: 
---

## Request

Still prompts never carry camera moves. Wide/full shots show whole bodies head to feet with a scale cue (doorway, car, kerb). Close shots: one face or one object, never a hand entering the frame. Shot list bans hand close-ups touching objects, hands crossing faces, walking straight at the lens, objects passed between people. Gate: anatomy and people become redraw-worthy; new checks for ownerless limb, legs cut in a full shot, scale against a known object. Panel crop only for shots with no people.

## Understanding

On mvr_1794998373760_2de1c52f the 1:51 foreground hand and 1:24 floating hand were in the stills ('push in through the foreground' leaked in), 0:36 was a panel crop that halved both people, and anatomy fails were recorded but never redrawn. Applies to all directors. Behind flags.render.stillRules.

## Plan

1. anchorPromptV1: strip camera-move text; framing rule per shot size.
2. shotListV1: banned-shot rules for all directors.
3. frameGateV1: new failure kinds + anatomy/people in GATE_REDRAW_ON under the flag.
4. JET-352 crop limited to shots without cast.
5. Stills preview of the eval set; count failures by kind.

## Reason

Half of what looked like video hallucination was already in the still.

## Related files

src/services/render/renderPromptsV1.ts, src/services/render/shotListV1.ts, src/services/render/frameGateV1.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Stills previews of the eval set: no ownerless hands, no legless full shots, no half-person crops in final stills.

## Test steps

1. Stills preview or render of the eval set. Still prompts (anchors[].prompt) carry no camera move and a `Framing:` line.
2. `renderReport.ts`: failKinds may now include orphan_limb / missing_legs / scale, redrawn.
3. Look: no foreground hand, no hand close-ups, wide shots show feet on the ground.

## Thread
2026-11-18T17:10:46+05:30 aquib N: created ticket, status: - -> open
2026-11-18T17:12:38+05:30 aquib N: status: open -> approved
2026-11-18T17:51:54+05:30 aquib N: status: approved -> in_progress
2026-11-18T17:51:54+05:30 aquib N: status: in_progress -> review — Built behind its flag; see docs/rnd/02-realism-plan.md 'Built' section for what was measured.
