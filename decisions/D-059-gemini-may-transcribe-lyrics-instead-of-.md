---
id: D-059
title: Gemini may transcribe lyrics instead of Whisper, per deployment
date: 2026-11-02
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: 
---

## Context

Whisper is the whole wait in a lyrics render. Measured on video-processing-backend's own LyricExtractor against a 256s track: 201.8s total, of which 66.3s is Demucs, 6.5s is model load (99s cold) and 135.4s is decoding. The tempo/bars/energy half of the song read costs 0.31s and never needed words. It is also wrong often enough to matter: it hallucinated 'Thank you.' over an instrumental intro and read the hook of a real track as 'Ever since I was a chick'. Sections in /api/v1/song-read are read from lyric repetition, so bad words are bad sections (JET-215).

## Options considered

1) Keep Whisper and tune it. The levers left are small and already known. 2) Move transcription to music-jetkreate-backend, which already has @google/genai and the key. Rejected: the word-timed transcript has three consumers inside video-processing-backend (the caption burn, the song read, the warm-the-cache endpoint) and summarise() deliberately does not ship word timings to Node. Node would have to send a megabyte back, reversing that and changing two contracts. 3) Replace Whisper with Gemini. Rejected: it is a network call to a model we do not host, and Whisper working offline is worth keeping. 4) Both, selected per deployment.

## Decision

LYRIC_ENGINE=whisper|gemini, defaulting to whisper. The Gemini path is a subclass overriding one method, _load_whisper_model, which returns a model-shaped adapter; lyric_extractor.py is unchanged, so the cleaning, word splitting, Devanagari transliteration and segment assembly are literally the same code and the caller's payload is identical by construction. Any Gemini failure falls back to Whisper. The audio is sent as delivered, not downmixed. The engine and model are part of the transcript cache key; the API key deliberately is not.

## Reason

12-45s against 201.8s, and it reads 'a jit', 'XO tatted', 'skateboard P', 'BBC' and 'Neptunes' where Whisper returned gibberish, with nothing over the instrumental intro. Measured, not assumed: mono downmixing is what costs accuracy, not bitrate, so the upload keeps the stereo image. Whisper stays because it is the only engine that works with no network and no third party, and because a default nobody opted into should not change.

## Consequences

A deployment with it on sends the customer's full audio to Google. Reproducibility is weaker: temperature 0.0 makes it repeatable (without it the same bytes gave 498, then 428, then 428 words) but the model is unpinned, so an upstream change moves transcripts without APP_VERSION or read_version moving - the one thing read_version exists to catch and cannot. LYRIC_MIN_WORD_PROBABILITY is inert on that path. Sung Hindi is untested; Devanagari and word timings work on speech.
