---
id: JET-441
title: Song read: timing and diagnostic logs, so staging's 8-9 min read can be taken apart from the logs alone
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-25T12:57:28+05:30
updated: 2026-11-25T12:57:28+05:30
decisions: 
---

## Request

A 3-5 min song takes 8-9 min to read on staging (3-4 min on an M-series Mac). There is no shell on staging, so before optimising anything, log enough to know where the minutes go.

## Understanding

Logs only; no behaviour change. Every song-read and lyric-transcription request gets a short id that follows its work across threads (contextvars). One [READ-PERF] line per read sums it up: audio facts, cache hit/miss, 202 or inline, download, hash, lock wait and who held the lock, Demucs seconds and whether its weights were cold, Gemini whole/pieces/sheet wall time, retries, HTTP errors and tokens, Whisper fallback, DSP, total, reads in flight, render jobs running, load average and peak RSS. Plus [GEMINI-CALL] per HTTP call, [DEMUCS] per separation (stderr tail when slow or failed), [LOCK] while waiting over 5s, and [BOOT-CONFIG] at startup (effective settings, cores, RAM, versions, cache dirs). Assumes staging runs this repo's Dockerfile, so print() reaches the container logs the user downloads.

## Plan

1. app/core/timing.py: read_perf collector, in_context, perf/perf_add, probe_audio; id on [API3-TIMING] lines
2. Routes song_read/transcription: wrap in read_perf, time download, probe audio
3. deferred.py: 202 request_id onto the read
4. transcription.held(): timed lock with holder and [LOCK] watcher
5. lyric_extractor Demucs, gemini_transcriber _post + pool context propagation
6. main.py [BOOT-CONFIG]; JobManager.running counter
7. scripts/read_perf_report.py: p50/p90/max table from downloaded logs; tests/test_read_perf.py

## Reason

The recorded numbers (Gemini+Demucs ~84-90s, Whisper ~200s) don't add up to 8-9 min. Without per-stage numbers from staging, any optimisation is a guess.

## Related files

app/core/timing.py,app/api/v1/routes/song_read.py,app/api/v1/routes/transcription.py,app/api/v1/deferred.py,app/services/transcription.py,app/pipeline/stitch_pipeline.py,app/processors/lyrics/lyric_extractor.py,app/processors/lyrics/gemini_transcriber.py,app/main.py,app/infrastructure/jobs/manager.py,scripts/read_perf_report.py,tests/test_read_perf.py

## Acceptance criteria

After a deploy, the staging logs hold one [BOOT-CONFIG] line and one [READ-PERF] line per song read, and read_perf_report.py prints a per-stage table from them. Full test suite passes.

## Test steps

1. Deploy to staging; in the logs find [BOOT-CONFIG] and check cpus=4 and the whisper_*/use_vocal_separation values.
2. Upload 3-5 new songs in the app (two at the same time); wait for lyrics.
3. Download the logs and run: python scripts/read_perf_report.py <log>
4. Expect one row per read with total= filled in, Gemini calls by kind, and a [LOCK] line for the song that waited.

## Thread
2026-11-25T12:57:28+05:30 aquib N: created ticket, status: - -> open
2026-11-25T12:58:04+05:30 aquib N: Built in this session at the dev's direction, uncommitted: logs only, 734 tests pass. Next: commit, deploy to staging, collect logs from 3-5 fresh uploads, run scripts/read_perf_report.py. The table decides the order of JET-442/443/444.
