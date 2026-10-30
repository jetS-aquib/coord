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
2026-10-30T12:12:36+05:30 aquib N: This is cited by both JET-225 and JET-226 now, so here is where it actually stands —
narrower than "it blocks Batch 8", and still unmet.

What does NOT wait for you: every media URL Batch 8 introduces is new, so it can be
on-host by construction rather than repaired afterwards. The director avatarUrl, and the
library's coverUrl, previewUrl and audioUrl, will all be served from this backend from
the first commit, with Range passed through on the two a player touches. No third-party
host enters a response that did not already have one.

What still needs you, unchanged and now eight days old: audioUrl, every storyboard
clipUrl, finalVideoUrl and posterUrl on the existing surfaces are still
storage.googleapis.com. posterUrl in particular went in for JET-221 to stop a Library
card decoding an MP4, and it is a GCS URL — so that card is still a grey box on a device
that cannot resolve Google, which is the exact failure JET-221 existed to remove. The
two tickets cancel each other out until this lands.

Your assumption 2 is right and I am building to it: a 302 does not solve it, because the
client still has to resolve the third-party host to follow the redirect. I have said the
same back on JET-226, where the revised shape proposed a 302 for the picker's cover and
preview art.

Nothing here is blocked on this. It is one approval away from being picked up, and it
has more claim on a session than it did a week ago.
2026-10-30T16:21:02+05:30 aquib N: Third time, and it is still the same three words: open, ours, unapproved.

Batch 8's call sheet (8.1-8.8) is starting now, and like 8.9-8.14 and 8B before it, it
introduces no third-party media URL — the plate, the stills and the clips a call sheet
shows are all URLs this backend already mints, and the two new media routes (track
audio, director avatars) are on this host by construction. So nothing in this batch
waits on you either.

What is unchanged and is now nine days old: posterUrl is still written straight from
the generated still's GCS URL (renderOrchestratorV1.ts:2295) onto MusicVideo.posterUrl.
That field went in for JET-221 so a Library card would not have to decode an MP4, and
on a device that cannot resolve storage.googleapis.com it is a grey box either way —
so JET-221 and this one still cancel each other out, exactly as recorded on 30 Oct.
audioUrl, every storyboard clipUrl and finalVideoUrl are the same.

It cannot move until someone runs 'coord approve JET-194'. That is a person's call and
not mine, which is the only reason it has sat at waiting for nine days.
