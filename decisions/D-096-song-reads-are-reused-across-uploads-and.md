---
id: D-096
title: Song reads are reused across uploads, and across users, by a hash of the audio bytes
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-386
---

## Context

Every upload gets a new URL, so the same song uploaded again was transcribed again (~90s, a Whisper run).

## Options considered

Trust a hash sent by the app; hash server-side in local-upload; no reuse

## Decision

local-upload hashes the bytes itself and stores the hash on a placeholder SongReadV1. sharedSongReadV1 copies a fresh read with the same hash, edits included, to the new URL. This works across users.

## Reason

A read comes from the audio and is not personal. Lyric edits are keyed per userId, so copying them shows nobody's corrections to anyone else. A hash from the app is never trusted: a forged hash could plant another song's read on a shared library URL.

## Consequences

Two uploads read at the same moment still both transcribe (no in-flight join by hash yet). Placeholder rows exist for audio that is never read.
