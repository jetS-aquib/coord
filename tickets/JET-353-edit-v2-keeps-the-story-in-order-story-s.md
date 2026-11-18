---
id: JET-353
title: EDIT_V2 keeps the story in order: story shots are cut only within their own footage, close-ups no faster than half a bar
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-18T15:30:14+05:30
updated: 2026-11-18T15:30:14+05:30
decisions: 
---

## Request

Narrative shots are no longer intercut with a neighbouring shot; they are cut only within their own footage at alternating punch-ins. Performance shots may still intercut. Close-ups never cut faster than half a bar. Zoya calms to quiet whole / mid bar / loud half, with ladderShift 0 and one whip pan in her list; Dev, Jassi and Kian get the same cap.

## Understanding

Pure edit and director-spec change, no generation. Verified by re-cutting mvr_1794989625320_48693f7a from its stored clips with scripts/rnd/recut.ts.

## Plan

1. subShotPlanV1: partner only when both clips are performance-lane.
2. pieceSecondsV1: a floor of half a bar on close and medium-close shots.
3. directorsV1: Zoya, Dev, Jassi and Kian specs.
4. Tests: no foreign footage inside a narrative slot; close-up floor.
5. Re-cut mvr_1794989625320_48693f7a and compare.

## Reason

On mvr_1794989625320_48693f7a the edit flashed later beats inside earlier ones (the ticket pick-up before the drop), and 290 cuts at a 0.83s median read as choppy.

## Related files

src/services/render/subShotV1.ts, src/services/render/directorsV1.ts

## Acceptance criteria

The re-cut of mvr_1794989625320_48693f7a has a median shot of 1.2-2s and prop shots in plan order.

## Test steps

—

## Thread
2026-11-18T15:30:14+05:30 aquib N: created ticket, status: - -> open
