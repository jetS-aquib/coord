---
id: JET-298
title: R&D: the vision checks think at full depth: re-judge stored stills and clips at LOW and see if the verdicts hold
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T15:04:54+05:30
updated: 2026-11-10T15:04:54+05:30
decisions: 
---

## Request

Find out whether the frame check (gate.vision, ~12s per still) and the clip check (~19s per clip) can think less without changing their verdicts, and set their thinking level from the result.

## Understanding

No new renders needed: completed renders already store each still and clip URL with its default-thinking verdict (anchor gate and clip.clipCheck). Re-run the same check functions on those stored images and clips at LOW and MINIMAL and measure agreement with the stored verdicts, plus seconds per call. Cost is vision calls only. Assumption: verdict agreement of about 95% or better on pass/fail, and no new misses on 'people' failures, is good enough to switch.

## Plan

1. scripts/rnd/visionThinking.ts: load the last N completed plans, re-run the frame check on their stills and the clip check on their clips at default, LOW and MINIMAL.
2. Table: agreement with the stored verdict per level, disagreements listed with both answers, seconds and thinking tokens per call.
3. If LOW holds: add flags.render.thinking.frameGate and .clipCheck and set them; otherwise record why not in a decision.

## Reason

Follow-up to JET-283/JET-284. Planning dropped from 84s to 38s with LOW thinking. The vision checks are now the next biggest model cost in time: on five recent renders gate.vision was 294-512s and clipcheck 500-694s of work per render, at default thinking. They decide what gets redrawn or re-rendered, so speed must not change their answers.

## Related files

scripts/rnd/visionThinking.ts, src/services/render/frameGateV1.ts, src/services/render/clipCheckV1.ts, src/config/flags.ts

## Acceptance criteria

A table of verdict agreement and seconds per thinking level over at least 60 stills and 30 clips, and the thinking level set (or left) with the reason recorded.

## Test steps

—

## Thread
2026-11-10T15:04:54+05:30 aquib N: created ticket, status: - -> open
