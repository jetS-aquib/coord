---
id: D-061
title: The lyric engine is named per request, not per deployment
date: 2026-11-03
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend, creater-ai-backend
tickets: 
---

## Context

D-059 made the engine a deployment setting, LYRIC_ENGINE=whisper|gemini. It can only answer for the whole service. creater-ai-backend calls /api/v1/clip-stitching-with-lyrics and has never heard of engines; music-jetkreate-backend is the flow that wants Gemini. Turning Gemini on for the second silently moves the first - a default nobody opted into would change under them, which is the one thing D-059's reason said must not happen. Three entry points transcribe and share one byte-keyed cache: /api/v1/lyric-transcription (the JET-201 warm-up), /api/v1/song-read, and the stitch on v1 and v2.

## Options considered

1) Keep LYRIC_ENGINE and just never set it to gemini. Rejected: the guarantee is then a convention an ops change can break, and the request that wants Gemini cannot have it. 2) Engine by API version - v2 is gemini, v1 is whisper. Zero caller changes and the caller already has STITCH_API_VERSION. Rejected: lyric-transcription and song-read are deliberately version-independent and have no v2, so the warm-up would transcribe on Whisper while the v2 stitch asked for Gemini - a cache miss, 200s of Whisper wasted, a full Gemini run on the critical path, and sections read off different words than the captions are burnt from. 3) Engine by caller identity from the service assertion. Rejected: ServiceContext carries only attempt_id, workspace_id and jti, and both callers mint under the one shared issuer jetkreate-creator-api, so it would need a new claim minted creator-side and a change to the auth contract. 4) An optional request field.

## Decision

An optional lyricEngine field on clip-stitching-with-lyrics, segment-concat, lyric-transcription and song-read, on v1 and v2 alike. Absent is whisper, hardcoded in app/core/lyric_engine.DEFAULT_ENGINE. LYRIC_ENGINE is deleted: a second way to answer the same question is a way for a deployment to change what an old caller gets. LYRIC_GEMINI_MODEL and GEMINI_API_KEY stay settings - they say how to reach Gemini, not whether this request wanted it. A value other than whisper|gemini is a 422 off a Literal, not a quiet fall back. The engine is passed explicitly into transcription.fingerprint and into song_read.cache_key, because transcription_config() harvests settings and the engine is no longer one; song_read.cache_key also gains language, which it should always have had.

## Reason

The guarantee becomes structural rather than operational: there is no variable anywhere that can change what a caller who named no engine receives. The two cache keys are the only way to get this wrong silently - without the engine in them, a caller who asked for nothing is served Gemini's words out of another caller's warm-up, which is worse than the problem being solved.

## Consequences

No server-side off switch. A Gemini outage still degrades on its own, since every failure falls back to Whisper, but stopping customer audio from reaching Google needs music-jetkreate-backend to deploy with its own flag off. Callers must send the same engine on all of a song's calls or they transcribe it twice - the same rule as language, and documented beside it. Adding the engine to the transcript fingerprint changes every existing key, so the transcript cache is cold once on deploy (24h TTL anyway). Supersedes D-059 on the selection mechanism only; everything D-059 recorded about what Gemini costs, what it gets right, and how much weaker its reproducibility is still stands.
