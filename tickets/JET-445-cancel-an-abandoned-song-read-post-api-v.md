---
id: JET-445
title: Cancel an abandoned song read: POST /api/v1/song-read/cancel stops the work for that audio, including Demucs mid-run
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-25T17:21:48+05:30
updated: 2026-11-25T17:47:26+05:30
decisions: D-107
---

## Request

When a user abandons a song before its read finishes and uploads another, the old read keeps running and the new song waits behind it for Demucs. Give callers a way to cancel, and make cancelling actually free the CPU.

## Understanding

New endpoint POST /api/v1/song-read/cancel {audioUrl, language?, lyricEngine?}, same service assertion as song-read. It cancels the in-flight work for that audio object (deferred._by_key; object path without query, every language/engine if none given) for both song-read and lyric-transcription. Cancelling is cooperative, because the work is in threads: a per-key cancel flag is checked before Demucs, before the Gemini pieces and before the sheet calls; a song still queued for Demucs is skipped; Demucs mid-run is stopped through demucs.api.Separator's per-segment callback raising. Every request joined to that work (each 202 it handed out) gets its callback with status 'cancelled'; Node already treats that as terminal. Nothing is cached for a cancelled read. Idempotent: cancelling a finished or unknown audio is 200 {cancelled:false}. Assumption: only the Node backend calls this, and only once it knows nobody else wants the song (see the Node request); this service does not track who wants what. Also cancels a render's transcription if Node asks, so the guard belongs in Node.

## Plan

1. deferred: per-key cancel Event beside _by_key; cancel() sets it and cancels the asyncio task
2. Check the flag between stages in GeminiModel.transcribe and the extractor; raise ReadCancelled
3. separator: skip a queued job whose flag is set; Separator(callback=...) raises when set, mid-run
4. Route + schema + contract .coord/contracts/video-song-read.md (owner: us); decision record
5. [READ-PERF] outcome=cancelled; tests: queued job skipped, mid-run stops within one segment, joined callers all get 'cancelled', nothing cached

## Reason

Demucs runs one song at a time (D-106). An abandoned 4-min song holds it for 1-3 min on staging, so the song the user is actually waiting for queues behind work nobody will look at. Locally, 3 songs in a row put the third at 388s.

## Related files

app/api/v1/deferred.py,app/api/v1/routes/song_read.py,app/schemas/song_read.py,app/processors/lyrics/separator.py,app/processors/lyrics/gemini_transcriber.py,app/processors/lyrics/lyric_extractor.py,.coord/contracts/video-song-read.md

## Acceptance criteria

Cancelling a read mid-Demucs frees the separator within ~6s (one segment); the next song's separation_wait drops accordingly; every 202'd request for the cancelled audio gets a 'cancelled' callback; a later read of the same song starts fresh and completes.

## Test steps

1. Start reads of song A then song B (callbackRequested). 2. While A is in Demucs, POST /api/v1/song-read/cancel {audioUrl: A}. 3. Logs: [READ-PERF] for A with outcome=cancelled, B's Demucs starts within seconds. 4. Read A again: it runs and completes.

## Thread
2026-11-25T17:21:48+05:30 aquib N: created ticket, status: - -> open
2026-11-25T17:24:41+05:30 aquib N: status: open -> approved
2026-11-25T17:28:12+05:30 aquib N: Notes from reading the code (nothing written there): (1) Work runs in threads via asyncio.to_thread and in_context pools, so a contextvar holding a threading.Event, bound inside the task started by deferred._start, reaches every thread. (2) Make ReadCancelled a BaseException: lyric_extractor.py:326 catches Exception from separator.vocals and falls back to the Demucs subprocess, and _lyric_sheet swallows errors, so an Exception subclass would be eaten. (3) Checkpoints: separator.vocals' separate() before and after taking gate (queued songs skip), Separator(callback=...) per segment (jobs=0 runs the callback on the same thread, so the contextvar is visible), cut_and_read per piece, _lyric_sheet start, and the top of transcription.store / song_read.store so nothing cancelled is cached. (4) deferred.report: done.cancelled() should send status 'cancelled', not 'failed'; inline callers awaiting shield(task) get CancelledError, so turn it into HTTPException 409 unless their own request is the one being cancelled. (5) read_perf marks any BaseException outcome=error; add outcome=cancelled for CancelledError/ReadCancelled. (6) video-processing-backend has uncommitted work in separator.py (single demucs worker thread) and gemini_transcriber.py (SHEET_THINKING) that is not from this request; build on it, don't revert it.
2026-11-25T17:47:26+05:30 aquib N: linked decision D-107 (Song reads stop cooperatively on cancel; the caller decides when nobody wants a song)
2026-11-25T18:02:14+05:30 aquib N: Built (uncommitted), 743 tests pass. POST /api/v1/song-read/cancel {audioUrl[, language, lyricEngine]} -> {cancelled, reads}; flags every running read of that object (both routes; re-signed URLs match). Cooperative stop via a context flag, ReadCancelled is a BaseException so no Exception fallback (Whisper, Demucs subprocess, bars-only) turns a cancel into more work (D-107). Checks: after the transcript lock, before Demucs (queued song skipped), Demucs per-segment callback, every Gemini HTTP call, before the Whisper fallback. Callbacks go out with status 'cancelled'; inline callers get 409. Nothing cached. Contract video-song-read.md has the new section. Measured locally on two real songs: cancelled A 26s in, mid-Demucs; A ended 2s later (outcome=cancelled), B's separation started at once (separation_wait = the 26s A held it), only B cached. A run aborted 10s in stops within 0.3s.
