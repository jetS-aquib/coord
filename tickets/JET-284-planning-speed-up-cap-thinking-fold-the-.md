---
id: JET-284
title: Planning speed-up: cap thinking, fold the safety pass, start stills and clips as soon as their inputs exist
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:38+05:30
updated: 2026-11-10T01:57:38+05:30
decisions: 
---

## Request

Cut the planning and anchoring wait using what the timing study found.

## Understanding

Scope is decided by the timing study; the list in the plan is the candidate set. Quality must not drop: a planning-only diff of the shot lists on the same 3 songs.

## Plan

Depends on: JET-283.
1. thinkingConfig budget per call from the study.
2. Fold the safety pass into the shot-list call, or run it chunked in parallel.
3. Start the plate right after the treatment.
4. Start clip i as soon as stills i and i+1 exist.
5. Run vision checks outside the video lanes.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Serial: script, treatment, shot list, safety pass; plate after all four; every clip waits for every still (renderOrchestratorV1.ts:1794-1795) though clip i needs only stills i and i+1; vision checks and drift re-renders sit inside the 6 video lanes (:2359-2362).

## Related files

src/services/render/renderOrchestratorV1.ts, scriptV1.ts, treatmentV1.ts, shotListV1.ts, promptSafetyV1.ts

## Acceptance criteria

On the study's 3 songs, time from POST render to first clip started drops by the amount the study predicted, and the shot lists read as well as before.

## Test steps

—

## Thread
2026-11-10T01:57:38+05:30 aquib N: created ticket, status: - -> open
