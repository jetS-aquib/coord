---
id: JET-305
title: Warm the song's context when its read finishes, so GET /directors answers instantly with the right director first
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-11T00:00:37+05:30
updated: 2026-11-11T00:20:13+05:30
decisions: 
---

## Request

As soon as a song read completes (song-read or transcript warm), also work out and cache songContextForAudioV1 for that audio, the way transcript/warm does for the transcript. Then GET /directors?audioUrl= finds the context already cached and ranks without waiting.

## Understanding

Today the first GET /directors for a song runs songContextForAudioV1 inside the request and waits up to 8s (musicVideoV1.routes.ts), then falls back to the plain order and stays-close. The app now fetches the ranking as soon as the read settles, but on a new song that still means up to 8s before the picker can show the right director first, and a newcomer waits on a placeholder. Assumptions: (1) songContextForAudioV1 caches per audio so a warm makes the later call instant; (2) running it right after the read costs one extra model call per new song, which the render would make anyway at casting; (3) a failed warm must be silent and the request path stays as it is, as the fallback.

## Plan

1. After sharedSongReadV1 stores a read with sections, start songContextForAudioV1 for that audio in the background (not awaited, errors logged).
2. Join an in-flight warm instead of starting a second one, as readsInFlight does for the read.
3. Leave GET /directors as is: with a warm cache it answers at once; without, the 8s cap still applies.
4. Contract note: directors with audioUrl is normally instant once the song has been read.

## Reason

A creator picking a regional song should see the matching director first with no wait; now that wait is up to 8s on every new song.

## Related files

src/services/render/renderOrchestratorV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

On a song just read, GET /directors?audioUrl=... answers in well under a second with the matched director first and as defaultId; a song never read still gets the plain order.

## Test steps

1. In the app, pick a Punjabi or Bollywood song that has never been used, and wait for the lyrics/song read to finish.
2. Wait about 5 seconds, then open the director screen: it shows at once, with Jassi or Rohan first and selected (no 8s wait).
3. Open it again for the same song: still instant, same order.
4. Pick an English pop song: Mira, Dev and Kabir come first, as before.

## Thread
2026-11-11T00:00:37+05:30 aquib N: created ticket, status: - -> open
2026-11-11T00:18:13+05:30 aquib N: status: open -> approved
2026-11-11T00:20:13+05:30 aquib N: Built. sharedSongReadV1 (the one place a read is stored) starts the context call in the background after a new read, and also for a stored read with no context yet (reads from before JET-289). Not awaited: read returned in 6ms, context cached ~5s later, then the directors ranking took 2ms (Lutt Putt Gaya -> bollywood). songContextForAudioV1 now shares one in-flight call per song, so the warm, the director screen and a render never ask twice. A failed call is not stored and is asked again next time; any real answer is stored, even one with no region.
2026-11-11T00:20:13+05:30 aquib N: status: approved -> in_progress
2026-11-11T00:20:13+05:30 aquib N: status: in_progress -> review
