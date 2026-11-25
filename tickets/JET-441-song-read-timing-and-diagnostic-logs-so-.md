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
2026-11-25T13:31:00+05:30 aquib N: First staging read (Lutt Putt Gaya, 223s, 320k mp3, one user, no render running): user wait 238s. Demucs 176s (74%; weights were cold, ~9s before separation started), Gemini lyric sheets 47s (2 parallel calls, ~6k output tokens each), 7 pieces in parallel ~10s incl. cutting, whole-mix 6.4s alongside, DSP 1.7s, download 0.3s. Node re-asked every 60s: 8 requests for one song, 6 parked on the transcription lock.
2026-11-25T14:59:46+05:30 aquib N: Concurrent run (4 new songs uploaded back to back, 08:03-08:20 UTC): each user waited 16-17 min (964-1027s) although each song's own transcription was ~255s (Demucs 117-234s + Gemini ~65-77s). Transcriptions ran strictly one after another on the global lock (last song lock_wait 682s). Worse: Node's re-asks parked up to 63 requests on the lock; the audio download writes chunks via asyncio.to_thread on the same default pool, so downloads of 3-9 MB files took p50 285s / max 650s and 15 requests failed with GCS dropping the connection (ReadError / RemoteProtocolError). Even a song whose transcript was done at 08:07 was not answered until ~08:20. CPU was not the limit: load1 1-3 on 4 cores. Gemini healthy: 54 calls, all 200; pieces 2.6s, sheets p50 51s / max 71s. Known gap: the sep_weights_cold flag read 1 every time; the Demucs progress bar shows separation starting at once at ~1.4s of audio per second, so it is the flag that is wrong, not a download.
