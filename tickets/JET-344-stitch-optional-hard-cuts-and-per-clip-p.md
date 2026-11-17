---
id: JET-344
title: Stitch: optional hard cuts and per-clip punch-in zoom, so a song can be cut on the beat
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-18T01:21:05+05:30
updated: 2026-11-18T01:21:05+05:30
decisions: 
---

## Request

Add two optional fields to segment-stitch and segment-concat. cut_style: 'hard' joins clips with a plain concat (no xfade, no similarity/transition analysis). Per-clip zoom (1.0-1.6) and zoom_anchor ('center'|'upper') do a crop+scale back to the frame inside trim_clip. Also raise MAX_CLIPS for segment-stitch to 120, or tell us 50 is a hard limit.

## Understanding

Absent fields must give today's bytes exactly: same transitions, same encode. The music backend only sends these fields when its flags.render.editV2 is on, and if it gets a 422 it falls back to today's stitch. So deploying this never changes a current render, and the music side can ship before or after it. Assumed: the same URL repeated in one request is already fine, since _download_clips names files by index. Assumed: hard-cut segments are still the same size and codec, so concat_segments -c copy keeps working. Assumed: zoom applies before the per-clip normalize chain.

## Plan

1. schemas/jobs.py: ClipInput gains zoom (ge=1, le=1.6) and zoom_anchor; SegmentStitchRequest/SegmentConcatRequest gain cut_style ('xfade' default | 'hard').
2. clip_trim.py: when zoom > 1, crop iw/z:ih/z (anchor center, or upper third for faces) then scale back, in the same encode as the trim.
3. stitch_pipeline_v2: cut_style 'hard' skips similarity and transition selection and concats the trimmed clips with the existing normalize chain.
4. MAX_CLIPS 120 on segment-stitch.
5. Tests: absent fields give an identical filtergraph; hard gives N inputs and no xfade; zoom crop math.

## Reason

Renders look static: about 46 shots in 5 minutes, each joined by a 0.2s dissolve. The reference film video has 206 hard cuts in 3:42. Backend EDIT_V2 cuts each clip into 2-6 beat-length pieces by sending the same clip URL several times with inSeconds/outSeconds. A 0.2s xfade on every one of 150 boundaries smears the cuts and pulls the picture off the beat, because nothing compensates for the overlap.

## Related files

app/schemas/jobs.py, app/services/clip_trim.py, app/pipeline/stitch_pipeline_v2.py, app/processors/ffmpeg/builders/video_filter_builder.py

## Acceptance criteria

A segment-stitch with cut_style 'hard' and three pieces of one clip at zoom 1.0/1.25/1.5 returns a video of exactly the summed piece length, with visible punch-ins and no dissolves. The same request without the new fields is byte-identical to today's.

## Test steps

—

## Thread
2026-11-18T01:21:05+05:30 aquib N: created ticket, status: - -> open
