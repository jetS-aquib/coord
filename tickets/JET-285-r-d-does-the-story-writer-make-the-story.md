---
id: JET-285
title: R&D: does the story writer make the story better? A/B it, then merge it with the treatment or turn it off
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:39+05:30
updated: 2026-11-10T20:27:58+05:30
decisions: 
---

## Request

Prove whether the story writer earns its time, and fix the places where its story is lost before the shot list.

## Understanding

Planning-only A/B, no video spend. Judge: Gemini scoring how closely the shot list follows the song's arc and lyrics, plus a blind side-by-side Aquib reads. Outcome is a choice: keep, merge script and treatment into one call, or remove. Relates to JET-262, which is waiting on exactly this comparison.

## Plan

Depends on: JET-283 (shares the timing harness).
1. Make the writer an env flag (default on, as today).
2. scripts/rnd/storyAB.ts: same 3 songs on and off, shot lists side by side, judge scores, seconds.
3. Fix: keep and save the script when the treatment fails; pass premise and director voice through; pick the hook by energy, not label.
4. Decision record with the result; then merge, keep or remove.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Aquib sees no drastic change in story since the writer was added, only more time and hallucinations. SCRIPT_WRITER_V1 is hard-coded true (scriptV1.ts:61), not behind RENDER_SCRIPT_WRITER. If the treatment returns null the script is thrown away and not saved (renderOrchestratorV1.ts:1474-1493). The premise never reaches the shot list; the director's voice never reaches the script or shot list (shotListV1.ts:378); moment-to-shot mapping is left to the model; THE HOOK is marked by section label, which is often verse everywhere (treatmentV1.ts:145).

## Related files

src/services/render/scriptV1.ts, treatmentV1.ts, shotListV1.ts, renderOrchestratorV1.ts, scripts/rnd/storyAB.ts

## Acceptance criteria

A table per song: judge score and seconds with and without the writer, plus a decision record saying which way and why.

## Test steps

—

## Thread
2026-11-10T01:57:39+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:27:58+05:30 aquib N: status: open -> approved
