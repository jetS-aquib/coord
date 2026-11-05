---
id: D-074
title: lyric-transcription and song-read answer 202 and call back when a read outlasts 20s, instead of raising the load balancer timeout
date: 2026-11-06
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-257
---

## Context

With D-073 a new song's read is Demucs + Gemini with retries: minutes, once 789s. Both endpoints are synchronous behind the Google load balancer (via: 1.1 google, 34.110.144.5), which cuts requests at 30s with 504 stream timeout. The music backend then planned the render by duration and showed no lyrics.

## Options considered

—

## Decision

Opt-in callbackRequested on both requests. Wait up to 20s: if done, 200 with today's body. Otherwise 202 {status: processing, request_id}; the work continues and, when it ends, the existing music-video callback is POSTed with jobId = request_id, status completed|failed, no payload. The caller re-asks and is answered from cache. A lost callback is covered by re-asking; the transcription lock stops the work running twice. Absent flag = unchanged.

## Reason

—

## Consequences

Music backend must send the flag, wait on request_id (JET-257) and give the app a pending state; until it does nothing changes. Contracts video-transcription and video-song-read to be updated with the 202 shape once JET-257 is approved. Results for a request that got 202 live only in the 24h disk caches; if those are pruned before the re-ask, the re-ask simply reads the song again.
