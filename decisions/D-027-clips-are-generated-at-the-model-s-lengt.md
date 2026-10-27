---
id: D-027
title: Clips are generated at the model's length and trimmed to the music's length
date: 2026-10-27
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: 
---

## Context

Cuts in a music video land on the downbeat, and pop is built in 4- and 8-bar phrases. At 92 BPM a two-bar hold is 5.2 seconds. No video model generates 5.2 seconds: they offer a small set of fixed lengths, and the planner currently packs every clip to the model's maximum, which is why cuts land on a ten-second grid and the video does not feel like it belongs to the song.

## Options considered

Ask the model for the nearest supported duration and accept cuts a few frames off the beat; change the music to fit the model, which is not a real option; generate at the model's native length and trim to the musical length at assembly.

## Decision

Clips are generated at whatever length the model supports and trimmed to their musical length when the video is assembled. The stitch request gains per-clip in and out points; the trim is a stream operation on material we already hold, so it costs nothing in time or quality. The plan carries both numbers, so what was paid for and what was used are both visible.

## Reason

Off-beat cuts are the specific defect this work exists to remove, and a few frames is audible — a cut landing late reads as a mistake even to someone who cannot say why. The nearest-supported-duration option gets the length approximately right and the beat wrong, which is the wrong half to keep. Trimming at assembly also decouples musical cutting from whatever the model happens to support, so a model change cannot reintroduce the grid.

## Consequences

We pay for generated seconds we discard — roughly 40% on verse-heavy songs at today's prices, partly offset because musical cutting produces fewer clips than a ten-second grid does. The waste is visible per render and should be reported alongside the cost estimate rather than hidden. video-processing-backend needs in/out points on the stitch request, which is a contract change and a ticket. A clip that is trimmed shorter than its generated length must still satisfy the seam check at the frames that survive, not the frames that were cut.
