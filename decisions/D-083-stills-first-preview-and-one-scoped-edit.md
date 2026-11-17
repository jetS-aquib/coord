---
id: D-083
title: Stills-first preview and one scoped edit model for music videos
date: 2026-11-17
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile, video-processing-backend
tickets: JET-325, JET-326, JET-327, JET-328, JET-329, JET-330, JET-331, JET-332, JET-333
---

## Context

Users only saw output after paying for a full render; call sheet was prose; post-render edits were one clip at a time; trim was half-built.

## Options considered

Preview as: (a) anchor-stills animatic, (b) stills + one test clip, (c) low-res full video. Range edges: (a) hard cut with opt-in smooth, (b) always re-film the neighbour. Animatic: on-device vs server slideshow endpoint. Clients: mobile only vs mobile+web.

## Decision

Stills animatic played on the device; one scoped edit API (shot / selection / section / from N / all) with a dry run, used both before and after filming; hard cut by default with opt-in smoothing; mobile only for now, web later.

## Reason

Clips are already pinned to their anchor stills, so approved stills fix every clip's first and last frame at ~$1-1.5/song; on-device animatic avoids a new video-processing endpoint; hard cut keeps edits from costing an extra clip.

## Consequences

Web stays on v0 flow; a server-side animatic export is not available; range edits show a visible cut unless smoothing is ticked.
