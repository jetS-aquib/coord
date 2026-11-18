---
id: JET-355
title: Render report: drift, still-check failures and grid stills per clip, and a story-order score
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-18T15:30:16+05:30
updated: 2026-11-18T15:33:56+05:30
decisions: 
---

## Request

scripts/rnd/renderReport.ts <jobId> prints per clip: seam scores, still-check verdict and failure kinds, grid or not, attempts. Totals give one 'hallucination' line per render. planScoreV1 gains a story-order check: prop and motif shots appear in plan order in the edit.

## Understanding

Reads the plan only; no model calls.

## Plan

1. renderReport.ts.
2. storyOrder in planScoreV1, with a test.
3. Run it on mvr_1794989625320_48693f7a as the baseline.

## Reason

Judging these renders currently takes ad-hoc database queries. This makes before and after comparable as numbers.

## Related files

scripts/rnd/renderReport.ts, src/services/render/planScoreV1.ts

## Acceptance criteria

renderReport on mvr_1794989625320_48693f7a reports 10 grid stills, 26/58 failed stills and 17 clips above seam 15.

## Test steps

—

## Thread
2026-11-18T15:30:16+05:30 aquib N: created ticket, status: - -> open
2026-11-18T15:33:56+05:30 aquib N: status: open -> approved
