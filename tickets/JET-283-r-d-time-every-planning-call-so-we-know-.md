---
id: JET-283
title: R&D: time every planning call, so we know why "writing the shot list" takes minutes
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:37+05:30
updated: 2026-11-10T14:37:39+05:30
decisions: 
---

## Request

Measure where planning time goes, call by call, with token counts, so the speed-up is aimed rather than guessed.

## Understanding

Planning-only harness, no video spend. Three fixed songs, one Punjabi. Assumption: usageMetadata (prompt, output, thoughts tokens) is available on each response.

## Plan

1. scripts/rnd/planningTimings.ts runs the planning chain for a song and prints per call: seconds, prompt/output/thinking tokens, attempts.
2. Run each song with thinking default, a low budget and off.
3. Note on this request: a table and what to change (feeds the speed-up request).

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). "Writing the shot list" covers four serial gemini-3.5-flash calls: script (up to 2 attempts x 5 tries), treatment, shot list, safety pass. None sets thinkingConfig or maxOutputTokens, so thinking tokens may dominate. The plate waits for all four though it needs only cast and treatment. Unmeasured: these are guesses until timed.

## Related files

scripts/rnd/planningTimings.ts

## Acceptance criteria

A table for 3 songs x 3 thinking settings with seconds and tokens per call, and a one-line recommendation per call.

## Test steps

—

## Thread
2026-11-10T01:57:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:37:39+05:30 aquib N: status: open -> approved
