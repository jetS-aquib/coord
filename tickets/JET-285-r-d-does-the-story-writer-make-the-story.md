---
id: JET-285
title: R&D: does the story writer make the story better? A/B it, then merge it with the treatment or turn it off
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:39+05:30
updated: 2026-11-10T21:56:33+05:30
decisions: D-082
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

1. Read the blind pairs yourself (pick the one you'd rather watch, then check the key at the bottom): the file named in the review note.
2. Start a render with the call sheet on: no "Wrote N scenes" line from the writer in the server log, and the call sheet appears 4-20s sooner than before.
3. The call sheet still has a logline and a beat per section (the treatment writes them).
4. To re-run the comparison: `npx ts-node --transpile-only scripts/rnd/storyAB.ts --songs 3 --runs 2 --out storyAB.md` (text calls only).

## Thread
2026-11-10T01:57:39+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:27:58+05:30 aquib N: status: open -> approved
2026-11-10T21:56:33+05:30 aquib N: status: approved -> in_progress
2026-11-10T21:56:33+05:30 aquib N: linked decision D-082 (Story writer off: a blind judge preferred shot lists without it in 5 of 6 pairs)
2026-11-10T21:56:33+05:30 aquib N: status: in_progress -> review — Writer turned off (D-082). Judge: on 29.0/40, off 33.5/40, off won 5/6 pairs, orders agreed. Also fixed: hook marked by loudest section not shared label; script kept if the treatment fails; premise reaches the shot list (both only matter with the writer on). Blind read: /private/tmp/claude-504/-Users-aquib-nazmi-Desktop-codeBases-jetKreate-music-jetkreate-backend/15afb0a7-7b33-4c6b-a647-5ac52987747f/scratchpad/storyAB-blind.md
