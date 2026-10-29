---
id: D-038
title: A stored song read carries the generation that wrote it, and a mismatch re-reads
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-219
---

## Context

SongReadV1 is keyed on audioUrl with no TTL and no version. video-processing's own cache is keyed on sha256(audio bytes) + READ_VERSION + app_version, so when JET-215 changed sectioning and bumped READ_VERSION to 2, THEIR cache invalidated itself correctly and ours did not. Eight stored rows written by the old code kept being served, three renders ran on pre-JET-215 sections, and nobody noticed for two days — it was spotted by eye, from a 200.9-second 'verse' in a plan audit. The only remedy available at the time was a hand-run Mongo delete.

## Options considered

1. Delete the stale rows by hand now and move on. 2. Put a TTL on our store and refetch when a row is older than N. 3. Drop our store entirely and let their 24h byte-keyed cache be the cache. 4. Carry a generation number on every row that we own and bump in version control, refetching on mismatch. 5. Wait for them to return their version and key off that alone.

## Decision

Option 4, with option 5 added on top as observability. SONG_READ_CACHE_V1 is an integer constant in renderOrchestratorV1.ts, written onto every row as cacheVersion; songReadIsFreshV1 is a pure predicate that serves a row only when the two match and is unit-tested without a database. A row written before the field existed has no value and therefore reads stale, so the eight bad rows re-read themselves on next use and nothing is deleted. JET-219 asks them to return read_version; we store it and log a warning when a refetch comes back with a different one than we held, which is detection rather than mechanism. A refetch that FAILS now serves the stale row rather than returning null, because cutting to slightly wrong sections beats falling back to a ten-second grid.

## Reason

A TTL is the wrong instrument: their answer is a pure function of the audio's bytes and their algorithm version, and a bucket URL here is written once and never rewritten, so a stored read does not go off with time — it goes off when they change. A TTL would re-ask for no reason and still miss the change for up to a day. Dropping our store puts a call on every plan, re-plan and screen, which is the thing the store was added to prevent. Deleting by hand is what we just did and is exactly the failure being fixed: invisible state that depends on somebody remembering. A number in version control is reviewed, deploys with the code, and leaves a reason in the file. It still needs a human to bump it, which is why JET-219 exists — but a missed bump then produces a log line on the next render instead of silence.

## Consequences

Every stored read is re-fetched once after this deploys, which costs one call per song; their cache absorbs it where their version has not moved. Anyone changing what we store from the read, or landing a change of theirs, bumps SONG_READ_CACHE_V1 in the same commit — the constant carries a changelog comment for that reason. TranscriptV1 has the identical shape of bug (keyed on audioUrl, no version) and is deliberately NOT fixed here: the transcript is words rather than structure, a model change degrades it rather than reshaping the video, and the same pattern applies the day it matters. The fix does not make a stale read impossible, only visible.
