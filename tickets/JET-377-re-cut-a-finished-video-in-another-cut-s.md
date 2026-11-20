---
id: JET-377
title: Re-cut a finished video in another cut style, and a 30-45s 9:16 reel around the hook, without re-filming
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-20T11:46:11+05:30
updated: 2026-11-20T13:18:24+05:30
decisions: 
---

## Request

Backend endpoints for JET-346: re-cut a finished video with a different cut style (calm / on the beat / fast), and export a 30-45s vertical reel around the hook. No new generation: both re-stitch clips the render already paid for.

## Understanding

EDIT_V2 (subShotV1) already plans the cut from the song read and the director's pace; a re-cut is the same planner with a different pace preset and a fresh stitch of the stored clips (stitchInSegmentsV1). Cut styles map to pace presets: calm = whole/whole/bar, on the beat = today's DEFAULT_PACE_V2, fast = bar/half/half. The reel picks the first chorus (song read sections) widened to whole bars, 30-45s, and uses the audio window that JET-329 already supports. A 16:9 render becomes 9:16 by a centre crop (upper-anchored when the shot has people, like JET-344's zoom anchor): soft at 720p, which is the honest limit; a native 9:16 render is unchanged. Assumptions: a re-cut replaces finalVideoUrl only when the user keeps it (the old URL stays on the plan for undo, like JET-327's takes); a reel is a separate file and never replaces the video; both count nothing against the weekly render seconds (no clips are generated) but are rate-limited per user (stitches cost CPU); flags.render.recut off until mobile ships.

## Plan

1. POST /api/music-videos/v1/:jobId/recut {cutStyle} -> a stitch job; GET status as today; POST .../recut/keep makes it the video (old URL kept for undo).
2. POST /api/music-videos/v1/:jobId/reel -> stitch of the chorus window, 9:16, captions on; result on the plan as reelUrl.
3. Pace presets in flags.render.edit; flag recut off; per-user rate limit (e.g. 5 stitches an hour).
4. Tests: preset -> piece lengths; reel window lands on whole bars inside 30-45s; a 16:9 render's reel is cropped, a 9:16 one is not; no GenerationLog clip rows written.
5. Contract api-music-videos.md updated.

## Reason

Gets more out of every paid render: a different feel or a shareable reel costs one stitch, not a new render.

## Related files

src/services/render/subShotV1.ts, src/services/render/renderOrchestratorV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/config/flags.ts

## Acceptance criteria

A finished video re-cuts as 'fast' in about a minute with no new clips generated, and can be kept or undone; the reel is 30-45s, 9:16, starts and ends on a bar, and plays the chorus.

## Test steps

—

## Thread
2026-11-20T11:46:11+05:30 aquib N: created ticket, status: - -> open
2026-11-20T13:18:24+05:30 aquib N: status: open -> approved
