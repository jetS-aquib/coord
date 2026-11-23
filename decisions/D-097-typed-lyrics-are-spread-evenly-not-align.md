---
id: D-097
title: Typed lyrics are spread evenly, not aligned, and not yet burnt onto the video
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-392
---

## Context

JET-392 wants typed lyrics where the read failed or heard no words. The JET-323 forced aligner runs inside video-processing's stitch and has no endpoint.

## Options considered

Wait for an aligner endpoint; spread lines evenly now and mark them aligned:false

## Decision

Spread lines evenly across the window or the song. Write them as the song's sections with manual:true, never re-read over. Only allowed where nothing was heard, and never on library tracks.

## Reason

The lyrics step is mandatory, and today a failed read removes it silently. An even spread gets the words onto the Lyrics screen now, and aligned:false lets the app say they are not timed to the voice.

## Consequences

Deliberately not fixed here: video-processing's creator_lines only retimes lines that match a transcript segment, so typed lines on a song with no transcript are not burnt onto the master. That needs a request to video-processing-backend.
