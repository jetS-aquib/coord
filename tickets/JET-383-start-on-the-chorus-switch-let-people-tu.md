---
id: JET-383
title: 'Start on the chorus' switch: let people turn the cold open on or off, before filming and on a finished video
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-11-20T17:38:42+05:30
updated: 2026-11-20T18:20:37+05:30
decisions: 
---

## Request

Some directors (street-pulse, neon-chase) open a video with 4-6s of the first chorus before the song plays from the start (the cold open, JET-349). People should choose. Backend is built (uncommitted on feat/director-rnd): POST …/:id/render takes coldOpen: true|false; POST …/render/:jobId/recut takes coldOpen (with or without cutStyle) to change it on a finished video without re-filming.

## Understanding

Where the switch shows: (1) before filming, when the chosen director's card from GET /directors has coldOpen: true; (2) on the finished-video screen, when GET /:id/detail video.coldOpen.available is true (the director asks, graphics are on, and the chorus sits at least 8s into the window — a window that already opens on the chorus has none). Default = the director's (on). Sending nothing keeps today's behaviour. Changing it on a finished video is a re-cut: the result arrives as a new version you keep or undo, exactly like a pace re-cut (JET-346), and it can be combined with a pace in one request. detail video.coldOpen = { available, on, choice } (choice null = the director's). Assumption: label 'Start on the chorus' with one line 'Opens with a few seconds of the chorus, then plays from the start'.

## Plan

1. Render start: a 'Start on the chorus' switch where the director card says coldOpen: true; send coldOpen only when the person turned it off (or on explicitly).
2. Finished video: the same switch in the re-cut panel when detail video.coldOpen.available; flipping it sends POST …/recut {coldOpen} (plus cutStyle if a pace is picked), then the normal preview / keep / undo.
3. Show the current state from detail video.coldOpen.on.
4. Hide everything when available is false or the field is absent (older backend).

## Reason

A cold open is a strong short-form hook, but it changes how the video starts; the person should decide, not only the director.

## Related files

Render start / direction screen, re-cut panel (JET-346), src/lib/music-videos.ts, src/lib/generation.ts

## Acceptance criteria

With Zoya (street-pulse) on a window that does not start on the chorus: switch off -> the video starts at the window, not on the chorus; on a finished video, turning it off and keeping the re-cut removes the opening chorus; undo brings it back.

## Test steps

1. Backend on feat/director-rnd. Create with Zoya (street-pulse), pick a part of the song that does not start on the chorus.
2. On Ready, a 'Start on chorus' switch shows (not for a director without a cold open). Turn it off and film: the video starts at the window, not on the chorus.
3. On a finished Zoya video, open Versions: tap 'Start from the top'. A new re-cut row ('From the top') stitches; Use this -> no opening chorus.
4. Use the Original again: the chorus opening is back.
5. On a video whose detail says coldOpen.available false (or an older backend), no chorus chip shows.

## Thread
2026-11-20T17:38:42+05:30 aquib N: created ticket, status: - -> open
2026-11-20T18:18:35+05:30 aquib N: status: open -> approved
2026-11-20T18:20:30+05:30 aquib N: status: approved -> in_progress
2026-11-20T18:20:37+05:30 aquib N: status: in_progress -> review — Ready switch for coldOpen directors; Versions tab chip re-cuts with coldOpen
