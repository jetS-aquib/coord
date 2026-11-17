---
id: JET-328
title: Song window end to end: render only part of a song with picture, audio and captions all starting at the window
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-17T15:36:22+05:30
updated: 2026-11-17T15:36:22+05:30
decisions: 
---

## Request

Finish the half-built trim: cut clips exactly at the window edges, pass the audio window to stitching, price the window in /estimate, and tell the treatment it is directing a short piece.

## Understanding

trim{startSeconds,endSeconds} is already accepted and stored, but applyTrimV1 keeps every overlapping clip whole and the stitch sends the full audioUrl from 0:00, so a 30s window drifts. Needs video-processing to accept an audio window (filed separately, JET-329). Assumptions: window edges snap to downbeats client-side; a minimum window of ~8s (shortest section); lyric lines outside the window are dropped from captions.

## Plan

1. applyTrimV1: trim first/last clip's musicalSeconds to the window.
2. stitchPlanV1: send audioStartSeconds/audioEndSeconds (after JET-329 lands).
3. estimateCostV1 / POST /estimate take trim.
4. generateTreatmentV1/shot list get the window duration + sections inside it.
5. Contract + tests (window cut, estimate with trim).

## Reason

Users want a video for just part of the song (e.g. the hook) — cheaper and faster.

## Related files

src/services/render/cutPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/renderCostV1.ts, src/modules/video/video-api.service.ts

## Acceptance criteria

A render with trim 60-90s produces a ~30s video whose audio and captions start at 60s; /estimate with that trim returns a lower price than the full song.

## Test steps

—

## Thread
2026-11-17T15:36:22+05:30 aquib N: created ticket, status: - -> open
