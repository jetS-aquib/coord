---
id: D-079
title: Two job lanes instead of cancelling leftover segments
date: 2026-11-10
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-280
---

## Context

One FIFO worker served every job, so a concat or a fallback stitch queued behind segments, and a cached-transcript stitch waited on the transcription lock.

## Options considered

a) add a cancel endpoint and have the music side cancel leftover segments on fallback; b) give segments their own pool so the concat and the fallback never queue behind them

## Decision

b. Segments get SEGMENT_WORKERS (default 2); everything else stays on MAX_CONCURRENT_JOBS. Each stitch encode gets -threads = cores // (both pools). No cancel endpoint.

## Reason

With b, leftover segments no longer delay the fallback, which was the whole reason for cancelling them. b needs no new endpoint and no music-side change.

## Consequences

Leftover segments from a failed render still finish and use some CPU in the segment lane. Add cancel if that ever shows up in measurements.
