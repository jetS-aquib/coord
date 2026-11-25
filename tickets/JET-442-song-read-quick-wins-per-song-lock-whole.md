---
id: JET-442
title: Song read quick wins: per-song lock, whole-mix Gemini at t=0, persisted caches and weights, stem cache, DSP beside the transcript
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-25T12:57:55+05:30
updated: 2026-11-25T15:17:47+05:30
decisions: 
---

## Request

Cut song-read wall time with no accuracy risk, ahead of the eval-gated separation work. Order and scope to be confirmed by the JET-441 numbers from staging.

## Understanding

No change to what a read returns. (a) Replace the process-wide lock with a lock per transcript key plus one semaphore around only the CPU-heavy stages (Demucs, local Whisper): different songs then run their network-bound Gemini calls side by side, and the same song still runs once, which also closes D-096's 'two uploads of one song both transcribe'. (b) Start the whole-mix Gemini call at t=0 beside Demucs; it only needs the mix. (c) docker-compose: mount STORAGE_ROOT and ~/.cache/torch as volumes. (d) Cache the vocal stem by audio sha256 under STORAGE_ROOT/stems with the transcript cache's 24h/64 pruning. (e) Run decode/BPM/energy beside the transcript; only sections need the words. Assumes staging deploys with docker-compose.yml from this repo.

## Plan

1. Read JET-441's report; drop any item the numbers show is worthless
2. transcription.py: per-key locks + CPU semaphore; keep deferred.py's dedup guarantee; decision record (changes D-021)
3. gemini_transcriber.transcribe: submit _whole_mix before vocals()
4. Stem cache in lyric_extractor._extract_vocals_with_demucs
5. docker-compose volumes
6. song_read: DSP in a thread beside the transcript
7. Tests: two keys overlap, one key runs once, semaphore caps CPU stage; stem-cache hit

## Reason

One global transcription.lock queues every transcript miss in the process, so two users' different songs, and renders, wait for each other. Caches live in /tmp in the container, and torch weights aren't in a volume, so a recreate starts cold.

## Related files

app/services/transcription.py,app/pipeline/stitch_pipeline.py,app/processors/lyrics/gemini_transcriber.py,app/processors/lyrics/lyric_extractor.py,app/api/v1/routes/song_read.py,docker-compose.yml

## Acceptance criteria

On staging, a [READ-PERF] lock_wait under 1s for a read of a new song while another new song is reading; a read after a container recreate shows sep_weights_cold=0; uncached total lower than JET-441's baseline p50.

## Test steps

—

## Thread
2026-11-25T12:57:55+05:30 aquib N: created ticket, status: - -> open
2026-11-25T13:31:00+05:30 aquib N: From JET-441's first staging read: each re-ask (Node re-POSTs lyric-transcription and song-read every 60s) parks a thread from asyncio's default pool on the transcription lock; that pool is min(32, cpus+4) = 8 on the 4-vCPU box, and one song already reached 6 in flight. With several songs at once, the pool fills and even cache hits queue. Add to scope: answer a re-ask for a song already being transcribed with an immediate 202 instead of parking a thread (or a dedicated executor). Confirm with the 3-song run first.
2026-11-25T14:59:46+05:30 aquib N: Raised to first priority by JET-441's concurrent run: thread starvation, not compute, turned a 4-min read into 16-17 min and failed 15 downloads. Must-haves: (1) a re-ask for a key already being transcribed returns 202 at once instead of parking a thread; (2) downloads off the shared default executor (own executor or async file writes); (3) per-song lock + a CPU semaphore around Demucs only. Expected: each song ~its own work time, with only Demucs serialised.
2026-11-25T15:17:47+05:30 aquib N: status: open -> approved
