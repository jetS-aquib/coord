---
id: JET-353
title: EDIT_V2 keeps the story in order: story shots are cut only within their own footage, close-ups no faster than half a bar
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T15:30:14+05:30
updated: 2026-11-18T15:46:56+05:30
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

1. Watch the re-cut of mvr_1794989625320_48693f7a: https://storage.googleapis.com/jetkreate/project_live/video-synthesis/a38f33c0679d411a86cd0210ec1882a8/final.mp4
2. The ticket story plays in order: dropped, picked up, handed back. No later shot flashes inside an earlier one.
3. Faces never flip on every beat; the loud parts cut about every half bar (1.1s on this song).
4. Measured: 139 shots (was 290), median 1.17s (was 0.83s), storyOrder 1 (was 0.44).
5. To re-cut again: `npx ts-node --transpile-only scripts/rnd/recut.ts mvr_1794989625320_48693f7a`

## Thread
2026-11-18T15:30:14+05:30 aquib N: created ticket, status: - -> open
2026-11-18T15:33:53+05:30 aquib N: status: open -> approved
2026-11-18T15:46:56+05:30 aquib N: status: approved -> in_progress
2026-11-18T15:46:56+05:30 aquib N: status: in_progress -> review — Re-cut: 139 shots (was 290), median 1.17s (was 0.83s), storyOrder 1 (was 0.44). Median is a hair under the 1.2s target: this song's bar is 2.22s, so Zoya's loud half-bar is 1.11s. Also: recut.ts now uses the director as the catalogue has it, not the stored one.
