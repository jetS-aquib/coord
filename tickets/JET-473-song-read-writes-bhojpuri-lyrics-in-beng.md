---
id: JET-473
title: Song read writes Bhojpuri lyrics in Bengali script; Hindi-belt languages must come back in Devanagari
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-26T17:12:18+05:30
updated: 2026-11-26T17:12:18+05:30
decisions: 
---

## Request

A Bhojpuri song ("Heroine", 3:32) came back from POST /api/v1/song-read with every lines[].text in Bengali script (e.g. হিরোইন হো হিরোইন). Bhojpuri, like Hindi, Maithili, Magahi, Awadhi, Bundeli, Chhattisgarhi, Haryanvi and Rajasthani, is written in Devanagari. The lyrics screen shows text, so the person sees a script they cannot read.

## Understanding

Assumptions: (1) the Bengali script comes from the Gemini sheet and/or the verbatim audioTranscription with language=auto. I have not seen the service log for this read, so which of the two started it is a guess; the log line '[LYRICS] gemini returned ... language=' will say. (2) Bengali-script output is only correct when the song really is in Bengali, Assamese or another language written in that script. (3) Our backend shows lines[].text and lines[].roman as you return them and does not convert scripts. (4) Our side caches reads by SONG_READ_CACHE_V1, so already-read songs will not change until we bump that constant. That is our job, done after yours lands.

## Plan

1. SHEET_PROMPT: name the Hindi-belt languages (Bhojpuri, Maithili, Magahi, Awadhi, Haryanvi, Rajasthani, etc.) as written in Devanagari, and say to use Bengali, Odia, Gurmukhi etc. only when the song is in that language.
2. Ask the sheet to also return the language it heard (one field), and use it for the read's language instead of the Devanagari-only guess in _language_of; keep the script guess as a fallback.
3. If the sheet names a Devanagari language but returns another Indic script, re-ask once; never ship mismatched script.
4. Extend _resolve_transliteration_language so Devanagari Hindi-belt languages romanise like hi.
5. Bump read_version; add a lyric_eval case for a Bhojpuri track (Sent Gamkauwa is already referenced in the file).

## Reason

SHEET_PROMPT (app/processors/lyrics/gemini_transcriber.py:354) says only 'the language's own script (Devanagari for Hindi, ...)'. Bhojpuri is not named, and it sounds close to eastern languages, so the model picks Bengali script. _language_of (line 209) then sees no Devanagari and reports 'en', so the Hindi romanisation path (lyric_extractor.py:629) is skipped and the read's language is wrong too (it feeds casting on our side).

## Related files

app/processors/lyrics/gemini_transcriber.py, app/processors/lyrics/lyric_extractor.py

## Acceptance criteria

Song read of a Bhojpuri track returns lines[].text in Devanagari, lines[].roman in everyday Roman spelling, and language 'bho' (or 'hi'), not 'en'. A real Bengali song still comes back in Bengali script.

## Test steps

—

## Thread
2026-11-26T17:12:18+05:30 aquib N: created ticket, status: - -> open
