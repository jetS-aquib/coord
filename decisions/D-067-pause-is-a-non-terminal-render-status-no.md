---
id: D-067
title: Pause is a non-terminal render status, not a second kind of cancel
date: 2026-11-03
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-242
---

## Context

A render is ~14 minutes and ~$25. The only way to stop one was cancel, which is terminal, and the only thing on offer afterwards was a fresh render from the top (JET-239 added resume, mobile now calls it). Somebody watching a plan go wrong at shot 9 had no way to hold it.

## Options considered

(a) a new 'paused' status, non-terminal and resumable; (b) reuse 'cancelled' with a pausedByUser flag; (c) stop dispatch in memory only, leaving the stored status as 'rendering'.

## Decision

(a). 'paused' joins RENDER_STATUSES_V1, outside TERMINAL_STATUSES_V1 and inside RESUMABLE_STATUSES_V1. The single DB-read stop check every boundary in the run already shared (cancelledSince) became stoppedSince and answers true for cancelled OR paused, so one function is the whole mechanism. Pause is accepted only in anchoring, rendering and verifying (409 elsewhere, naming the status). The SSE stream ends on paused. A paused render refuses a second render against the same song, as blocked does.

## Reason

(c) cannot survive a restart or a second process, which is why cancellation was read from the database in the first place. (b) makes 'cancelled' mean two different things to the one query that decides whether a render is in progress, and that query is shared by the 409 and the project lookup on purpose (JET-198) — a flag would make them disagree. Non-terminal is what keeps a paused render visible in GET /:id/render and stops a second render quietly abandoning its spend.

## Consequences

Mobile's RenderStatus union has to widen the same day or a paused render reads as one that never started. A paused render blocks a new render on that song until resumed or cancelled. The stream ends on pause, so the clips still in flight are seen by polling rather than streaming. A clip that throws after a pause no longer flips the render to failed. Nothing sweeps or times out a paused render, and startup resume skips it, so a pause is held until a person moves it.
