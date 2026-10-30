---
id: D-050
title: Library audio, cover art and director avatars are served unauthenticated, from the request's own origin
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-226
---

## Context

Batch 8B, implementing D-049. Three new media routes exist: a track's audio, a track's cover and a director's avatar. All three are fetched by the DEVICE rather than by our own code — expo-audio opens the audio with Range requests and an <Image> fetches the other two. The whole v1 surface sits behind requireAuth plus requireSignature, and /api/video/download is already mounted outside that with the note that browser navigations do not carry JWT headers. Separately, the first implementation minted all three URLs from BACKEND_URL, which on a dev machine is http://localhost:5006.

## Options considered

1. Leave the media behind auth and have mobile attach a JWT and a request signature to every media fetch. 2. Mint a short-lived signed URL of our own per track and keep the routes public but unguessable. 3. Mount the three media routes outside the auth chain, the same posture as /api/video/download and as an uploaded GCS object. 4. Keep BACKEND_URL as the host for the URLs, and document that it must be set to a LAN address during development.

## Decision

Option 3 for the auth, and the request's own origin for the host. The three routes move to a separate  mounted ahead of the protected mount with no middleware. Each URL is built from the x-forwarded-host or Host the client actually used, falling back to BACKEND_URL only for a caller with no request in hand. The cover route additionally carries the release uuid as a query parameter and validates it as a uuid, so it reads nothing from server memory and cannot be pointed at any host but the Epidemic CDN.

## Reason

A player cannot sign a request. expo-audio will not play a URL it has to HMAC and an <Image> sends no headers at all, so option 1 is not a stricter version of this decision, it is a picker with no sound and no pictures — and discovering that from a device is expensive. Option 2 buys unguessability we do not have anywhere else: an uploaded song is already public-by-URL in a GCS bucket, which is the posture JET-194 assumption 4 records and explicitly does not ask to change, so signing the LIBRARY's audio while the user's own song sits open would be security theatre with a cache-busting side effect. What is actually exposed is a preview-quality lqmp3 of a licensed catalogue to anyone who can guess a uuid, and that is 8B.6's entitlement question rather than a vulnerability — it is marked in the code so it is answered rather than inherited. On the host: BACKEND_URL is per-machine configuration that is wrong by default, and getting it wrong hands a phone three URLs it can never load, which is precisely the grey-box failure JET-194 exists to remove, arriving from the other end. Reading the origin off the request makes a LAN address, a tunnel and production all correct with nothing to configure, and the Host header is only ever echoed back to the client that sent it.

## Consequences

Anyone who can reach the API can stream a preview track or a cover without an account, and the audit log will not know who. Acceptable while the catalogue is preview-only on a prototype key, and the thing to revisit the day a real agreement exists — 8B.6. The cover route holds no state, which was a deliberate second attempt: the first version cached the release uuid in an in-process Map at list time, which works on a laptop and would have blanked roughly every other card in production, because the instance that serves the list is not the instance that serves the image. That failure is invisible locally and is the reason the uuid travels in the URL. Measured over 100 vocal tracks, 100 of 100 cover URLs follow one template, so rebuilding the address from a uuid is sound rather than lucky; if that ever stops being true the route 404s and a card draws its own placeholder. Origin-derived URLs mean a track's audioUrl is not byte-identical between a project saved from a phone and the same project opened from a terminal — which is why the track id is parsed out of the PATH and never matched on the host, and why the caches keyed on that URL would see two keys for one track across two hosts. That is one extra transcript in development and never in production, where there is one host.
