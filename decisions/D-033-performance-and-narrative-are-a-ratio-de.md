---
id: D-033
title: Performance and narrative are a ratio, defaulting to a third performance
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: 
---

## Context

Batch 7.6 of the render plan. Real music videos intercut performance (the artist, to camera) with narrative (the story); the intercutting is the form, not a preference between two kinds of video. Nothing in the pipeline has ever decided which a shot is, so every shot has been narrative by accident. Decision D7 in the delivery plan left the default open because it is a product call: until lipsync exists (Batch 10), a performance shot is a mouth moving to words it does not match.

## Options considered

1. Ask the user. Rejected: the app never asks a craft question, and nobody can answer this before seeing the video. 2. All narrative until lipsync lands. Safe, and wrong — a music video with nobody performing the song is b-roll with a soundtrack. 3. All performance. Maximum lipsync tell, 44 times. 4. A ratio, defaulted low, carried on the plan so it can move without a code change.

## Decision

Option 4. DEFAULT_PERFORMANCE_RATIO_V1 = 0.35 in shotListV1.ts. The lane is assigned by error diffusion over the clips in order, weighted by whether that bar sits in the song's own top quarter of energy, so the total lands at the ratio, most of the performance lands in the chorus, and the two lanes interleave rather than forming blocks. The weighting fades to nothing as the ratio approaches 0 or 1, so those two mean exactly what they say.

## Reason

A third is low enough that the unmatched mouths are a texture rather than the subject, and high enough that there is an artist in the video. The ratio is the knob because the right number changes the day lipsync lands — it should go UP then, not stay. Error diffusion rather than taking the N loudest clips: the loudest N are contiguous, which hands a whole chorus to one lane and removes the intercutting that is the entire point. Nothing here is an absolute energy threshold; energy is used only as a rank within this song, for the reasons in D-031 and D-018.

## Consequences

Roughly a third of every v1 render is now performance, concentrated in the chorus, and the lipsync mismatch becomes visible where it was previously absent — this is a deliberate trade and should be judged on a real render before the number moves. The ratio is not yet exposed on the render request or in the app; it is one constant and one optional argument, so exposing it is a parameter, not a change. When Batch 10 lands, revisit the default rather than the mechanism.
