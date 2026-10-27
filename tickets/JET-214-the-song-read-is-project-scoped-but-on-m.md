---
id: JET-214
title: The song read is project-scoped, but on mobile no project exists until the render starts
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-27T16:50:55+05:30
updated: 2026-10-27T16:50:55+05:30
decisions: 
---

## Request

An audioUrl-scoped song read, exactly parallel to transcript/warm: POST /api/v1/music-videos/song-read with { audioUrl }, returning the same payload as GET /:id/song-read and the same 404 when there is nothing to draw.

## Understanding

JET-213 asks for a screen between upload and the brief that draws the song read, fetched from GET /api/v1/music-videos/:id/song-read. That route takes a project id and looks up mv.audioUrl. On this app there is no project at that point and cannot be: saveProject() posts the storyboard with the project, so the record is created on the working screen, after the planner has run. Between upload and the brief we have an audioUrl and nothing else.

The two ways out, and why we are asking for this one:

1. Create a draft project at upload. That is not a screen addition, it is a flow change - every abandoned upload becomes a row in the Library, and a draft row there taps through to 'finish this render'. We would be inventing projects nobody asked for in order to read a file we already uploaded.
2. Scope the read to the audio instead of the project. songReadV1(audioUrl, userId) already exists and is already exported - your own GET /:id/song-read is a lookup of mv.audioUrl followed by exactly that call. The route is a handful of lines, and transcript/warm set the precedent two tickets ago for 'not project-scoped, because the point is that it is called before a project exists'.

Assumptions, correct any: (1) the cache makes this as cheap as you said on JET-213, so calling it on screen entry is fine; (2) 404 keeps meaning 'nothing to draw' rather than an error; (3) the project-scoped route stays as it is - we will want it later for re-opening a saved project.

## Plan

1. Backend: POST /api/v1/music-videos/song-read, body { audioUrl }, same payload and same 404 as the project-scoped one.
2. Mobile: fetch it after the upload, draw the read between audio and the brief.
3. Nothing about the existing route, the planner or the render changes.

## Reason

Without it JET-213 cannot be built where it was asked for. The data is already computed and already paid for; only the key is wrong for this client.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts; .coord/contracts/api-music-videos.md

## Acceptance criteria

POST /api/v1/music-videos/song-read with an uploaded track's audioUrl returns the same body as the project-scoped route for a project on that track, and 404 for an instrumental. Documented in the contract.

## Test steps

1. Upload a track, then POST /api/v1/music-videos/song-read with its audioUrl and a valid token: the bpm, downbeats, energy and sections payload comes back.
2. The same call for an instrumental returns 404 and nothing else.
3. GET /api/v1/music-videos/:id/song-read on an existing project still answers exactly as it did.

## Thread
2026-10-27T16:50:55+05:30 aquib N: created ticket, status: - -> open
