---
id: D-060
title: Director portraits are served from GCS, not from this backend
date: 2026-11-02
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-235
---

## Context

The three director portraits shipped in assets/directors and were served by GET /api/v1/music-videos/directors/:id/avatar, which read the file off disk on every request. They are immutable 15KB files that every brief screen and every working screen asks for, and that put an image fetch on the same process that runs renders.

## Options considered

1. Leave them on our host. Simple, already works, but it is a file read per card on the process that renders video, and no edge cache.
2. Redirect the route to GCS. Keeps one URL forever, costs an extra round trip per image.
3. Return the GCS URL directly, uploaded by hand when a portrait changes.

## Decision

Option 3. avatarUrlV1 returns the GCS object URL when GCS is configured on the process, and falls back to the existing route when it is not. The route stays and still serves the bytes — it is the dev-machine path and anything already pointing at it keeps working. Objects are published by scripts/upload-director-avatars.ts, run by hand.

## Reason

GCS already holds every clip, still and song this product has ever made; a portrait is the least demanding thing in it. The upload sets immutable with a year max-age, so a phone fetches each one once. Keeping the route as the fallback means a machine with no credentials still draws a face rather than the grey box JET-194 exists to remove.

## Consequences

A redraw needs the script run before it is visible, and the immutable header means a phone that already has the old portrait keeps it until the cache expires — rename the file to publish a redraw the same day. The key is derived from the file shipped in the repo, so the script and the URL builder cannot name different extensions. Mobile sees avatarUrl change host; the field and its contract are unchanged.
