---
id: JET-323
title: Lyric captions drift from the vocals: time each word with a forced aligner on the vocal stem, keep Gemini for the words
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-13T16:03:40+05:30
updated: 2026-11-13T16:03:40+05:30
decisions: 
---

## Request

Captions should stay in sync with the sung words. Use Gemini for what the words are and a forced aligner for when they are sung.

## Understanding

Gemini's word/line timestamps are the cause, not the caption burn (JET-237 hold is already on in v2). I assume: text stays exactly as Gemini/the lyric sheet gives it; only start/end change. I assume torchaudio MMS_FA (already installed, ~1.2GB weights downloaded once) is acceptable as the aligner, on the Demucs vocal stem the Gemini path already makes. I assume it ships behind a setting, default off until measured, and that a transcript cache bump (TRANSCRIPT_VERSION 6, READ_VERSION 8) is needed when it is turned on. Whisper-engine renders are out of scope (Whisper times its own words).

## Plan

1. New app/processors/lyrics/aligner.py: MMS_FA on the vocal stem, line by line in a window around Gemini's line time (+-3s), romanized words as tokens.
2. Per line: keep aligned times when the alignment score clears a threshold; otherwise keep Gemini's times.
3. Enforce order: no line starts before the previous ends; no zero-length words (min 80ms).
4. Wire into GeminiModel after the sheet is pinned, behind LYRIC_FORCED_ALIGNMENT (off by default); log aligned/kept-line counts and time taken.
5. Measure on Oye Hoye + eval/lyrics songs: overlaps, uncaptioned sung seconds, timing vs aligner, cost (seconds, RSS).
6. Bump TRANSCRIPT_VERSION/READ_VERSION; music backend SONG_READ_CACHE_V1 bump is a separate ask.
7. Tests: overlap/ordering and fallback rules on synthetic words (model not loaded in tests).

## Reason

Oye Hoye Kya Scene Hai (last render, v2, Gemini): first chorus crammed into 4.3s when sung over ~9s, 7 of 47 lines overlap the next, 5 sung stretches of 1-2s have no caption, 30% of words >1s from the aligned time, 18% shorter than 150ms. A/B preview (yellow = Gemini, green = MMS_FA forced alignment): the requester judged green better by ear.

## Related files

app/processors/lyrics/aligner.py, app/processors/lyrics/gemini_transcriber.py, app/core/config.py, app/services/transcription.py, app/services/song_read.py, tests/test_aligner.py

## Acceptance criteria

On Oye Hoye Kya Scene Hai: no overlapping lines, no sung stretch >1s without a caption where Gemini had the words, and a burnt render that looks in sync by ear. Eval songs no worse on words. Cost on the Mac reported.

## Test steps

—

## Thread
2026-11-13T16:03:40+05:30 aquib N: created ticket, status: - -> open
