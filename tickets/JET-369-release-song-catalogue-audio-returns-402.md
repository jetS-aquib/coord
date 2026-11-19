---
id: JET-369
title: Release: song catalogue audio returns 402 from the library; the app gets a 0:00 song it can still render
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T13:11:34+05:30
updated: 2026-11-19T13:11:34+05:30
decisions: 
---

## Request

Find out why the music library answers 402 for track audio, and make the failure visible instead of a silent 0:00 song.

## Understanding

GET /api/v1/music-videos/tracks/:id/audio → 502 {'The song library answered 402', code library_unavailable}; some covers 404. Listing and search work. In the app: preview is silent, 'Use this track' sets a 0:00 song with 'We could not hear words or parts', and Continue stays enabled. Assumption: 402 means the library account/plan (subscription or download quota) — an account fix, not code — and needs whoever owns that account. Code side: song-read on a library track whose audio fails should say the library is unavailable, not that the song has no words.

## Plan

1. Check the library account/plan and its download quota (needs the account owner).
2. song-read/track resolution: surface library_unavailable as its own error.
3. Ask mobile (separate request if needed) to show 'This song is not available right now' and block Continue.
4. Decide: ship the catalogue at launch, or hide Browse songs until the account is fixed.

## Reason

—

## Related files

—

## Acceptance criteria

A catalogue track previews and reads (BPM, parts, real length); if the library is down, the user is told and cannot continue.

## Test steps

—

## Thread
2026-11-19T13:11:34+05:30 aquib N: created ticket, status: - -> open
