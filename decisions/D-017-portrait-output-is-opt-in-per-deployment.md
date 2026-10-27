---
id: D-017
title: Portrait output is opt-in per deployment, not the default
date: 2026-10-26
status: superseded
superseded_by: D-026
repos: video-processing-backend, music-jetkreate-mobile, music-jetkreate-backend, creater-ai-backend
tickets: JET-196
---

## Context

D-005 made the audio and lyrics workflows derive orientation from the clips. Landscape output was verified byte-identical, but nobody has checked whether the players, thumbnailers or compositing downstream of creater-ai-backend and music-jetkreate-backend tolerate a non-16:9 master, and a majority-portrait clip set reaching one of those today would silently start producing a different file.

## Options considered

—

## Decision

The derivation from D-005 stands unchanged, but sits behind ENABLE_PORTRAIT_OUTPUT, default false. With the flag off, the audio and lyrics workflows produce 1920x1080 whatever the clips are. It is a deployment flag, not a request field.

## Reason

The requester could not confirm that nothing downstream assumes 16:9. A flag lets the mobile deployment have portrait now without betting every other caller's output on an unverified assumption, and it is one env var to remove once each deployment has checked.

## Consequences

Mobile needs ENABLE_PORTRAIT_OUTPUT=true set wherever it is served from, or it still gets pillarboxed masters — JET-196 is not finished for them until that is set. Every other deployment is unchanged with no action. The flag should be deleted once each caller has verified its players, otherwise it becomes permanent.
