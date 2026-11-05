---
id: JET-258
title: Handle 202 reading_lyrics from song-read and brief: show a waiting message and ask again
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-06T02:31:26+05:30
updated: 2026-11-06T02:31:43+05:30
decisions: 
---

## Request

POST /api/v1/music-videos/song-read, GET /:id/song-read and POST /brief now answer 202 {status:'reading_lyrics', message} when a new song's read takes over 20s (JET-257, D-074). Show the message and poll again every few seconds until a 200 (or 404 for an instrumental).

## Understanding

Assumes mobile treats any non-200 from these routes as 'no song read' today, so a 202 would silently skip the sections. Assumes polling the same route is the right way to ask again. I have not read the mobile code.

## Plan

1. Treat 202 from song-read and brief as 'still reading'. 2. Show the returned message. 3. Re-request every ~5s until 200 or 404. 4. Keep the existing 404 behaviour.

## Reason

New songs take minutes to read; the load balancer cuts requests at 30s, so the backend answers 202 instead of holding the request. The app currently has no handling for 202 here.

## Related files

—

## Acceptance criteria

Upload a never-seen song: the app shows the waiting message, then the sections, with no error.

## Test steps

—

## Thread
2026-11-06T02:31:26+05:30 aquib N: created ticket, status: - -> open
2026-11-06T02:31:43+05:30 aquib N: status: open -> approved
