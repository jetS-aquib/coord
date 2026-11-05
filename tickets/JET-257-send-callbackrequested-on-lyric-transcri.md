---
id: JET-257
title: Send callbackRequested on lyric-transcription and song-read, wait for the callback, and tell the app lyrics are still being read
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-06T02:25:52+05:30
updated: 2026-11-06T02:26:03+05:30
decisions: D-074
---

## Request

A new song's read now takes minutes (Demucs + Gemini), and every call through mcn-video-processing.jetkreate.com is cut off by the Google load balancer at 30s with '504 stream timeout' (seen 2026-11-05 20:21: 'song read unavailable … cutting by duration instead'). video-processing-backend now accepts callbackRequested: true on POST /api/v1/lyric-transcription and /api/v1/song-read. Answer within ~20s = 200 with today's body, unchanged. Otherwise 202 {status: 'processing', request_id}, and when the work ends it POSTs to MUSIC_VIDEO_CALLBACK_URL the callback you already accept: {attemptId, workspaceId, jobId: request_id, status: 'completed'|'failed', outputFile: null, error}, signed for aud music-video-assembly-callback. On 'completed', ask again: the answer comes from cache in under a second. No env change.

## Understanding

Assumptions: (1) the 202 body is the only new shape, and a 200 is byte-for-byte today's, so nothing breaks before this lands (the flag is opt-in). (2) The callback carries no transcript or sections, only 'it is ready', so the result is always read through the endpoint you already parse. (3) A callback can be lost (restart, unreachable URL), so the wait needs a fallback: re-POST every ~60s. A re-POST while the work is still running returns another 202 and does not start the work twice (the transcription lock serializes it). (4) The app's own calls to you go through the same load balancer (mcnbackend.jetkreate.com resolves to the same 34.110.144.5), so your app-facing song-read and transcript/warm must not hold a request open past 30s either; they should answer 'pending' and let the app poll you. (5) Guessing: today a failed song read makes the render 'cut by duration'. I assume you would rather the render wait for the read, up to some ceiling, than plan without sections; the ceiling is your call.

## Plan

1. lyricTranscription/songRead: send callbackRequested: true. On 200, as today. On 202, register a waiter on request_id (same jobWaiters map JET-252 added, which the existing receiver already wakes) and wait. On wake with completed, or every 60s, re-POST; stop at the first 200. On failed, take today's fallback path.
2. App-facing /music-videos/song-read and /transcript/warm: if the read is pending, answer quickly with a pending state (e.g. 202 {status: 'reading_lyrics'}) instead of holding the request, and finish it in the background as warmTranscriptV1 already does.
3. Expose that pending state where the app polls (render status or the song-read route) so the app can say something like: 'Listening to your song and writing out the lyrics. New songs can take a few minutes; we will carry on as soon as they are ready.'
4. Render path: wait for a pending read (ceiling of your choosing, e.g. 20 min) before falling back to cutting by duration.
5. Tests: a 202 then callback resolves; a lost callback resolves on the 60s re-POST; a failed callback falls back.

## Reason

Raising the load balancer timeout can't be made long enough for every song (a Demucs run took 789s and was then killed on the current VM), and it needs DevOps. A callback has no ceiling. The receiver already wakes an in-process wait by jobId (JET-252, wakeJobWaiter), before its 404, so the existing endpoint and env var are reused.

## Related files

src/modules/video/video-api.service.ts,src/services/render/renderOrchestratorV1.ts,src/modules/video/musicVideoCallback.controller.ts,the routes behind /api/v1/music-videos/song-read and /api/v1/music-videos/transcript/warm

## Acceptance criteria

On the server, a song nobody has uploaded before: no 504 in the logs; the video service logs '[SONG-READ] still working after 20s — answered 202, will call back as <id>', then '<id> completed — calling back'; your log shows the callback accepted (202) and the song read stored with sections; the app shows the waiting message meanwhile, not an error.

## Test steps

—

## Thread
2026-11-06T02:25:52+05:30 aquib N: created ticket, status: - -> open
2026-11-06T02:26:03+05:30 aquib N: linked decision D-074 (lyric-transcription and song-read answer 202 and call back when a read outlasts 20s, instead of raising the load balancer timeout)
