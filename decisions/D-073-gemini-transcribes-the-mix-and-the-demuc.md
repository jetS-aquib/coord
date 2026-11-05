---
id: D-073
title: Gemini transcribes the mix AND the Demucs vocal stem, and merges them, instead of the mix alone
date: 2026-11-05
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-256
---

## Context

Gemini (gemini-3.5-transcribe) on the full mix silently dropped sung stretches: 'Stay With Me' lost its 31-59s verse on every call, and some calls returned 12 words ('I remember the' x4, finishReason STOP) for a 4-minute song. Temperature 0 did not make it repeatable. The caption pipeline was verified to lose nothing; every gap in a video was a gap in the transcript.

## Options considered

—

## Decision

With USE_VOCAL_SEPARATION on, run Demucs once, encode the stem as stereo 192k MP3, send mix and stem in parallel, take the reply with more words and fill its silences over 4s with the other's words. A repetition-loop reply counts as that input failing; both failing falls back to Whisper as before. Transcript cache key and song-read READ_VERSION bumped.

## Reason

—

## Consequences

One extra Gemini call per new song (same audio tokens again) and one Demucs run (~55s on an M-series Mac, more on the 2-vCPU server, roughly 1.5-3GB RAM). Measured after: Stay With Me 333/333, Timeless 498/498, short track 86/84. Timeless still misses 0-34s, 44-50s and 228-237s in both inputs; not addressed.
