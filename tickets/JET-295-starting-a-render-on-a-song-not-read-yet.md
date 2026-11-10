---
id: JET-295
title: Starting a render on a song not read yet now answers 202 reading_lyrics: wait and ask again instead of treating it as a render
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-10T14:33:41+05:30
updated: 2026-11-10T14:33:41+05:30
decisions: 
---

## Request

When POST /api/v1/music-videos/:id/render answers 202 { status: 'reading_lyrics', message } (no jobId), show the message and ask again every few seconds, exactly as brief and song-read already do, until a real render state comes back.

## Understanding

Reuse untilRead() and stillReading() (generation.ts:946-975) around the POST in startRender, passing an onWaiting callback so the working screen can say() the message. Assumption: asking again with the same body is safe; the server starts no render while it answers reading_lyrics, and a second POST that does start one is the normal path. Distinguish by the body's status (reading_lyrics) or the missing jobId.

## Plan

1. startRender: wrap the api() call in untilRead(..., onWaiting, signal); add an optional onWaiting parameter.
2. working/[id].tsx: pass onWaiting that calls say('Listening to your song', message).
3. Leave the 409 re-attach path as it is.

## Reason

JET-279 (committed b4cabd5): render start used to wait on a new song's read with no limit, so the load balancer could cut it at 30s. It now answers reading_lyrics after 20s like the other routes (JET-258, D-074). startRender in src/lib/generation.ts:539 hands any 2xx body to normaliseRender, so today this body would be taken as a render with jobId undefined and the working screen ([id].tsx:297) would poll /render/undefined. Rare in practice (brief and Ready usually read the song first), but it is a dead end when it happens.

## Related files

src/lib/generation.ts, src/app/(create)/working/[id].tsx

## Acceptance criteria

Starting a render on a song never read before shows the listening message, then carries on into the render once the read finishes; no request to /render/undefined is ever made.

## Test steps

—

## Thread
2026-11-10T14:33:41+05:30 aquib N: created ticket, status: - -> open
