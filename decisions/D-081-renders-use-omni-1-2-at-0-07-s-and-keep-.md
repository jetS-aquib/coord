---
id: D-081
title: Renders use Omni 1.2 at $0.07/s and keep 4-8s shots; 10s and 15s clips are not worth it
date: 2026-11-10
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-292
---

## Context

Google reroutes gemini-omni-1.1-flash to 1.2 on 2026-12-03. 1.2 is announced 30% cheaper and allows 3-15s clips.

## Options considered

1) Let the reroute happen. 2) Pin 1.2, keep 4-8s shots. 3) Pin 1.2 and allow 3-10s (15s is refused when both ends are pinned).

## Decision

Option 2. VIDEO_MODELS_V1.omni.apiModel = gemini-omni-1.2-flash at $0.07/s; the v0 key gemini-omni-1.1-flash now maps to 1.2. Shot lengths stay 4-8s.

## Reason

Probe (scripts/rnd/omni12.ts): 1.2 holds both stills with the same seam scores as 1.1 and the same speed (42-62s per clip). A 12s pinned request is a 400 'exceeds maximum duration 10 seconds'. Re-cutting 6 songs at 3-10s removed 0-3 seams of 23-31 and cut video cost under 5%, because cuts stop at four bars. Price alone takes a typical song's video from $23.10 to $16.17.

## Consequences

Every render's video is ~30% cheaper and the call sheet estimate drops with it. One of six probed 1.2 clips missed its stills badly; 1.1 does that on 20% of first takes historically and the seam check re-renders them, so it is watched, not blocked on. Revisit 3-10s if a director wants longer holds than four bars.
