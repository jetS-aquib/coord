---
id: JET-290
title: R&D: stitch with one encode: burn captions per segment and make the concat a stream copy
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:42+05:30
updated: 2026-11-10T01:57:42+05:30
decisions: 
---

## Request

Get a 3-4 minute lyric video's stitch from about 5 minutes to well under 1, by removing repeat encodes and wasted work.

## Understanding

Uses JET-276's per-stage numbers as the baseline. Segment boundaries are hard cuts, so captions can be burned per segment with a global time offset. Assumption: the transcript is known before segments start (JET-201 prefetch). Relates to JET-277 (stitch as clips finalise).

## Plan

Depends on: JET-276, JET-280.
1. Burn captions inside each segment; concat becomes -c copy plus an audio mux.
2. Fold trims into the xfade inputs (-ss/-t on input).
3. Encode at the clips' fps.
4. Skip OpenCV analysis for segments; -an on segments.
5. Keep segment outputs on local disk for the concat.
6. h264_videotoolbox when present, x264 otherwise.
7. Script: wall-clock per stage before and after on one fixed render.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Segment path: every frame is encoded three times (trim crf18 -> xfade -> full-song caption burn), plus a full OpenCV decode per segment only to choose transitions. Clips are 24fps but encoded at 30, about 25% duplicate frames. Segment jobs encode audio the concat throws away. The concat re-downloads from GCS the segments this host just uploaded. No hardware encoder (h264_videotoolbox exists in the Mac ffmpeg).

## Related files

app/pipeline/stitch_pipeline.py, stitch_pipeline_v2.py, app/services/clip_trim.py, app/processors/ffmpeg/ffmpeg_engine.py, builders/video_filter_builder.py

## Acceptance criteria

The same fixed render stitches at least 3x faster with lyrics, captions land on the same words, and quality looks the same side by side.

## Test steps

—

## Thread
2026-11-10T01:57:42+05:30 aquib N: created ticket, status: - -> open
