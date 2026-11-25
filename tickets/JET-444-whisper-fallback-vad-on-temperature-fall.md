---
id: JET-444
title: Whisper fallback: VAD on, temperature fallback off, batched decoding, and the baked .env checked against staging
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-25T12:57:58+05:30
updated: 2026-11-25T12:57:58+05:30
decisions: 
---

## Request

When Gemini fails, the read falls back to local Whisper, which takes 200s+ on CPU. Make the fallback cheap enough to be a real safety net.

## Understanding

Only the Whisper path. Confirm from JET-441's [BOOT-CONFIG] what staging actually runs. Then VAD on and temperature fallback off for the fallback, and BatchedInferencePipeline for the decode. Whisper is also what a request naming no engine gets (D-061), so any change to its words needs a transcript/READ_VERSION bump and an eval run on the Whisper path. Assumes the music backend keeps sending lyricEngine=gemini, so this is the rare path.

## Plan

1. Read [BOOT-CONFIG] from staging logs
2. Settings: VAD on, temp fallback off (env or defaults), fix the README's rebuild table
3. lyric_extractor: BatchedInferencePipeline behind a setting
4. compare_whisper_models.py + eval on the Whisper path; bump TRANSCRIPT_VERSION if words change

## Reason

The repo's .env (copied into the image by Dockerfile:86) has WHISPER_VAD_FILTER=false and WHISPER_TEMPERATURE_FALLBACK=true, up to 6 decodes per rejected window. faster-whisper's BatchedInferencePipeline is about 2x on CPU and isn't used.

## Related files

app/processors/lyrics/lyric_extractor.py,app/core/config.py,.env,README.md

## Acceptance criteria

With a broken GEMINI_API_KEY a 4-min read still returns, [READ-PERF] outcome=fallback_whisper, whisper_transcription at least 2x faster than today, eval not worse.

## Test steps

—

## Thread
2026-11-25T12:57:58+05:30 aquib N: created ticket, status: - -> open
