---
id: JET-266
title: Let the creator correct the extracted lyrics, and use the corrected words everywhere after
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T01:05:24+05:30
updated: 2026-11-09T01:06:39+05:30
decisions: 
---

## Request

Add PUT /api/v1/music-videos/lyrics, body { audioUrl, lines: [{ start, end, text }] } (1-400 lines, text 0-300 chars, '' = the line was removed). Store it per user + audioUrl. From then on, for that user and audio: (1) POST song-read and GET :id/song-read return the corrected text in sections[].lines and a top-level edited: true; (2) brief reads the corrected words; (3) the render uses them for the planner's lyricLines, MusicVideo.lyrics (fillLyricsV1 prefers them over TranscriptV1) and the caption burn (passed to video-processing-backend, see the companion request). PUT with lines: [] or DELETE /api/v1/music-videos/lyrics { audioUrl } goes back to what was heard.

## Understanding

Mobile is adding a Lyrics step between the track and the director: the person sees the words the read heard, line by line with timings, can listen to any line, and fix the words. Whisper/Gemini get lyrics wrong often enough that a video burning the wrong words is the first thing a musician notices. Today nothing can take a correction: MusicVideo.lyrics is free text and only fed to cast/treatment; the planner's lyricLines and the caption burn both come from the cached transcript keyed on the audio bytes. ASSUMPTIONS: (a) the person edits TEXT only. Start/end are echoed back unchanged from the read; mobile never re-times, splits, merges or adds lines in this version. (b) Section boundaries stay as measured; edits do not re-run the read. (c) Keyed per user, not just on audioUrl, because library tracks are shared and one person's correction must not rewrite another's video. (d) There is no project yet at this point (D-030, JET-214), so it cannot live on MusicVideo until a render is planned, at which point it is copied over like the transcript is today. (e) A corrected line with the same start/end as a read line replaces that line; a read line absent from the PUT is left as heard.

## Plan

1. LyricsEdit model { userId, audioUrl, lines, updatedAt }, unique on (userId, audioUrl).
2. PUT/DELETE /api/v1/music-videos/lyrics with zod validation; 404 if no read exists for that audio.
3. Overlay helper applied to both song-read routes, the brief's lyric input, and the render's song read; add edited: true when it applied.
4. fillLyricsV1: corrected text first, then TranscriptV1.
5. Pass the corrected lines to the stitch / segment-concat as lyricLines once video-processing-backend accepts them; omit when there are no edits, so nothing changes for anyone who did not edit.
6. Contract api-music-videos.md updated.

## Reason

Captions are on by default now (JET-234) and the words come straight from speech-to-text with no way to fix them; a wrong line burnt into a finished video costs a whole re-render.

## Related files

src/models, src/modules/musicVideo, src/services/render/renderOrchestratorV1.ts, src/routes, .coord/contracts/api-music-videos.md

## Acceptance criteria

PUT then POST song-read for the same audio returns the corrected text with edited: true; another user on the same audio still gets what was heard; a render of that audio shows the corrected words on the call sheet and burnt on the master; DELETE restores the heard words.

## Test steps

—

## Thread
2026-11-09T01:05:24+05:30 aquib N: created ticket, status: - -> open
2026-11-09T01:06:39+05:30 aquib N: status: open -> approved
2026-11-09T01:09:53+05:30 aquib N: Built steps 1-4 and 6 (uncommitted): LyricsEditV1 model unique on (userId, audioUrl); PUT/DELETE /api/v1/music-videos/lyrics (zod, 0-400 lines, text <=300, lines [] clears, 404 when the song has no read); songReadV1(audioUrl, userId) now = shared read + this user's corrections, so both song-read routes (edited: boolean), the brief and the planner's lyricLines all see corrected words; the routes' in-flight join holds the read as heard and overlays per caller, so one user's edits never reach another; fillLyricsV1 takes corrected lines before TranscriptV1. Lines match on start/end to the millisecond. Step 5 (send lyric_lines to the burn) NOT built: JET-267 is still waiting, and their schema is extra=forbid, so sending it now would 422 every edited render. This request stays at go until JET-267 lands.
