---
id: JET-392
title: Let a person type or paste lyrics when the song read fails or hears no words, and time them to the song
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T15:47:54+05:30
updated: 2026-11-23T17:12:31+05:30
decisions: D-097
---

## Request

PUT /api/v1/music-videos/lyrics needs an existing song read and only replaces text of existing timed lines (musicVideoV1.routes.ts:666-690; 404 without a read). When the read fails or a track is judged instrumental there is no way to get lyrics on the video. The app will offer 'Add lyrics myself'.

## Understanding

Assumptions: (1) new POST /api/v1/music-videos/lyrics/manual {audioUrl, text} where text is plain lines; (2) timing: use the forced aligner from JET-323 (vocal stem) if it is available from video-processing-backend; if not, spread lines evenly across detected vocal regions or the window as a first version and say so on the read (aligned:false); (3) creates or replaces the SongReadV1 for that audioUrl with edited:true, keeping any sections/bpm from an existing read; (4) max 400 lines, 120 chars each.

## Plan

1. Endpoint + schema.
2. Alignment via JET-323 aligner, fallback to even spread.
3. Upsert SongReadV1 (and contentHash if present).
4. Test with an instrumental and a failed read.

## Reason

The lyrics check is mandatory in the product; today a failed read silently removes it.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/music/lyricsEditV1.ts, alignment client

## Acceptance criteria

Upload an instrumental, POST 8 typed lines; the next song-read for that audioUrl returns those 8 lines with increasing start times inside the song, and the Lyrics screen shows them.

## Test steps

—

## Thread
2026-11-23T15:47:54+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:51:09+05:30 aquib N: status: open -> approved
2026-11-23T17:11:47+05:30 aquib N: Built, not committed. POST /api/v1/music-videos/lyrics/manual {audioUrl, text, window?}: lines spread evenly (aligned:false) — the JET-323 aligner lives inside video-processing's stitch with no endpoint. Written as the song's sections with manual:true, never re-read over. Only where nothing was heard (409 lyrics_heard otherwise) and never on library tracks (shared audio). Song-read returns them with edited:true, aligned:false. NOT covered: burning typed lines onto the video — video-processing's creator_lines only retimes lines that match a transcript segment; that needs a request to video-processing-backend. TEST: upload an instrumental, POST 8 lines -> 8 lines with increasing starts; song-read returns them; Lyrics screen shows them.
2026-11-23T17:12:31+05:30 aquib N: linked decision D-097 (Typed lyrics are spread evenly, not aligned, and not yet burnt onto the video)
