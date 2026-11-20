---
id: JET-379
title: Per-clip fillFrame: crop a 16:9 clip to fill a 9:16 frame instead of letterboxing it (reels, JET-377)
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-20T13:27:48+05:30
updated: 2026-11-20T14:58:31+05:30
decisions: 
---

## Request

segment-stitch accepts fillFrame: true on a clip. That clip is cropped to the output frame's aspect (centred across, zoomAnchor honoured for height) before zoom and scale, so a 16:9 render's reel fills the portrait frame rather than sitting in black bars.

## Understanding

Music backend already sends fillFrame: true on every piece of a reel when the render is not 9:16 (outputFrame 9:16 on every segment). ClipInput ignores unknown keys today, so until this ships those reels come out letterboxed rather than failing. Assumptions: crop happens in clip_trim in the same encode as the trim/zoom (like zoom_filter), centred horizontally; with zoomAnchor upper the vertical position follows UPPER_ANCHOR as for zoom; a clip already in the frame's aspect is untouched; 720p sources go soft after the crop (405px wide), which is accepted.

## Plan

1. ClipInput.fill_frame (alias fillFrame), bool, default false.
2. clip_trim: when set and the probed aspect differs from the output frame, crop to that aspect before zoom_filter; forces the trim encode.
3. Test: a 1280x720 clip with fillFrame into a 9:16 segment comes out portrait with no black bars; without it, unchanged.
4. contracts/video-segments.md: one line under Beat cuts.

## Reason

JET-377 cuts a 30-45s 9:16 reel from a finished render. A 9:16 render needs nothing; a 16:9 one is letterboxed today because the normalize stage scales to fit and pads.

## Related files

app/schemas/jobs.py, app/services/clip_trim.py, app/services/job_service.py, .coord/contracts/video-segments.md

## Acceptance criteria

A 16:9 render's reel from POST /api/music-videos/v1/render/:jobId/reel plays full-frame 9:16, no bars.

## Test steps

—

## Thread
2026-11-20T13:27:48+05:30 aquib N: created ticket, status: - -> open
2026-11-20T14:58:31+05:30 aquib N: status: open -> approved
2026-11-20T15:00:13+05:30 aquib N: Built (uncommitted): ClipInput.fillFrame; clip_trim crops to the named outputFrame's aspect (centred across, zoomAnchor vertical) in the same encode as trim/zoom, and zoom then scales back to the cropped size, not the source's. Ignored when the segment names no outputFrame (no aspect to fill). 1280x720 into 9:16 = 404x720 crop. Contract line added under Beat cuts. Tests: fill math + real ffmpeg landscape->portrait with zoom upper; portrait clip untouched.
