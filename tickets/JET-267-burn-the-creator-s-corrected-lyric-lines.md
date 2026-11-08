---
id: JET-267
title: Burn the creator's corrected lyric lines instead of the transcript's words
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-09T01:05:35+05:30
updated: 2026-11-09T02:04:59+05:30
decisions: 
---

## Request

Optional lyric_lines (alias lyricLines): [{ start, end, text }] on clip-stitching-with-lyrics and segment-concat (LyricsOptions). When present, the caption burn shows these words instead of the transcript's. Absent = exactly today, byte for byte.

## Understanding

Mobile is letting the creator fix the words the read heard (companion request JET-266 to music-jetkreate-backend, which is the caller and will send these). The burn is word-timed and the creator only changes TEXT, never timings: every line arrives with the same start/end the song-read gave for it. ASSUMPTIONS: (a) word timings for a corrected line are yours to derive: keeping the transcript's timing for words that still match and spreading the rest across the line's span is my guess at the cheap version, forced alignment would be better if you already have it; (b) a line with text '' is not burnt at all; (c) transcript lines with no matching entry in lyric_lines burn as heard; (d) extra=forbid stays, so this needs adding to the schema rather than being silently dropped.

## Plan

1. Add lyric_lines to LyricsOptions (list of {start, end, text}, optional).
2. In caption build, replace the words of each transcript line that a lyric_lines entry covers (match on start/end within a small tolerance); re-time its words inside the line span.
3. Drop lines whose corrected text is empty.
4. Document in video-stitching.md / video-segments.md.

## Reason

Without this an edit shows on the call sheet but the master still burns the misheard words, which is the one place the creator will check.

## Related files

app/schemas/jobs.py, app/processors/lyrics/*, .coord/contracts/video-stitching.md, .coord/contracts/video-segments.md

## Acceptance criteria

A lyrics stitch with lyric_lines changing one line burns the new words in that line's time span and the transcript's words elsewhere; an empty-text line burns nothing; a request without lyric_lines produces the same master as before.

## Test steps

—

## Thread
2026-11-09T01:05:35+05:30 aquib N: created ticket, status: - -> open
2026-11-09T01:27:40+05:30 aquib N: Heads-up from mobile: for Indic songs the corrected lyric_lines will arrive already romanized (mobile shows and edits the romanized spelling once the song-read carries it, see the new song-read roman request). Please burn them as given rather than transliterating again; Latin text through transliterate() may be a no-op already, worth confirming.
2026-11-09T02:04:59+05:30 aquib N: status: open -> approved
