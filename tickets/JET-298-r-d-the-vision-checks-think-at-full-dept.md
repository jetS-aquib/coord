---
id: JET-298
title: R&D: the vision checks think at full depth: re-judge stored stills and clips at LOW and see if the verdicts hold
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T15:04:54+05:30
updated: 2026-11-10T15:28:51+05:30
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

1. With the video-processing service running: `npx ts-node --transpile-only scripts/rnd/visionThinking.ts` (defaults: 8 latest completed renders, 60 stills, 30 clips, levels default,LOW,MINIMAL). Prints agreement with the stored verdicts per level and every disagreement.
2. A demo render: the log's per-still frame check is about 3s (was ~10s); the timing line's gate.vision total drops by roughly two thirds. Clip check unchanged.

## Thread
2026-11-10T15:04:54+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:06:50+05:30 aquib N: status: open -> approved
2026-11-10T15:14:26+05:30 aquib N: status: approved -> in_progress
2026-11-10T15:28:51+05:30 aquib N: RESULTS (2026-11-10, 8 latest completed local renders, half stored fails / half passes; 'same redraw decision' = whether the verdict would buy a redraw or re-render, the decision that costs money).
Stills (60): default re-run 88% same decision, 7/8 redraws kept, 10.4s; LOW 88%, 7/8, 2.9s; MINIMAL 88%, 7/8, 2.5s. Default disagrees with its own stored answer 12% of the time, so LOW is inside the noise. LOW passes more hand/continuity fails, which never buy a redraw.
Clips (30, run twice): below default only 15-19/30 answered ('fetch failed' on the 3-image call, reproducible; default answered 30/30 in the same session, run last), and LOW invented 3 'wrong people' fails (each buys a re-render). Default 93-97% same decision, ~17s.
DONE: flags.render.thinking.frameGate = 'LOW' (readFramesV1 takes a thinking level; only the still check passes one). Clip check stays at default.
ALSO FOUND: on these renders the checks fail 164/182 stills (90%) and 180/223 clips (81%); most failures are anatomy, continuity and wardrobe, which are recorded but never acted on. The verdict is noise as a quality signal; worth a decision on whether to keep asking those questions at all (shorter question = faster check).
2026-11-10T15:28:51+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
