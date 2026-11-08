---
id: JET-269
title: Pass the romanized lyric line through song-read, and let a correction replace it too
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-09T01:27:40+05:30
updated: 2026-11-09T01:27:40+05:30
decisions: 
---

## Request

Both song-read routes: pass each line's roman (from video-processing-backend, see the companion request) through unchanged. In applyLyricEditsV1, a corrected line sets text to the correction and drops roman, since what the person typed is already in the script they want.

## Understanding

Hindi lyrics reach the mobile Lyrics step in Devanagari; the captions burn the romanized spelling. Video-processing-backend is being asked to add an optional roman per line. Mobile will show and edit roman ?? text, and when the person changes anything it PUTs every line with the romanized text (JET-266 sends every line). ASSUMPTIONS: (a) SongLineV1 and the response mapping currently whitelist start/end/text, so roman would be dropped unless added; (b) the planner/brief keep reading text as today (Devanagari for untouched songs, the person's romanized words once corrected), and an LLM planner reads either; (c) no change to PUT's schema: corrections are still text only.

## Plan

1. SongLineV1: roman?: string; map it through in video-api.service.ts.
2. applyLyricEditsV1: corrected line -> { start, end, text } with no roman.
3. One line in api-music-videos.md under the song-read routes.

## Reason

So the creator checks and fixes the lyrics in the spelling that ends up on their video.

## Related files

src/modules/video/video-api.service.ts, src/services/render/lyricsEditV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

POST song-read for a Hindi song returns lines with roman; after a PUT correcting one line, that line has the corrected text and no roman, the others keep both.

## Test steps

—

## Thread
2026-11-09T01:27:40+05:30 aquib N: created ticket, status: - -> open
