---
id: D-049
title: A library track is an upload: one stable backend-hosted audioUrl, not a trackId everywhere
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-226
---

## Context

Batch 8B, and a cross-repo contract agreed on the JET-226 thread before either side built it. The filed ask was that transcript/warm, song-read, brief and the project upsert all accept a trackId as an alternative to an audioUrl, because mobile holds a track id and never an audio URL — Epidemic's download URL is signed and expires in about a day. Mobile then traced what that touches and withdrew asks 2 and 3 themselves: POST /api/video/music-storyboard is on the do-not-touch list and takes an audioUrl, so trackId everywhere was either a v0 edit nobody wants or a library track that cannot be storyboarded, which fails the ticket's own acceptance criteria. 8B.1 separately asked for a stable audioKey because TranscriptV1 and SongReadV1 are both keyed on audioUrl and a signed URL misses both caches on every call, re-paying Whisper at 169s cold.

## Options considered

1. trackId as an alternative parameter on all four, as filed. Four endpoints change, mobile carries two shapes everywhere, and the v0 storyboard route still cannot take a library track. 2. A stable backend-hosted audioUrl per track, which 302-redirects to the freshly signed Epidemic URL. Nothing downstream changes at all. 3. The same stable URL, but this backend streams the bytes through rather than redirecting. 4. The same stable URL, with the redirect used by devices only and the signed URL substituted server-side before any call that leaves this service.

## Decision

Option 4, and it is three rules rather than one. The track list carries audioUrl = <backend>/api/v1/music-videos/tracks/<id>/audio, a string that never changes, and mobile sends it everywhere it sends an upload URL today — same storyboard call, same song-read, same brief, same transcript/warm, same project upsert, none of them changed and no trackId plumbing on either side. coverUrl and previewUrl are STREAMED through this backend, Range passed through, never redirected. And anything handed to video-processing-backend is a freshly resolved Epidemic URL substituted here, so no third service ever follows our redirect or has to reach our host.

## Reason

The caches are keyed on the string mobile holds, and that string is now stable by construction, so 8B.1's goal is reached with no schema change and no audioKey field — the cheapest version of a row that was planned as a migration. The split between redirecting and streaming is not fussiness: JET-194 assumption 2 says in mobile's own words that a 302 does not solve the problem, because the client still has to resolve the third-party host to follow it. That is exactly true of a cover and a preview, which a phone fetches, and exactly false of the audio, which only this backend and video-processing fetch. Substituting server-side rather than making them follow a redirect removes a cross-repo dependency that would have needed a ticket and could not have been verified today — their HTTP client's redirect behaviour is not in contracts/video-transcription.md and their network's reachability of our host is a deployment fact, not an API one. It also means the whole feature needs nothing from another repo.

## Consequences

Mobile builds its picker against a shape that is strictly less code than the one it filed, and degrades to the filed version if this is ever reversed. The audio route is unauthenticated by construction, because an upload URL is and a track id is guessable — for a prototype key that is the right trade and it matches how media already works here (JET-194 assumption 4), but it is an entitlement question before it is a security one and 8B.6 is where it gets answered. Nothing in this decision is built yet: there is no Epidemic API key in .env on this machine, so not one real track has been listed and every route would be shaped against the documented API and verified against nothing — which is how all four bugs found in Batch 7 and 7B were invisible to unit tests. The shape is agreed and frozen so mobile is not blocked; the code waits for the key.
