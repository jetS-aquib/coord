---
id: JET-323
title: Lyric captions drift from the vocals: time each word with a forced aligner on the vocal stem, keep Gemini for the words
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-13T16:03:40+05:30
updated: 2026-11-13T16:14:10+05:30
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

1. Restart the video service (forced alignment is on by default; vocal separation must be on).
2. Render "Oye Hoye Kya Scene Hai" with lyrics from the app. The log shows `[LYRICS] aligned 47/47 lines` and `aligner timed N/47 lines`.
3. Watch 20-30s, 70-85s and 94-102s: each line appears as it is sung, no two lines on screen at once, and the opening chorus no longer flashes past.
4. Render one more song you know (e.g. Lutt Putt Gaya): no worse than before; check the repeated "lut-put gaya" stretch around 53-61s.
5. Remove the line, restart: renders use Gemini timings as before.

## Thread
2026-11-13T16:03:40+05:30 aquib N: created ticket, status: - -> open
2026-11-13T16:04:49+05:30 aquib N: status: open -> approved
2026-11-13T16:05:03+05:30 aquib N: status: approved -> in_progress
2026-11-13T16:14:04+05:30 aquib N: Built, uncommitted, behind LYRIC_FORCED_ALIGNMENT (off). Changes vs plan: no +-3s window (Gemini was off by up to 6.6s on Oye Hoye, a window misses); one global MMS_FA alignment in 30s chunks instead (in order by construction, 3.4GB->2.9GB peak, ~11-20s/song on the Mac). Per line: aligner's times if mean confidence >= 0.3, else Gemini's, fitted between sure neighbours; no overlaps; a word lasts to the next word's start (CTC ends are early), min 0.3s. No version bumps: the flag is lyric_* so it is in the transcript key, and it was added to the song-read key. Measured (Gemini -> new): Oye Hoye overlaps 13->0, sung>=1s uncaptioned 11.0s->4.6s, words<150ms 18%->6%, 30/47 lines aligned. Lutt Putt: starts median 0.03s apart, 48/58 aligned, lines tighter (v2 holds them to the next line); lines 12-14 moved ~1.7s inside a repeated 'lut-put' stretch, needs an ear. La Bamba 14/19 aligned. Sent Gamkauwa (Bhojpuri+DJ tags) 4/51 aligned, i.e. almost unchanged. Not done: Docker prefetch of the 1.2GB MMS weights (downloaded on first use, like Demucs); music backend cache bump when the flag goes on.
2026-11-13T16:14:10+05:30 aquib N: status: in_progress -> review
2026-11-13T16:16:22+05:30 aquib N: Per the requester: LYRIC_FORCED_ALIGNMENT now defaults to true in app/core/config.py (a flag is not a secret, so it does not belong in .env). LYRIC_FORCED_ALIGNMENT=false still turns it off. Test step 1 no longer needs an .env line, just a restart. Consequence: on deploy every Gemini render with vocal separation uses the aligner, and cached transcripts/reads miss once. The music backend SONG_READ_CACHE_V1 bump is now needed at deploy, not later.
2026-11-13T17:02:56+05:30 aquib N: Round 2, after the requester saw 'teri walk' shown after it was sung. Cause: Gemini's sheet wrote it after 'mere chai…' (and merged two lines); the in-order aligner stretched 'scene' over its singing. Also general: a sung line missing from Gemini's text slid every later line 4-7s late. Changes: (1) STAR token between lines soaks up singing the text lacks; (2) a line the in-order pass is unsure of (<0.3) is searched again in windows its own length within 12s, away from sure lines, and moves only at confidence >=0.5; (3) _retime orders lines by where they were found. Measured with a replay harness on the eval set (4 songs x 3 Gemini reads, same text for every variant, scored against the .lrc refs), lines within 1s: Gemini 92% -> 96% (Lutt 84->96, Oye 91->97, Stay 100->100, Timeless 92->91); within 0.5s 88->91%; shown >1s early 3->2%. Rejected, measured: per-line search with no length limit (29% within 1s), picking the lyric sheet by alignment fit (recall 66->63%), moving at confidence 0.3 (Timeless 91->85%). The render that misplaced 'teri walk' now puts it at 49.9s, before 'mere chai'. Cost 14-21s/song on the Mac. Limits: a line Gemini never wrote cannot be shown; a merged line stays one caption; refs are lrclib drafts.
2026-11-13T17:27:26+05:30 aquib N: Paused by the requester: no significant difference seen in a real render. Committed 25d13c2 with LYRIC_FORCED_ALIGNMENT defaulting to false (config.py), so renders use Gemini's timings as before. To revisit: the remaining sync errors are mostly Gemini's text (missing, merged, misordered lines), which timing cannot fix; and the eval refs are lrclib drafts, so a hand-checked word-level reference would be needed to show a difference worth turning on. Replay harness: scratchpad sync/replay.py + dump2.py.
