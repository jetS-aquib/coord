---
id: JET-447
title: Tell the server when a song is abandoned: cancel the old song's read on back-out or when a new upload replaces it
from: video-processing-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-25T17:21:54+05:30
updated: 2026-11-25T17:21:54+05:30
decisions: 
---

## Request

When a user leaves the audio step while lyrics are still being read, or uploads a different song, tell the server the old song is no longer wanted so its read stops.

## Understanding

In src/app/(create)/audio.tsx: when the screen unmounts or the user navigates back while the read is still pending (state reading_lyrics), and when a new upload replaces audioUrl, fire-and-forget POST /api/v1/music-videos/song-read/cancel {audioUrl: old} (route from the music-jetkreate-backend request). Do not cancel when the user moves FORWARD with the song (Continue), since the next steps need the read. Also stop the untilRead polling for the old song (its AbortSignal). Best effort only: if the call fails or the app is killed, the server's idle timeout covers it. Assumption: one create flow holds one song at a time.

## Plan

1. generation.ts: cancelSongRead(audioUrl) fire-and-forget
2. audio.tsx: on back-out / unmount with a pending read, and on replacing audioUrl, cancel the previous one; abort its polling
3. Never on Continue
4. Test on device: back out mid-read, upload another song

## Reason

The server keeps reading an abandoned song for up to 20 minutes, and the user's next song waits behind it. Only the app knows the song was abandoned.

## Related files

src/lib/generation.ts,src/app/(create)/audio.tsx

## Acceptance criteria

Backing out mid-read or uploading a different song sends one cancel for the old audioUrl and none on Continue; the new song's lyrics arrive in about its own time.

## Test steps

1. Upload song A, wait until 'Listening to…' shows. 2. Go back, pick and upload song B. 3. Server logs show a cancel for A; B's lyrics finish without waiting for A. 4. Upload a song and press Continue once read: no cancel is sent.

## Thread
2026-11-25T17:21:54+05:30 aquib N: created ticket, status: - -> open
