---
id: JET-371
title: Release: the app is killed by Android's low-memory killer when the file picker opens on a 2 GB phone
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-19T13:11:35+05:30
updated: 2026-11-19T13:11:35+05:30
decisions: 
---

## Request

Measure the app's memory on a release build and bring it down so picking a song does not kill the app on low-RAM phones.

## Understanding

Emulator (2 GB RAM), dev client: killed twice by lowmemorykiller while the audio file picker was open (393 MB RSS + 453 MB swap; 'Kill com.jetsynthesys.jetkreatemusic ... oom_score_adj 700'). Right after launch, dumpsys meminfo shows 594 MB PSS, 315 MB native heap — before any video is opened. The user lands back on Your videos and loses the upload. Assumptions: part of this is the dev build (Metro/debug); the home grid's video posters/players are the likely native-heap cost. Many Indian-market phones have 2–4 GB.

## Plan

1. Measure PSS on a release APK: launch, after scrolling the grid, after playing a video.
2. If high: posters as images not players in the grid; release players on blur.
3. Re-test: pick a song after 10 minutes of use on a 2 GB emulator.

## Reason

—

## Related files

—

## Acceptance criteria

Release build on a 2 GB device: picking a song after 10 minutes of use never kills the app; PSS after launch under 300 MB.

## Test steps

—

## Thread
2026-11-19T13:11:35+05:30 aquib N: created ticket, status: - -> open
2026-11-23T15:50:33+05:30 aquib N: Reproduced on the emulator twice (2026-11-23): lowmemorykiller took the app when the file picker opened, and again while the Forgot password Chrome tab was open; the Library alone was ~630 MB PSS. Likely contributor: on-device frame decoding for every Library poster (lib/thumbnails.ts). JET-387 (backend: thumbnailUrl + progress on the list) and JET-403 (mobile: Home uses server thumbnails) remove that; this ticket keeps the picker-specific fix (release memory before launching the picker, reopen Pick a track after a kill).
