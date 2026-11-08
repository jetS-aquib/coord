---
id: JET-276
title: R&D: measure where a real render's stitch time goes, stage by stage
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-09T03:24:16+05:30
updated: 2026-11-09T03:24:30+05:30
decisions: D-077
---

## Request

Research only, no production change. On one real 31+ clip lyrics render (v1 and v2 stitch), report [API3-TIMING] for each stage: download_clips, trims, analyze/optical flow, xfade encode, caption burn, mux, gcs upload, plus queue wait. Check whether the synchronous-write download fix (JET-236) is live, and what MAX_CONCURRENT_JOBS=1 does to segment stitching (documented as parallel, runs serially). Say what raising it would cost in RAM/CPU on the current VM.

## Understanding

There is an R&D brief about moving stitching to phones because 'stitching takes 4-5 minutes'. The repo's own numbers disagree: one production render spent 45s on video work and 251s in download_clips, plus 75s uploading source audio; stitch benchmarks are 0.23x realtime. Before any mobile work we need fresh, per-stage numbers. ASSUMPTIONS: (a) existing timing labels are enough, no new instrumentation unless a stage is missing; (b) staging data is fine.

## Plan

1. Run one render through v1 and one through v2 on the same song.
2. Collect per-stage timings + queue wait into a table on this request.
3. Note anything not instrumented.
4. Estimate effect of MAX_CONCURRENT_JOBS 2-4 on segment jobs.

## Reason

Speed and cost: pick the fix by measurement, not by assumption about FFmpeg.

## Related files

app/core/timing.py, app/services/job_service.py, app/pipeline/stitch_pipeline*.py (read only)

## Acceptance criteria

A per-stage table for v1 and v2 on the same song, with measured vs estimated marked.

## Test steps

—

## Thread
2026-11-09T03:24:16+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
