---
id: JET-292
title: R&D: Omni 1.1 is rerouted to 1.2 on 3 Dec; check its price and whether 15s clips mean fewer seams
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:44+05:30
updated: 2026-11-10T01:57:44+05:30
decisions: 
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

—

## Thread
2026-11-10T01:57:44+05:30 aquib N: created ticket, status: - -> open
