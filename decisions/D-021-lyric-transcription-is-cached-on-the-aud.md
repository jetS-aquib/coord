---
id: D-021
title: Lyric transcription is cached on the audio's bytes, not a transcript id
date: 2026-10-26
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-201
---

## Context

JET-201 asks for transcription to start when a render starts rather than at stitch time, so Whisper runs inside the nine minutes of clip generation instead of on the critical path at the end. That needs the stitch call to find what the earlier call produced. The requester chose a cache over an explicit transcript id, keyed on plan.audioUrl, because an id would have to live on the plan document, survive a resume and be invalidated whenever the audio changed.

## Options considered

A transcript id the caller holds and passes back; a cache keyed on the audio URL; a cache keyed on the audio's content.

## Decision

POST /api/v1/lyric-transcription transcribes and keeps the transcript, keyed on a SHA-256 of the audio's bytes together with the language, the Whisper model and whether vocals were separated. clip-stitching-with-lyrics looks there before transcribing. No transcript id and no new field on the stitch request. Entries live 24 hours, the most recent 64 are kept, and the endpoint runs the pipeline's own transcription phase rather than a second copy of it.

## Reason

The caller's audio URLs are signed and expire, so the same song re-signed an hour later is a different string and would miss a URL-keyed cache every time — the behaviour the requester asked for, but not what a URL key delivers. The bytes are the thing being transcribed: they make a re-render of unchanged audio free and an edited song correctly a miss, which is exactly the invalidation rule the requester wanted from a URL. Both sides download the audio anyway, so the hash is the only new cost. One construction site for the extractor keeps a cached transcript identical to the one the stitch would have made itself.

## Consequences

music-jetkreate-backend passes nothing extra: fire the call unawaited at startRenderV1 behind showLyrics, await it with a catch before stitching, ignore the result. A failed, slow or absent transcription leaves today's path exactly as it is — the stitch transcribes inline. A dropped response costs nothing because the transcript is cached before the response is sent. Two callers for the same audio serialise and the second takes the first's result; all transcription in the process is serialised by one lock, which also keeps two threads off one faster-whisper model. Language must match between the two calls or the second transcribes again. Transcripts accumulate under STORAGE_ROOT/transcripts, bounded by the TTL and the entry cap.
