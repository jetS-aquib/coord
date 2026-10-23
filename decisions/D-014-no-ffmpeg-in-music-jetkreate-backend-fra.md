---
id: D-014
title: No ffmpeg in music-jetkreate-backend; frame work moves to video-processing-backend
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-197
---

## Context

The v1 pipeline needs frames pulled out of rendered clips: the still a neighbouring clip opens on, and the two frames each seam measurement compares. The first implementation shelled out to ffmpeg from Node in src/services/render/seamCheckV1.ts.

## Options considered

Keep frame work in Node since it is 'just one ffmpeg call'; or move every ffmpeg operation to video-processing-backend and consume it as an API.

## Decision

The Node API backend runs no ffmpeg. video-processing-backend owns every ffmpeg operation and already owns stitching, audio and captions; frame extraction belongs in the same house. JET-197 asks for the endpoints.

## Reason

ffmpeg is already a dependency there and should not be one here. A process spawn per frame next to request handling does not belong in the API container. Verifying one 4:08 song is about 66 extractions, six at a time, so this is a hot path, not an occasional utility. It was two call sites and would grow with every later quality check.

## Consequences

seamCheckV1.ts lost its ffmpeg and its sharp; the metric itself moved too, so there is one definition of the number. The local implementation stayed working until the endpoints landed. v0 is unaffected: services/ai/thumbnails.ts keeps its own extractor.
