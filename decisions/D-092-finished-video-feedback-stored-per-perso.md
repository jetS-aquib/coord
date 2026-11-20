---
id: D-092
title: Finished-video feedback stored per person, every cut kept as a version, post caption from chosen facts only
date: 2026-11-20
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-380
---

## Context

The finished-video screen (JET-380) needs feedback it can show back, re-cuts and reels that are not lost when another is made, and a ready-to-post caption. Feedback only reached PostHog; JET-377 kept one re-cut and one reel slot, overwritten each time.

## Options considered

Feedback: PostHog only / a row per rating event / one row per person per video. Versions: separate collection / array on the render plan. Caption: template text / one cheap text call per video / a call on every open.

## Decision

VideoFeedback: one row per (userId, musicVideoId), latest wins, note stored but never sent to PostHog; the server sends $ai_feedback and the app stops. RenderPlanV1.versions[] appended on every re-cut and reel, original backfilled on read, currentVersionId + previousVersionId for one-step undo; JET-377 poll fields derived from the newest. Caption: one Gemini call per finished video (on completion, or first detail read), from title, director, direction labels and logline only, cached on MusicVideo.publish; rewrite shares the 5/hour re-cut limit; publish-kit kill switch.

## Reason

One row is what the screen shows and what per-render evals need; history is in PostHog. Versions belong to the render that filmed the shots, and a sub-array needs no join. A caption call costs well under a cent once; the special request is the person's own words and may name real people, so it is never posted.

## Consequences

Videos re-cut under uncommitted JET-377 code keep only a kept re-cut's original (from its undo slot); unkept JET-377 previews are not listed. Older non-current versions keep the captions they were stitched with. The caption language is the song read's, which can be wrong for romanised lyrics.
