---
id: JET-268
title: Song-read lines should carry the romanized text the captions already burn
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-09T01:27:40+05:30
updated: 2026-11-09T23:29:28+05:30
decisions: 
---

## Request

Add an optional roman: string to each line in POST /api/v1/song-read sections[].lines, taken from the transcript segment's romanized_text. Present only when it differs from text (i.e. a non-Latin script like Hindi in Devanagari); absent otherwise. text stays exactly as today.

## Understanding

Mobile's new Lyrics step (JET-266) shows the creator the words to check and fix. For Hindi songs they arrive in Devanagari, but the master burns the romanized (Hinglish) spelling, which lyric_extractor already produces per segment as romanized_text (JET-264/265). So the creator is checking a script that never appears on their video. lines_from() in app/services/song_read.py reads segment['text'] only. ASSUMPTIONS: (a) romanized_text is already on every cached segment for Indic songs, so this needs no new transliteration and no Gemini call; (b) additive, so the planner and section detection, which read text, are unchanged; (c) the read cache needs a READ_VERSION bump or songs already read will lack roman until they expire, which is your call; (d) for a Latin-script song, roman is omitted rather than duplicated.

## Plan

1. lines_from(): add roman = segment.romanized_text when non-empty and != text.
2. SongLine schema: roman: str | None = None, excluded when None.
3. Bump READ_VERSION (or document why not).
4. Update video-song-read.md.

## Reason

The creator has to fix the words in the spelling the video will actually show; fixing Devanagari that is then re-transliterated letter by letter puts back the errors JET-263/264 exist to avoid.

## Related files

app/services/song_read.py, app/schemas/song_read.py, .coord/contracts/video-song-read.md

## Acceptance criteria

A Hindi song's song-read lines carry roman in the same spelling its captions burn; an English song's lines have no roman; text and sections are unchanged.

## Test steps

1. POST /api/v1/song-read for a Hindi song (e.g. 'Oye Hoye Kya Scene Hai', lyricEngine gemini).
2. read_version is "6"; each line has text in Devanagari and roman in Hinglish (e.g. 'teri walk mein taan hai'), spelled as the captions burn it.
3. POST it for an English song (e.g. 'Stay With Me'): lines have no roman key at all; text and sections are as before.

## Thread
2026-11-09T01:27:40+05:30 aquib N: created ticket, status: - -> open
2026-11-09T02:05:01+05:30 aquib N: status: open -> approved
2026-11-09T02:13:43+05:30 aquib N: status: approved -> in_progress
2026-11-09T02:14:05+05:30 aquib N: Built (uncommitted). lines_from adds roman = segment romanized_text when non-empty and != text; SongLine.roman serialized only when present (absent, not null, for English). READ_VERSION 6. Contract video-song-read.md updated. No new Gemini call.
2026-11-09T23:29:28+05:30 aquib N: status: in_progress -> review — Committed in 26895f7.
