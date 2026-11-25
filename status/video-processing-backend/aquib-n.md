# video-processing-backend — aquib N

- **Current task:** JET-441 song-read timing/diagnostic logs — built, uncommitted, waiting on commit + staging deploy so the logs can be read. JET-442/443/444 (song-read optimisation) filed, waiting for approval and for JET-441's numbers. Earlier: JET-329 done, uncommitted.
- **Status:** waiting on human
- **Blockers:** the board does not sync from this machine — `coord sync` push fails with `remote: error: inflate: data stream error`. Everything else: JET-232, JET-233, JET-222, JET-219, JET-215 and JET-212 are with the requester; JET-199/200/201/203 are ours to close with `coord ok`
- **Last updated:** 2026-11-25T00:00:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-11-25T12:58:27+05:30

Session ended while on JET-362. Touched: lets-do-an-optimisation-woolly-hanrahan.md, staging-logs-only.md, MEMORY.md, app/processors/lyrics/lyric_extractor.py, scripts/read_perf_report.py, tests/test_read_perf.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-25T00:00:00+05:30

Song-read latency (8-9 min on staging). Planned the optimisation, then, at the dev's direction, built logs only (JET-441, uncommitted, 734 tests pass): [READ-PERF] per read, [GEMINI-CALL], [DEMUCS], [LOCK], [BOOT-CONFIG], scripts/read_perf_report.py. Filed JET-442 (per-song lock, whole-mix at t=0, volumes, stem cache), JET-443 (Demucs off the read path or an ONNX vocals model, eval-gated on JET-270), JET-444 (Whisper fallback). Staging is 4 vCPU / 16 GB, not 2/4. Next: commit, deploy, upload 3-5 songs, run the report; the numbers decide the order of 442-444.

### 2026-11-20T11:56:25+05:30

Session ended while on JET-323. Touched: tests/test_graphic_layer.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-19T15:46:45+05:30

Session ended while on JET-323. Touched: tests/test_beat_cuts.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-19T15:41:44+05:30

Session ended while on JET-323. Touched: tests/test_beat_cuts.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-17T16:10:00+05:30

JET-329 implemented, uncommitted: schemas AudioWindow mixin, plumbing routes -> job_service -> video_service -> pipeline; pipeline cuts work/audio_window.wav (song_file stays the whole song for transcription/cache); captions shifted in _corrected_lyrics_file via processors/lyrics/audio_window.py. Contracts video-stitching.md / video-segments.md updated. Next: commit, then coord review 329 once the board shows it started.

### 2026-11-17T13:24:47+05:30

Session ended while on JET-323. Touched: app/services/song_read.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-17T12:49:25+05:30

Session ended while on JET-323. Touched: musetalk_batch.py, NOTES.md. Nothing committed. (written automatically — no one said what is next)

