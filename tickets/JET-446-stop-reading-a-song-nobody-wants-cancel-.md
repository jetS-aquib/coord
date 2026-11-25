---
id: JET-446
title: Stop reading a song nobody wants: cancel route, stop the 60s re-asks, and tell the video service to cancel
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-25T17:21:51+05:30
updated: 2026-11-25T17:21:51+05:30
decisions: 
---

## Request

When the user abandons a song before its read finishes, stop the read end to end: Node stops re-asking the video service and asks it to cancel, unless someone else still wants that song.

## Understanding

Three parts. (1) New route POST /api/v1/music-videos/song-read/cancel {audioUrl} for the app. (2) Interest tracking for readsInFlight (musicVideoV1.routes.ts songReadOrPendingV1): a read is wanted while any user has asked for it in the last ~2 min (the app polls every 5s) or any render is awaiting it (renderOrchestratorV1 sharedSongReadV1 / warm-up). The cancel route drops the caller's interest; an idle read with no interest left for ~2 min is dropped too, which covers an app that was killed. (3) When the last interest goes, abort the postWithCallback loop for that audio (an AbortSignal through lyricTranscription/songRead) and call the video service's new POST /api/v1/song-read/cancel (video-processing-backend request). Reads shared across users by content hash (D-096) are cancelled only when no user and no render wants them. Assumption: a render that starts later for the same song simply starts a fresh read.

## Plan

1. AbortSignal through postWithCallback, lyricTranscription(), songRead()
2. readsInFlight entry gains {controller, interest: Map<userId, lastSeen>, renders: n}
3. POST /song-read/cancel route; idle sweep every 30s
4. On last interest gone: abort + videoApi.cancelSongRead(audioUrl)
5. Tests: cancel with another user waiting does not cancel; render-held read is never cancelled; idle read dropped after the window

## Reason

Today postWithCallback re-POSTs every 60s for up to 20 min whether or not anyone is waiting, and the video service keeps the abandoned song in its one-at-a-time Demucs queue, so the user's next song waits behind it.

## Related files

src/modules/video/video-api.service.ts,src/modules/musicVideo/musicVideoV1.routes.ts,src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

After the app cancels (or stops polling for ~2 min), Node logs no further POSTs for that audio and the video service logs a cancel; a read another user or a render still wants keeps running.

## Test steps

1. Upload song A in the app, wait 30s, go back and upload song B. 2. Node logs: no more /lyric-transcription or /song-read POSTs for A; one POST /api/v1/song-read/cancel. 3. B's lyrics arrive in about its own time.

## Thread
2026-11-25T17:21:51+05:30 aquib N: created ticket, status: - -> open
2026-11-25T17:21:58+05:30 aquib N: Depends on JET-445 (the video service's POST /api/v1/song-read/cancel). JET-447 (mobile) calls this request's route.
