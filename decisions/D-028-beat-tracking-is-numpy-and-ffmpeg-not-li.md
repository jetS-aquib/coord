---
id: D-028
title: Beat tracking is numpy and ffmpeg, not librosa
date: 2026-10-27
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-206
---

## Context

JET-206 asks video-processing-backend for a song structure and beat map: sections, BPM, downbeats and a coarse energy curve per bar. The ticket named the dependency question openly rather than deciding it — numpy is in the image, librosa is not, and the requester asked to be told if adding one was unwelcome. The image today carries numpy, OpenCV, Pillow, faster-whisper and ffmpeg; it has no scipy.

## Options considered

Add librosa and use beat_track, which does tempo and beats in two lines. Add a lighter beat-tracking package. Write the onset envelope, tempo estimation and beat phase in numpy against audio decoded by the ffmpeg already on the box.

## Decision

numpy and ffmpeg. The audio is decoded to mono 22050 Hz float32 by ffmpeg, the onset envelope is half-wave-rectified spectral flux over a log-compressed magnitude spectrum, tempo comes from the autocorrelation of that envelope under a log-normal prior centred at 120 BPM, and the tempo is then refined by searching real-valued periods near the autocorrelation's answer for the pulse train that best fits the onsets. The bar phase is measured over four beats. Sections come from lyric repetition in the cached transcript plus instrumental gaps, using difflib from the standard library. No package is added to requirements.txt.

## Reason

librosa would pull scipy, numba and llvmlite into an image that already carries faster-whisper and a 2.9 GB Whisper model, for one job — tempo — on material the requester explicitly scoped to steady-tempo 4/4 pop. What that buys in return is accuracy we measured and did not need a library for: 0.05 BPM across 74 to 165 BPM on synthetic click tracks, which over three minutes is under a fifth of a beat of drift.

The refinement step is the part worth recording, because the obvious implementation is wrong and quietly so. Autocorrelation can only report a whole number of frames, and at a 512-sample hop lag 21 is 123.1 BPM while lag 22 is 117.5 — a real 120 BPM track can only come back as one of those, both wrong by more than two BPM. Over four minutes that walks the grid a full bar away from the song, which is precisely the defect this whole batch exists to remove. Parabolic interpolation of the autocorrelation peak does not fix it either: a click-train peak is one or two frames wide, so the parabola fits the peak's shape rather than the period. Asking the song directly — of the periods near this one, which pulse train lands on the onsets — has no quantisation in it and is where the 0.05 BPM comes from.

## Consequences

One tempo for the whole song. No tempo-drift detection, no time-signature detection, and a track that changes tempo halfway gets a grid that is right for one half. 4/4 is assumed, though the bar phase within it is measured rather than assumed. Section labels are a guess from lyric repetition and are documented as much less reliable than the section boundaries, which come from instrumental gaps and the bar grid.

The upgrade path is deliberate and named in the code: when the material stops being steady 4/4 pop, add librosa and delete the middle third of app/services/song_read.py rather than tuning it. That is a smaller change than it sounds, because the module's seams are already at the right places — onset envelope, tempo, beats, downbeats.

This also means the service's dependency list is unchanged, so JET-206 needs no image rebuild to deploy.
