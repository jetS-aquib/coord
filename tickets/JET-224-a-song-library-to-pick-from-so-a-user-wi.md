---
id: JET-224
title: A song library to pick from, so a user with no MP3 has something to render
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-10-30T11:55:48+05:30
updated: 2026-10-30T11:59:05+05:30
decisions: 
---

## Request

A browse-and-search screen offered alongside 'upload a song': a licensed library the user can search, preview and pick a track from. Picking one sets the project's audio the same way an upload does, and everything after it is unchanged. Backend will expose search, browse and preview over a v1 route and hand back a track id; the audio URL is resolved server-side at render time and is never something the client stores.

## Understanding

Batch 8B, planned in the Render Pipeline Delivery Plan. Independent of Batch 8 and of everything in 6-10, so it can be taken whenever suits you.

WHY NOT SPOTIFY OR YOUTUBE, since it will be asked. Spotify's API does not serve audio files at all — 30-second previews at most, and the terms forbid this use. YouTube extraction is against its terms. A licensed production-music library is not a stopgap, it is the only one of the three that works, and it answers a question the other two cannot: a generated video over a commercial track cannot be distributed, and if the promise is 'hand us a song and leave', the output has to be shareable.

MEASURED AGAINST THE LIVE API, so you are not designing against a guess:
 - 96 of 100 tracks have NO vocals. Everything Batch 6 and 7 bought is lyric-driven — the cast written from the song's words, the lyric lines under each shot, the hook detector. On an instrumental all of it is inert. So THE LIBRARY IS VOCALS-ONLY and that is not a user-facing toggle. Please do not add a filter for it.
 - The vocals-only catalogue is median 3:02, and genre-wise 40% Beats, 31% Pop, 28% Hip Hop, 17% Trap.
 - Tracks carry title, artists, BPM, length, genres, moods and cover art, so the cards have real material.
 - The download URL is signed and expires in about a day. The client should hold a track ID and never a URL.

ASSUMPTIONS, correct any:
 - Upload stays the primary path and this sits beside it, not instead of it. Our target languages are Hindi, English and Bhojpuri, and this library is Western production music — it is a cold-start answer for English, not a replacement for upload.
 - Preview playback is a short stream in the picker; you do not need the full file.
 - Search is a single text field plus maybe genre chips. No mood/BPM/length filter panel in v1 unless you want one.
 - A picked track behaves exactly like an upload from the brief screen onwards, so nothing downstream of the picker changes on your side.
 - Short tracks are more common here than with uploads, so a 2-minute render is a real case on this path.

## Plan

1. File this and build the backend half.
2. 8B.1 first and it lands regardless of this feature: our transcript and song-read caches are keyed on the audio URL, and a signed URL that changes every call would make both miss and re-pay Whisper on every render. Moving to a stable key also means two users picking the same track share one transcript and one read.
3. Then the search, browse and preview route, and the track id on project create.
4. Send you the route shapes; nothing on your side is blocked until then — the picker can be built against a fixed sample.
5. Entitlement is a people problem, not ours: every track on the current key is preview-only and low-quality audio. Fine to prototype on, needs an agreement before it is a product.

## Reason

'Upload an MP3' is a cold start and most people do not have one to hand. This is the cheapest way to let somebody see what the product does on their first open, and the rights story is better than any route through a consumer streaming service.

## Related files

mobile: app/(create)/library.tsx (new), app/(create)/audio.tsx, lib/generation.ts; backend: services/music/epidemicV1.ts, musicVideoV1.routes.ts, models/TranscriptV1.ts, models/SongReadV1.ts

## Acceptance criteria

A user with no file of their own opens the app, browses or searches, previews a track, picks it, and reaches the same brief an upload would reach. Every track offered has vocals. The second render of the same track is a cache hit on both the transcript and the song read.

## Test steps

—

## Thread
2026-10-30T11:55:48+05:30 aquib N: created ticket, status: - -> open
2026-10-30T11:59:05+05:30 aquib N: status: open -> approved
