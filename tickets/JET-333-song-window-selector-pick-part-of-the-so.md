---
id: JET-333
title: Song window selector: pick part of the song on the section strip, snapped to sections and beats, with a live price
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-17T15:36:52+05:30
updated: 2026-11-17T15:37:03+05:30
decisions: D-083
---

## Request

On the track screen turn SongReadStrip into a range picker: coarse handles snap to section edges, fine adjust snaps to downbeats; presets Hook (~30s), Verse + chorus, Full song; play the selection; price updates via /estimate with trim; send trim on startRender.

## Understanding

Song read already gives sections (gap-free, on downbeats) and downbeats; hook comes from the backend's loudest section. Backend window rendering is JET-328 (+JET-329 on video-processing). The fake waveform (lib/waveform.ts) isn't needed for this. Assumption: minimum window ~8s; the window is chosen before the director/brief steps and carried in the create context.

## Plan

1. Range state in create-context.
2. SongReadStrip range mode: handles, section/downbeat snapping, presets, preview playback.
3. /estimate with trim on ready.tsx; startRender sends trim.
4. Show the window on the call sheet header.

## Reason

Users want a video for just part of the song.

## Related files

src/features/create/song-read.tsx, src/app/(create)/audio.tsx, src/app/(create)/ready.tsx, src/features/create/create-context.tsx, src/lib/generation.ts

## Acceptance criteria

Picking the Hook preset selects the chorus, plays it, lowers the price, and the finished video is only that part with matching audio and captions.

## Test steps

—

## Thread
2026-11-17T15:36:52+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: Needs backend JET-328, which needs JET-329.
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
