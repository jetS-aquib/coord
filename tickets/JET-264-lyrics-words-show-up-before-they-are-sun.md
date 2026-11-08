---
id: JET-264
title: Lyrics: words show up before they are sung, lines break mid-phrase, and Hindi comes back without punctuation or proper Hinglish
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-08T16:35:25+05:30
updated: 2026-11-08T16:41:28+05:30
decisions: 
---

## Request

Get lyrics in two cheaper steps instead of today's several Gemini audio calls: Gemini writes the text once (proper lines, punctuation such as !, Devanagari plus Hinglish spelling), and a local forced aligner times every word against the vocal stem. Captions should land on the sung word, the way a studio lyric video does.

## Understanding

Today: GeminiModel.transcribe sends the mix AND the vocal stem in parallel, each up to 3 attempts, using audioTranscriptionConfig {wordTimestamp, mode VERBATIM}. Every word's time comes from Gemini's own timestamps. Lines are rebuilt from those times by _lines (gap or end of sentence). Hindi is romanized letter by letter by transliterator.py. What I think causes each complaint: (1) words early: Gemini audio timestamps are approximate, not measured onsets, and lyric_wave also brings each line in up to 600 ms early on purpose (caption_style_renderer.py ~3285); (2) lines break mid-phrase ('I remember the / prison of all memories and I'm'): _lines splits on timing gaps, not on the lyricist's lines; (3) no '!' and poor Hinglish: VERBATIM mode transcribes, it does not write lyrics. The web team's better Hindi lyrics seem to come from asking Gemini to WRITE the lyrics in a prompt, but I found no such prompt in creater-ai-*, iris or the frontend; they may be running it by hand. Assumptions to check in the spike: torchaudio's MMS_FA (installed, torch 2.14 / torchaudio 2.11) aligns sung Hindi and English on the Demucs stem within ~100 ms on CPU in seconds, not minutes; MMS_FA takes romanized text, so the Hinglish line is exactly its input. This also replaces the separate per-song Hinglish call in the uncommitted JET-263 work.

## Plan

1. SPIKE first, no product change: on 'Lutt Putt Gaya' (Dunki), the chai-tapri Hindi song and 'Stay With Me', measure word-onset error and CPU time for (a) today's Gemini timestamps and (b) MMS_FA on the vocal stem, against ~30 hand-marked onsets per song. Go on only if (b) is clearly better and under ~20 s per 4-minute song.
2. One Gemini call with a PROMPT (not audioTranscriptionConfig) on the vocal stem (or the mix when there is no stem): returns lines as the song is written, each with Devanagari text (or English), a Hinglish romanization (English loanwords in English) and natural punctuation. JSON schema, temperature 0, one retry. Drops the mix+stem pair and the 3-attempt loop.
3. Forced alignment: MMS_FA aligns the romanized lines to the stem and gives a start and end for each word. A line it cannot align (low score) keeps Gemini's timing for that line only.
4. Line breaks come from Gemini's lines, not timing gaps; a line too long for the frame is split at a phrase boundary.
5. Captions: the line enters at most ~150 ms before its first word (today 600 ms), and the highlighted word changes on its aligned onset.
6. Behind LYRIC_ENGINE=gemini_aligned so the existing gemini/whisper paths stay as they are; bump TRANSCRIPT_VERSION.
7. Tests for the prompt parsing, the alignment fallback and line breaking; a small fixture with known onsets.

## Reason

Captions that land before the word is sung, and lines cut mid-phrase, are the first thing that makes a lyric video look amateur. The current path also pays for 2-6 Gemini audio calls per song.

## Related files

app/processors/lyrics/gemini_transcriber.py,app/processors/lyrics/lyric_extractor.py,app/processors/lyrics/caption_style_renderer.py,app/processors/lyrics/transliterator.py,app/services/transcription.py

## Acceptance criteria

On the three test songs: median word-onset error under 100 ms and no word shown more than 200 ms before it is sung; lines break where the lyric does; Hindi lines carry punctuation like '!' and Hinglish such as 'kya scene hai'; one Gemini audio call per song instead of 2-6; lyric time per song no slower than today.

## Test steps

1. Render 'Lutt Putt Gaya' with captions on.
2. Scrub through a chorus frame by frame: each word should highlight as it is sung, never visibly before.
3. Lines should read as the song is written; no line ending on 'and I'm' or 'the'.
4. Hindi captions show punctuation and Hinglish spelling (scene, walk, baby).
5. The Python log shows one Gemini call for the song plus an 'aligned N/M words' line.

## Thread
2026-11-08T16:35:25+05:30 aquib N: created ticket, status: - -> open
2026-11-08T16:41:28+05:30 aquib N: status: open -> approved
