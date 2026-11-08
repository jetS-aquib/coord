---
id: JET-265
title: Lyrics vanish when Gemini's transcription misses verses: make the written lyric sheet the source of text and line times (follow-up to JET-264)
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-09T00:15:51+05:30
updated: 2026-11-09T02:05:19+05:30
decisions: 
---

## Request

Lutt Putt Gaya rendered with one or two caption lines at the start and nothing after. The web team gets the whole song in Roman Hinglish with punctuation from a single Gemini prompt. Make lyric extraction robust for Indian and other popular languages, and cheaper.

## Understanding

Evidence: storage/transcripts/7492370a….json (Lutt Putt Gaya, 3:43) has 56 words in 14 lines, none between 10s-108s or 138s-196s, first line at 0.5s over the instrumental intro, and transcription_audio is the mix rather than a vocal stem. JET-264 (uncommitted) times each prompt-sheet word from that transcript and drops the sheet under 80% match, so captions fell back to the 56 words. The truncation guard (<3 words/min) misses 15 words/min. Assumptions: (a) a Gemini prompt call on audio can return per-line start/end times good enough to place lines (the web team's output suggests so; not measured by me); (b) _sung_frames on the vocal stem is a usable signal for spreading words within a line and for rejecting lines placed over silence; (c) Gemini's roman output is better than indic_transliteration for Hindi, Punjabi, Tamil, Telugu, Bengali, Marathi; (d) no new model on the VM (dev's earlier call), so MMS_FA stays out of scope unless asked. Builds on JET-264's sheet prompt and schema; does not redo it.

## Plan

1. Extend JET-264's sheet call: each line also returns start/end (seconds) along with words (text + roman) and punctuation; run on the vocal stem when one exists, else the mix.
2. Make the sheet the source: lines and their times come from it. Where the transcript's words match a line, use their word times for that line only; otherwise keep the line's times. Remove the global 80% rule that discards the sheet.
3. Words inside a line without transcript times: spread over the sung frames (_sung_frames) inside the line's window, not evenly.
4. Drop or shift a line whose window has no vocal energy (kills intro hallucinations like the 0.5s line).
5. Gap check: a sung stretch longer than ~8s with no line gets one more sheet call for that window only.
6. Captions use the sheet's roman text for any Indic language; indic_transliteration only as fallback when roman is empty.
7. When the sheet is the source, skip the mix+stem transcribe pair (keep at most one transcribe on the stem for word refinement) so a song costs 1-2 Gemini audio calls, not 4-6.
8. Bump TRANSCRIPT_VERSION; tests for line timing, gap check, silence gate, and a fixture shaped like the 56-word transcript.

## Reason

Captions disappearing for most of a song is a broken product, and the current design fails exactly on dense Indian mixes. One sheet call is also cheaper than 3-5 transcribe calls.

## Related files

app/processors/lyrics/gemini_transcriber.py,app/processors/lyrics/caption_processor.py,app/processors/lyrics/transliterator.py,app/services/transcription.py,tests/test_gemini_transcriber.py

## Acceptance criteria

Lutt Putt Gaya: captions cover every sung section (no sung stretch over 8s without a line), no line during the instrumental intro, lines in Roman Hinglish with punctuation; Oye Hoye Kya Scene Hai and Stay With Me no worse than JET-264's numbers; at most 2 Gemini audio calls per song in the log; a Tamil or Punjabi song renders with readable Roman captions.

## Test steps

1. Clear the music backend's cached transcript and song read for 'Lutt Putt Gaya' (or bump JET-256's cache to READ_VERSION 5), then render it with lyrics on.
2. Captions start around 0:16 (nothing over the intro) and run to the 'o mannu' ending, with no sung stretch blank for more than ~8s except 1:19-1:48.
3. 'o main toh dhum chik pak dhum' appears around 0:47 and again near 2:19.
4. Every line is Roman with punctuation; no Devanagari or Gurmukhi on screen.
5. Optional: `.venv/bin/python scripts/lyric_eval.py --songs lutt-putt-gaya,oye-hoye-kya-scene-hai --runs 2` prints a score table.

## Thread
2026-11-09T00:15:51+05:30 aquib N: created ticket, status: - -> open
2026-11-09T00:16:18+05:30 aquib N: status: open -> approved
2026-11-09T00:34:03+05:30 aquib N: Built, uncommitted. Clock = vocal stem in ~30s pieces cut at its pauses (whole-song transcribe gave Lutt Putt 63 words; pieces 199-215, twice). Sheet is the source: line start/end (MM:SS.s) in the schema; words take transcript times within 5s of the line, unheard lines spread over the stem's sung frames in their window, lines over <20% singing dropped, transcript-only lines where the sheet has none are kept; sheet rejected only if <50% of the TRANSCRIPT is in it. Roman from the sheet for any script (transliterate known= by word core, danda -> '.'). Results: Lutt Putt 56 -> 220 words / 56 lines, first line 15.9s, only gap 79-108s (no Gemini read hears words there); Oye Hoye chorus 81-87% (JET-264 ~85%); Stay With Me 329/333 timed, 51 lines. Deviation from Done-when: 'at most 2 Gemini audio calls' is now 1 call per 30s piece + 1 sheet call; the audio sent is 2x the song (was 3x, up to 7x with retries). Not done: plan step 5 (extra sheet call per uncovered stretch) - the transcript fill covers it, and Lutt's one gap has nothing any read hears. Tamil song not tested: none on hand. TRANSCRIPT_VERSION 4, READ_VERSION 5.
2026-11-09T01:24:26+05:30 aquib N: Follow-up from dev: vocables ('dhum chik pak dhum') were missing. Cause: the sheet ran on the Demucs stem, which moves chants out of the vocals (stem: 0 of 6, mix: 6 of 6). Sheet now runs on the mix. Also fixed: one global word match paired chorus 1 with chorus 2 (28s apart) and threw the sheet away (Oye Hoye 107/236); now each sheet line is matched only near its own time, in order. The sheet writes the chant all-or-nothing (4 runs of 6), so two sheet calls run in parallel and the fuller is kept. Lutt Putt: 6/6 dhum lines in both final runs. Oye Hoye chorus 79-93% over 3 runs. Audio sent: 3x the song (pieces + 2 sheets).
2026-11-09T02:05:06+05:30 aquib N: status: approved -> in_progress
2026-11-09T02:05:19+05:30 aquib N: status: in_progress -> review — Committed in 769d6bf. Vocals in 30s pieces; two sheets on the mix; sheet is the source of lines/times/chants/Roman. Eval harness for measuring further changes: JET-270 (638af64).
