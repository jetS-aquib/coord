---
id: JET-340
title: The director's pitch and the brief ignore the song window: a 32s hook is pitched as 'the whole romance'
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-17T18:19:30+05:30
updated: 2026-11-17T18:23:32+05:30
decisions: 
---

## Request

When a window is chosen, the brief/pitch (and the director's notes on the call sheet) should talk about that stretch, not the whole song.

## Understanding

JET-328 told the treatment about the window, but the brief (POST /brief, briefV1.ts) is written before render and gets no window, so Rohan's pitch said 'We will tell the whole romance...' for a 32s hook (2:54-3:26). Assumption: mobile can send the chosen trim to /brief (it already holds it for /estimate and /render); absent trim = today's prompt.

## Plan

1. /brief accepts optional trim; briefV1 adds a line that the video is N seconds of the song and focuses on the sections in it.
2. Contract note; mobile sends trim to /brief (one-line change, noted on the UX request).
3. Test: prompt unchanged without trim; window line present with it.

## Reason

The pitch is the first thing that tells the person the director listened; promising a whole story for a 30s clip undercuts it.

## Related files

src/services/render/briefV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

With a 32s window the pitch describes a short piece around that part; without one it reads as today.

## Test steps

—

## Thread
2026-11-17T18:19:30+05:30 aquib N: created ticket, status: - -> open
2026-11-17T18:19:51+05:30 aquib N: Mobile half (send trim to /brief) is item 5 on the UX request just filed to music-jetkreate-mobile.
2026-11-17T18:23:32+05:30 aquib N: status: open -> approved
