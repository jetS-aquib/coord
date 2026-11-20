---
id: JET-381
title: Library card shows the song's length (5:15) instead of the video's (0:35): use videoDurationSeconds
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-20T16:50:30+05:30
updated: 2026-11-20T16:57:09+05:30
decisions: 
---

## Request

The home/library card shows duration(video.totalSongDuration) (src/components/video-poster.tsx:70). That is the whole song, so a 35s Hook render of a 5:15 song reads 5:15 on its card and 0:35 in the player. GET /api/music-videos now returns videoDurationSeconds per project (backend, uncommitted on feat/director-rnd).

## Understanding

Card shows videoDurationSeconds when present, else totalSongDuration (projects with no finished render, and a backend without the field). Assumptions: the video screen header already reads /detail video.durationSeconds, the same number, so only the card changes; the player's own duration can still differ by up to ~2s on the old plain stitch (crossfades), which EDIT_V2 renders do not have.

## Plan

1. MusicVideo type in src/lib/music-videos.ts: videoDurationSeconds?: number.
2. video-poster.tsx:70: duration(video.videoDurationSeconds ?? video.totalSongDuration).
3. Check: the P0 Draft card reads 0:37, the P0 Standard 9:16 card 0:30.

## Reason

The card lies about what you made; totalSongDuration is also stale on some older projects (Ashke: 72.5 stored, song is 218s).

## Related files

src/lib/music-videos.ts, src/components/video-poster.tsx

## Acceptance criteria

A Hook render's card shows ~0:30, not the song's length.

## Test steps

—

## Thread
2026-11-20T16:50:30+05:30 aquib N: created ticket, status: - -> open
2026-11-20T16:57:09+05:30 aquib N: status: open -> approved
