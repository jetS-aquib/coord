---
id: JET-324
title: Late lyric callbacks get '404 Assembly job not found' after the 60s re-ask already got the result
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-16T12:34:50+05:30
updated: 2026-11-16T12:34:50+05:30
decisions: 
---

## Request

Stop the music backend answering 404 to a lyric-transcription/song-read callback that arrives after it stopped waiting, and make the video service log say what actually happened.

## Understanding

No lyrics are lost; this is log noise and a misleading message. I assume the fix is on both ends: (a) music backend answers 202 {accepted, nothing waiting} instead of 404 for a callback whose jobId matches no waiter and no assembly job, or keeps the waiter for a short grace period after the repost; (b) video service logs music-video callback refusals as such, not as a creator measurement. I assume renders' assembly callbacks keep their current 404 for a truly unknown job, so a real mismatch is still visible.

## Plan

1. Music backend: in postWithCallback, remember request ids it stopped waiting on (short TTL, e.g. 10 min) and have the callback controller answer 202 for them before the assembly lookup.
2. Video service: pass a label into the shared delivery in callbacks/creator.py so music-video callbacks log 'music backend declined the callback', and a 404 for a deferred lyric request is info, not a warning.
3. Test: an uncached song read logs no 404 warning; an assembly callback for an unknown job still gets 404.

## Reason

Every uncached lyric read (~84s: Demucs + Gemini) logs 'creator refused the measurement for attempt …: 404 {"error":"Assembly job not found"}' on the video service. postWithCallback (video-api.service.ts) waits 60s for the callback, then re-POSTs; the re-POST is answered 200 from the cache and the waiter is deleted. The original callback then arrives, wakeJobWaiter finds no waiter, and musicVideoCallback.controller.ts falls through to the GenerationJob (assembly) lookup and answers 404. Harmless — the result was already delivered — but noisy and the wording points at the creator API, which is not involved.

## Related files

music-jetkreate-backend: src/modules/video/video-api.service.ts, src/modules/video/musicVideoCallback.controller.ts; video-processing-backend: app/infrastructure/callbacks/creator.py

## Acceptance criteria

Reading a new song's lyrics produces no '404 Assembly job not found' and no 'creator refused the measurement' line; render callbacks behave as before.

## Test steps

—

## Thread
2026-11-16T12:34:50+05:30 aquib N: created ticket, status: - -> open
