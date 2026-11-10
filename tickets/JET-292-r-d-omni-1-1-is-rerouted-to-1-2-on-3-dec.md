---
id: JET-292
title: R&D: Omni 1.1 is rerouted to 1.2 on 3 Dec; check its price and whether 15s clips mean fewer seams
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:44+05:30
updated: 2026-11-10T21:36:31+05:30
decisions: D-081
---

## Request

Verify gemini-omni-1.2-flash before Google switches us to it automatically, and test whether longer clips make better and cheaper videos.

## Understanding

Google only. Assumption: the published price and limits need checking against our own billing, not taken from blogs.

## Plan

1. Confirm the 1.2 id, price and durations in the docs and with one call.
2. Render one song at 8s and at 15s clips; compare cost, time, seams, refusals.
3. Pin 1.2 in aiModels.ts and renderCostV1; remove the dead Veo preview ids.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Research: Gemini API reroutes gemini-omni-1.1-flash to 1.2 on 2026-12-03, reported about 30% cheaper with 3-15s clips (we use 4-8s). Fewer, longer clips means fewer seams and fewer calls. Veo 3.1 preview ids in dbLogger.ts and videoModelsV1.test.ts are dead since 2026-10-22.

## Related files

src/config/aiModels.ts, src/services/render/videoModelsV1.ts, src/services/render/renderCostV1.ts

## Acceptance criteria

A table 8s vs 15s for one song, and the model pinned before 3 Dec with correct cost estimates.

## Test steps

1. Start any render with the call sheet on: the estimate is about 30% lower than before for the same song (video line at $0.07/s).
2. Accept it. The server log shows `[OmniV1] model=gemini-omni-1.2-flash` for every clip.
3. Watch the finished video: shots open and close on their stills as before (no more seam re-renders in the log than usual).
4. Optional, costs ~$7: `npx ts-node --transpile-only scripts/rnd/omni12.ts --probe 3` re-runs the comparison.

## Thread
2026-11-10T01:57:44+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:28:45+05:30 aquib N: status: open -> approved
2026-11-10T21:36:31+05:30 aquib N: status: approved -> in_progress
2026-11-10T21:36:31+05:30 aquib N: linked decision D-081 (Renders use Omni 1.2 at $0.07/s and keep 4-8s shots; 10s and 15s clips are not worth it)
2026-11-10T21:36:31+05:30 aquib N: status: in_progress -> review — Pinned gemini-omni-1.2-flash at $0.07/s, shots kept at 4-8s (D-081). 8s vs 10s vs 15s table in the thread decision; 15s is refused when pinned, 10s saves under 5%. Dead Veo ids removed. No mobile change.
