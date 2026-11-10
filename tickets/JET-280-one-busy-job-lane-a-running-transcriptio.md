---
id: JET-280
title: One busy job lane: a running transcription stalls every stitch, and segments that look parallel run one at a time
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:35+05:30
updated: 2026-11-10T14:04:35+05:30
decisions: 
---

## Request

Stop one user's stitch from waiting behind everyone else's, and stop a transcription from blocking stitches whose lyrics are already cached.

## Understanding

Single host, 1-2 instances, so this is about lanes inside one process, not more machines. Assumption: 2 job workers (segments) plus 1 reserved for concat/finalise is right for an M-series or a 4-8 core VM; ffmpeg -threads capped at cores divided by workers so they do not fight. The music backend changes only to cancel leftover segments on fallback.

## Plan

1. extract_lyrics: read the cache without the lock; lock only on a miss.
2. Two lanes: segment jobs (N workers, env) and final/concat (1 worker), so a concat never waits behind other users' segments.
3. Pass -threads = cores // workers to every ffmpeg in the stitch path.
4. Segment jobs send their completion callback like other jobs.
5. Music backend: on fallback, cancel the segment jobs still queued.
6. Fix the 'parallel' comment and contracts/video-stitching-v2.md where it says three encodes.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). MAX_CONCURRENT_JOBS=1 with uvicorn --workers 1: every segment and concat job from every user shares one FIFO. The music backend says the segments encode in parallel (renderOrchestratorV1.ts:3477); they do not (JET-202 measured 15 segments in 69s). extract_lyrics takes transcription.lock before checking the cache (stitch_pipeline.py:706-707), so a Whisper or Gemini transcription in progress holds a cached concat, which holds the only job slot. Segment jobs send no callback (job_service.py:621-624), so the music side polls every 15s. A failed segment falls back to a full stitch queued behind the remaining segments, which are never cancelled (renderOrchestratorV1.ts:3374-3378).

## Related files

app/pipeline/stitch_pipeline.py, app/services/job_service.py, app/infrastructure/jobs/manager.py, app/core/config.py, music-jetkreate-backend src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Two renders stitched at once: the second one's concat starts without waiting for the first one's segments; a transcription running during a stitch with a cached transcript does not delay it; segment completion reaches the music backend by callback, not the 15s poll.

## Test steps

1. `.venv/bin/python -m pytest -q tests/test_job_manager.py tests/test_transcription_cache.py`: all pass, including the three JET-280 tests (lanes, segment callback, cache hit with the lock held).
2. Restart the service and start two music-video renders about 10s apart. In the log, render B's `segment-concat` job goes to `running` while render A's segments are still running.
3. Start a `/api/v1/lyric-transcription` for a new song, then stitch a song whose transcript is cached. The stitch logs `[TRANSCRIPT] cache hit` right away and does not wait for the transcription to finish.
4. In the music backend log, each segment wakes from its callback within about a second of finishing, with no 15s poll gap.

## Thread
2026-11-10T01:57:35+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:04:35+05:30 aquib N: status: open -> approved
