---
id: JET-368
title: Release: Draft renders ship two-panel grid shots — Draft never checks stills and never re-films
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T13:11:33+05:30
updated: 2026-11-19T13:11:33+05:30
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

—

## Thread
2026-11-19T13:11:33+05:30 aquib N: created ticket, status: - -> open
