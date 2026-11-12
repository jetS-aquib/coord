---
id: JET-276
title: R&D: measure where a real render's stitch time goes, stage by stage
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:24:16+05:30
updated: 2026-11-11T17:32:05+05:30
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
2026-11-11T17:32:05+05:30 aquib N: status: open -> approved
2026-11-12T12:08:10+05:30 aquib N: RESULTS (measured, local Mac M-series 10 cores/24GB, home broadband; same project local_1792580103451_wkeglmd: 36 clips, 243s song, 9:16, 15 segments of 2-3 clips + 1 concat, SEGMENT_WORKERS=2, MAX_CONCURRENT_JOBS=1).
WALL, first segment request -> final video: v2 73s, v1 163s.
PER SEGMENT (median, min-max): download_clips v2 20.1s (12.7-22.4) / v1 27.9s (18.3-31.4), of which clip_trims (JET-207 libx264 re-encode, timed on v1 only) 24.1s (16-27.4) -> network is ~3-4s; analysis+similarity v2 0.6s / v1 0.5s; normalization 0.2s both; xfade encode (ffmpeg_stitching) v2 2.6s / v1 5.2s; gcs_upload 0.2-0.4s. Segment job total median v2 33.7s / v1 52.9s.
CONCAT: v2 caption burn 19.7s, total 23.7s. v1 ass_generation 12.5s + caption burn 62.8s, total 82.2s. v1 renders 1080x1920, v2 720x1280 (2.25x pixels) - that is most of the v1/v2 gap.
QUEUE: queue_wait (new log line) climbs 3s -> 74s (v1) / 2s -> 46s (v2) across the 15 segments; each is download+trim on the async side (all 15 at once), then 2 pool slots.
RESOURCES (sampled every 2s): up to 14 ffmpeg processes at once, peak ~2.5-2.7GB RSS (uvicorn ~0.25GB, ffmpeg up to 0.43GB each), peak ~7.2 of 10 cores. The burst is the trims: they run before the pool, so SEGMENT_WORKERS does not limit them and FFMPEG_THREADS cap (JET-280) does not reach clip_trim.py.
ANSWERS: (1) Stitching is not 4-5 min on this box: 73s v2. The biggest stage is trimming, not xfade or download. (2) JET-236 is in code (05ea905): the concat pulls 15 segment files in 1.4-2.8s. Live on the VM: unverified (need the deployed image commit). (3) MAX_CONCURRENT_JOBS=1 no longer serialises segments (JET-280 gave them their own pool). Raising SEGMENT_WORKERS 2->4 would save ~10-15s of slot wait here (ESTIMATED) but on the 2-vCPU VM it adds contention; the uncapped 15-way trim burst is the bigger VM risk (ESTIMATED: ~15x0.4GB=6GB RSS spike, all on 2 cores).
NOT INSTRUMENTED before this: queue_wait, clip_trims (both added, log-only). 
SUGGESTED NEXT (not done): run trims inside the pool, or with -threads cap / -preset ultrafast; or skip the re-encode when a stream copy is close enough. Repeat these numbers on the VM before any mobile-stitch work.
