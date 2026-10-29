---
id: JET-219
title: Return read_version on the song read, so a caller holding a stored one can tell it has gone off
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-10-29T15:48:16+05:30
updated: 2026-10-29T15:48:36+05:30
decisions: D-038
---

## Request

Add one field to the /api/v1/song-read response: read_version, the same READ_VERSION string that already goes into your cache key. Additive, no behaviour change, no request change. Same for the transcript endpoint if it is as cheap there.

## Understanding

JET-215 changed sectioning and bumped READ_VERSION from 1 to 2, which correctly invalidated YOUR cache — your key is sha256(bytes) + READ_VERSION + app_version, so the old entries became unreachable the moment the new code loaded. That half worked exactly as designed.

Ours did not, and it was our bug. We store the read in Mongo keyed on audioUrl with no TTL and no version, so eight rows written by your old code were served forever and three renders ran on pre-JET-215 sections without anything saying so. We noticed two days later, by eye, from a 200.9-second verse in a plan.

We have fixed our half already and it needs nothing from you: we now carry our own SONG_READ_CACHE_V1 generation number on every stored row and refetch when it does not match, so the fix is a reviewed line in a commit instead of a hand-run delete. The eight stale rows re-read themselves on next use.

WHAT IS STILL MISSING is the part only you can give us. Our constant has to be bumped BY HAND when yours changes, which means the safety depends on whoever writes the next read-algorithm change remembering to tell us. That is the same class of failure one level up. If the response carries read_version, we store it, and the first refetch that comes back with a different value logs a warning naming both — so a mismatch announces itself on the next render instead of being inferred from a video that came out wrong.

ASSUMPTIONS, correct us rather than build around them:
 - READ_VERSION is already a module constant in app/services/song_read.py and already in the cache key, so this is plumbing it into the response model and nothing else.
 - You do NOT need to promise it is monotonic, or semver, or stable across deploys. We compare it for equality only; any string that changes when the algorithm changes is enough.
 - app_version is also in your key, so strictly the pair identifies the answer. If you would rather return the whole cache key, or both values, that is fine — we will compare whatever single string you give us.
 - We are NOT asking you to version the contract or to keep old behaviour available. A changed read is the right outcome; we only want to know it changed.
 - Our field is already in place and optional (read_version?: string), so your change lands without needing ours to go first.

## Plan

1. File this. Our half is built and committed, so nothing of ours is blocked and the eight stale rows already heal.
2. When this lands, store it alongside and let the mismatch warning do its job. No bump of our constant is needed for this ticket itself — the field is observability, the refetch is already driven by our own number.
3. Bump SONG_READ_CACHE_V1 in the same commit as any future change of yours we are told about, and let the warning catch the ones we are not.

## Reason

This cost us three renders on stale sections and two days of not knowing. Our side is fixed, but it is fixed by a constant a human has to remember to bump; one string in your response turns a silent wrong answer into a log line on the next render.

## Related files

video-processing-backend: app/schemas/song_read.py (SongReadResponse), app/api/v1/routes/song_read.py. Ours, already done: src/models/SongReadV1.ts, src/services/render/renderOrchestratorV1.ts (songReadV1, SONG_READ_CACHE_V1), src/modules/video/video-api.service.ts

## Acceptance criteria

A call to /api/v1/song-read returns read_version alongside the existing fields, and its value changes when READ_VERSION changes. A cached response returns the same value as a fresh one. Existing callers that ignore the field are unaffected, and the contract in .coord/contracts/video-song-read.md records it.

## Test steps

—

## Thread
2026-10-29T15:48:16+05:30 aquib N: created ticket, status: - -> open
2026-10-29T15:48:36+05:30 aquib N: linked decision D-038 (A stored song read carries the generation that wrote it, and a mismatch re-reads)
