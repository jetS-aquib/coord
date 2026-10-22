---
id: JET-194
title: Serve media from the backend's own host so clients never resolve a third-party one
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-22T12:03:00+05:30
updated: 2026-10-22T12:03:00+05:30
decisions: 
---

## Request

Return media URLs — audioUrl, each storyboard clipUrl, and finalVideoUrl — that point at the backend itself, either host-relative ("/media/...") or via a streaming endpoint on the API host, instead of absolute https://storage.googleapis.com/... URLs.

## Understanding

Mobile plays every piece of media by handing a URL straight to the native player. Today those URLs are absolute GCS links, so the device must resolve and reach storage.googleapis.com in addition to the API host. We want the client to need exactly one reachable host: the backend.

Assumptions, each of which I would rather have corrected than guessed:
1. GCS stays the store of record. This is only about how a URL is handed to clients, not about moving bytes.
2. A 302 redirect to GCS would NOT solve it — the client still has to resolve GCS to follow the redirect. So this needs same-host serving or a streaming proxy, which is real work, not a string change.
3. The web client may depend on absolute URLs today, so this probably needs to stay available (a flag, or a second field) rather than being swapped outright.
4. Media is currently public-by-URL. I am not asking to change that; whatever auth applies today is fine.
5. Range requests matter — video seeking and expo-video thumbnail extraction both rely on them, so a proxy has to pass Range through rather than buffer whole files.

Mobile keeps lib/reachable-url.ts working until this lands; nothing breaks in the meantime.

## Plan

1. Pick the shape: host-relative paths served by the API, or a streaming /api/media endpoint. Note that a redirect does not work (assumption 2).
2. Produce that shape wherever media URLs are built — the GCS upload path (publicUrl), generate-clip (clipUrl), assemble-music-video (videoUrl), and the MusicVideo record.
3. Keep absolute URLs reachable for the web client, behind a flag or an extra field.
4. Make sure the chosen route honours HTTP Range, or seeking and thumbnails break.
5. Update the owned contracts: api-music-videos.md, api-video.md, api-ai.md.
6. Mobile follow-up (ours, after this lands): delete or shrink lib/reachable-url.ts and drop the -dns-server note from PLAN.md's Known constraints.
7. Decision record for the contract change, per CLAUDE.md.

## Reason

The device currently has to resolve storage.googleapis.com. When that lookup stalls — emulators that inherit a host resolver, corporate or captive networks, bad transit wifi — it does not fail, it hangs indefinitely, so playback shows no error and reads as a broken player. It is also the reason lib/reachable-url.ts exists on mobile, rewriting hosts the backend emitted, which ROADMAP.md §3 already flags as wanting a real fix. Serving media from the one host the app already talks to removes the whole class of problem.

## Related files

src/modules/musicVideo/musicVideo.controller.ts, src/routes/ai.ts, src/routes/index.ts, wherever publicUrl/clipUrl/finalVideoUrl are constructed, .coord/contracts/api-music-videos.md, .coord/contracts/api-video.md, .coord/contracts/api-ai.md

## Acceptance criteria

A client that can resolve ONLY the backend host can: list its projects, play a completed video, and play any individual clip. No response from /api/music-videos, /api/video/generate-clip or /api/video/assemble-music-video contains an absolute third-party media host, unless an explicit opt-in asks for one. Seeking within a video still works (Range honoured).

## Test steps

1. Point a device or emulator at a DNS that cannot resolve storage.googleapis.com (on an emulator: start it with -dns-server 127.0.0.1).
2. Sign in, open a completed project, press play — the video plays.
3. Scrub to the middle — it seeks rather than restarting.
4. Open a rendering project and tap a finished shot — it plays.
5. curl the three endpoints and grep the responses for storage.googleapis.com — no hits.

## Thread
2026-10-22T12:03:00+05:30 aquib N: created ticket, status: - -> open
