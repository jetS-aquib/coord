---
id: JET-322
title: One hung transcription blocks every lyrics render: the transcription lock wraps calls with no time limit
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:32+05:30
updated: 2026-11-13T15:14:31+05:30
decisions: 
---

## Request

Put a hard time limit on transcription work done under the process-wide lock.

## Understanding

Python threads cannot be killed, so I assume the limit means running transcription in a subprocess (or a worker that can be terminated) and failing that job after the limit, so the lock is released.

## Plan

1. Run the Whisper/Demucs step in a subprocess with a timeout (e.g. 10 minutes); Gemini calls get a per-call timeout and an overall budget.
2. On timeout: kill the subprocess, release the lock, fail only that job with a clear error.
3. v2: cancel the early-lyrics thread when its render fails.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 9. transcription.lock (app/services/transcription.py:56, held at stitch_pipeline.py:719-731) wraps model.transcribe (lyric_extractor.py:742, no ceiling) and Gemini retries up to 3x300s. One hang holds the lock forever and, with MAX_CONCURRENT_JOBS=1, wedges the worker lane too. The cache-before-lock part already landed in JET-280.

## Related files

app/services/transcription.py, app/pipeline/stitch_pipeline.py, app/pipeline/stitch_pipeline_v2.py, app/processors/lyrics/lyric_extractor.py

## Acceptance criteria

A transcription that runs past the limit fails its own job and the next lyrics render starts.

## Test steps

1. Temporarily set the limit to 5 seconds.
2. Start a lyrics render: it fails with a timeout error.
3. Start a second lyrics render right after: it is not stuck behind the first.

## Thread
2026-11-13T13:07:32+05:30 aquib N: created ticket, status: - -> open
2026-11-13T15:14:31+05:30 aquib N: status: open -> approved
