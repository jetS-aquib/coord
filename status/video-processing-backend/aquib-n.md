# video-processing-backend — aquib N

- **Current task:** JET-329 audio window (audioStartSeconds/audioEndSeconds) on audio/lyrics stitches and segment-concat — done, uncommitted, waiting on commit + review. JET-324 video half committed (83ea785). Song-read prune race fixed (f18a885). JET-323 paused, JET-321/322 with requester, JET-276 paused.
- **Status:** waiting on human
- **Blockers:** the board does not sync from this machine — `coord sync` push fails with `remote: error: inflate: data stream error`. Everything else: JET-232, JET-233, JET-222, JET-219, JET-215 and JET-212 are with the requester; JET-199/200/201/203 are ours to close with `coord ok`
- **Last updated:** 2026-11-17T16:10:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
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

