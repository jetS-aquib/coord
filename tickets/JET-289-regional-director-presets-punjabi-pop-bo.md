---
id: JET-289
title: Regional director presets: Punjabi pop, Bollywood cinematic, devotional, indie Hindi
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:42+05:30
updated: 2026-11-10T22:19:04+05:30
decisions: 
---

## Request

Add directors whose look and rules fit regional genres, so the creator can pick one that knows the music.

## Understanding

Built on the song-context request; a preset is a director whose voice and rules are culture-specific. Assumption: 4 presets to start; the brief suggests one from the song context.

## Plan

Depends on: JET-288.
1. 4 presets in directorsV1.ts with their own voice, look and rules.
2. The brief ranks them using the song context.
3. Mobile picks them up from the existing directors list.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Three directors today (Mira, Dev, Kabir), all genre-neutral, carrying only numbers plus a one-line voice. Competitors (Atlabs) sell regional presets.

## Related files

src/services/render/directorsV1.ts, briefV1.ts

## Acceptance criteria

A Punjabi song's brief offers the Punjabi pop director first, and a render with it looks like the genre.

## Test steps

1. `GET /api/v1/music-videos/directors?audioUrl=<a read Punjabi/Bollywood song>&title=...`: 7 directors, Rohan or Jassi first, `defaultId` is theirs. Again: instant (cached).
2. Same with an English pop song (or no audioUrl): Mira, Dev, Kabir first and `defaultId` stays-close, as before.
3. Render a song under Jassi: the call sheet shows wider, group shots and the log's director line says Jassi; the look is fields/lanes/courtyards with bhangra.
4. Render under Gauri on a devotional track: very few cuts, no deity drawn, devotees and lamps.
5. After JET-303 lands, the app pre-selects the matching director.

## Thread
2026-11-10T01:57:42+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:28:12+05:30 aquib N: status: open -> approved
2026-11-10T22:19:03+05:30 aquib N: status: approved -> in_progress
2026-11-10T22:19:03+05:30 aquib N: Built: 4 regional directors (punjabi-pop Jassi, bollywood Rohan, devotional Gauri, indie-hindi Neel), each with its own arithmetic (passes the 'every pair differs in 2 of cuts/split/sizes' test) and a voice; rankDirectorsV1 orders them by the song context's new genre field (genre beats place). Song context is now cached on the song read (asked when the director screen opens, reused by the render, so the render no longer waits ~5s for it; it no longer includes the creator's direction, which is in every prompt anyway). GET /directors?audioUrl=&title= ranks and pre-selects. Live: Zaaya/Oye Hoye -> Neel; Lutt Putt Gaya (a Dunki film song set in Punjab) -> Rohan then Jassi. Mobile half: JET-303 (pass the song). Art for the 4 is still missing (monograms meanwhile).
2026-11-10T22:19:04+05:30 aquib N: status: in_progress -> review — Regional directors + per-song ranking built and checked live; mobile half is JET-303.
