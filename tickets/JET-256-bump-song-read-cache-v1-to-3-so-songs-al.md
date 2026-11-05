---
id: JET-256
title: Bump SONG_READ_CACHE_V1 to 3, so songs already read get the Gemini sections that no longer drop a verse
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-05T18:42:24+05:30
updated: 2026-11-05T18:42:54+05:30
decisions: D-073
---

## Request

Change SONG_READ_CACHE_V1 from 2 to 3 in src/services/render/renderOrchestratorV1.ts and add a line to its version list: '3  video service READ_VERSION 3: Gemini reads the vocal stem as well as the mix, so lyrics no longer drop whole verses'.

## Understanding

One constant and one comment line, no behaviour change beyond re-reading stored songs once. Assumptions: (1) isFresh compares stored.cacheVersion === SONG_READ_CACHE_V1 (line ~3092), so the bump makes every stored row stale exactly once and the next render re-reads it; (2) a re-read costs one POST /api/v1/song-read per song, which now also runs Demucs on the video service (about 55s on a Mac, more on the 2-vCPU server) the first time; (3) TranscriptV1 refreshes on its own because the video service's transcript cache key changed.

## Plan

1. SONG_READ_CACHE_V1 = 3 in renderOrchestratorV1.ts.
2. Add the '3' line to the version list in the comment above it.
3. Deploy after (or with) the video-processing-backend change; before it, a re-read would just store the old version-2 sections again.

## Reason

The video service's Gemini transcription was dropping whole sung stretches: 'Stay With Me' (songreadv1 6aec642b805512547917eda0) lost a verse at 31-59s, and on some calls returned 12 words for the whole song. Fixed in video-processing-backend by sending the Demucs vocal stem alongside the mix and merging (242 or 12 words -> 333, stable). Its song-read READ_VERSION is now 3 and its transcript cache key moved. SongReadV1 rows already stored are only re-read when SONG_READ_CACHE_V1 moves, so without this bump those songs keep the sections made from the bad transcript, and the JET-219 check will warn 'their song read moved from version 2 to 3' on every render. TranscriptV1 needs nothing: it is rewritten each time a render fetches the transcript.

## Related files

src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Rendering 'Stay With Me' again logs 'stored song read is generation 2... reading the song again' once, and the new SongReadV1 row has readVersion '3' and a line starting near 31.4s ('I was so crazy all the time...').

## Test steps

—

## Thread
2026-11-05T18:42:24+05:30 aquib N: created ticket, status: - -> open
2026-11-05T18:42:54+05:30 aquib N: linked decision D-073 (Gemini transcribes the mix AND the Demucs vocal stem, and merges them, instead of the mix alone)
