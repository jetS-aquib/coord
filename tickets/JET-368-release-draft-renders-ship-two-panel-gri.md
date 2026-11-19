---
id: JET-368
title: Release: Draft renders ship two-panel grid shots — Draft never checks stills and never re-films
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-19T13:11:33+05:30
updated: 2026-11-19T18:14:03+05:30
decisions: 
---

## Request

A Draft video must never contain a grid (split-panel) shot.

## Understanding

Emulator run 2026-11-19, Draft Hook render mvr_1795072909137_46e55548: 2 of 5 shots shipped as stacked two-panel grids. renderReport: 0/6 stills gated (Draft skips the still gate), clip check flagged 'panels' on clips 2 and 4, 0 re-renders (Draft never re-films). Assumption: the still gate's panels check alone is cheap enough to run on every tier (one vision call per still), and a grid is redrawn/cropped as on Standard (JET-352). The run was on e204b8c; JET-356 (clipQa on every tier) may change the clip side but not the still side.

## Plan

1. Run the still gate's panels check on Draft (panels only).
2. A panels fail redraws/crops as JET-352 does on Standard.
3. Re-run a Draft Hook render on HEAD; renderReport gridStills 0.
4. Test: Draft tier gates panels.

## Reason

—

## Related files

—

## Acceptance criteria

Draft render of the same song: no grid shots; renderReport gridStills 0.

## Test steps

1. Film a Draft (Hook) render of a song with 2-person shots. Server log: "anchor N gate fail: panels" for any grid still, then "redraw fixed" or "grid replaced by one of its panels"; a "frame gate:" summary line now appears on Draft too.
2. renderReport for that render: gridStills 0 (or a grid that kept people in it, which clip QA then judges).
3. The finished video has no split-screen shots.
4. POST /estimate for a Draft render: "continuity checks" is no longer 0 and the ceiling sits slightly above the floor (still redraws only; clips are never re-rendered on Draft).
5. flags.render.gridFix = false -> Draft asks nothing again, and its estimate has ceiling = floor.
Regression sheet row TC-092.

## Thread
2026-11-19T13:11:33+05:30 aquib N: created ticket, status: - -> open
2026-11-19T18:14:03+05:30 aquib N: status: open -> approved
2026-11-19T18:20:01+05:30 aquib N: Built. Tiers without the full still gate (Draft = demo) now ask one question per still: is it a grid? (frameGateV1 panelsOnly constraints: the panels question alone, never skipped for 'nothing stated', failures filtered to panels because the model answers every schema field anyway — seen live). A grid is redrawn up to 3 times without the six-panel plate, then cropped to a panel, exactly as Standard (JET-352); per JET-358 a grid with people in it is not cropped, so clip QA has the last word on those. On while flags.render.frameGate and gridFix are both on (panelsGateOnV1). Cost estimate: Draft now counts the checks and up to ceil(stills/5) still redraws (~$0.23 on a 32-still song); clips are still never re-rendered on Draft, so its ceiling is just above the floor. Checked on the stored stills of mvr_1795072909137_46e55548 (6 vision calls): the grid check flags exactly anchors 2 and 4, the two grids in the report. A full Draft render on HEAD is left to the Test steps (spends money). No mobile change.
