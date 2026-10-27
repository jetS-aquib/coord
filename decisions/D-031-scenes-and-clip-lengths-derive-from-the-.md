---
id: D-031
title: Scenes and clip lengths derive from the song's structure, not from the model's maximum duration
date: 2026-10-27
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend, music-jetkreate-mobile
tickets: JET-206, JET-207, JET-212
---

## Context

Until now a clip boundary landed wherever the model's maximum duration fell — targetSceneCount = ceil(duration / maxDuration), then deriveClipsV1 split each scene into equal parts of at most 8 seconds. A cut on a ten-second grid cannot land on a downbeat except by accident, and pop is built in 4- and 8-bar phrases. JET-206 delivered the beat map and JET-207 the per-clip trim, so both inputs now exist. This is 6.4 and 6.8 of the delivery plan.

## Options considered

1. Keep duration packing; spend the effort on prompts instead. 2. Snap the existing equal-length clips to the nearest downbeat: cheap, but a clip is then a fraction of a bar and the phrase structure is still ignored. 3. Derive clips from the song: a scene is a section, a clip is a whole number of bars chosen by that bar's energy, generated at a length the model offers and trimmed to the musical length at assembly.

## Decision

Option 3, in cutPlanV1.ts, with deriveClipsV1 kept untouched as the fallback. A scene is a section. A clip is 1 bar through a loud passage and up to 4 through a quiet one, never a fraction of a bar, never longer than the model's cap. The opening shot of the loudest section holds one bar longer than its energy alone would ask for. Prompts still come from the storyboard by looking up which scene covers each clip's midpoint, so sceneIndex keeps meaning what it meant and mirrorSceneToProjectV1 keeps working. isSceneBoundaryV1 now prefers sectionIndex, because a musically-cut render changes scene where the song changes.

## Reason

Cuts on the downbeat are most of what separates a music video from a slideshow with a song over it, and the arithmetic is ours to do — nobody is asked a craft question. The hook holds because the biggest moment of a song wants a longer shot, not faster cutting: it is the one place where more energy means fewer cuts. Generating at a model length and trimming at assembly (D-027) is what makes any of it possible, since no model generates 5.217 seconds.

## Consequences

Clip count and cost change per song: fewer, more varied clips than a ten-second grid, against roughly 15-25% of generated seconds discarded at assembly, reported by discardedSecondsV1 rather than hidden. A render whose song read is missing, empty (instrumental) or unusable falls back to duration packing, so the musical cutting can fail without the render failing. The seam check still measures the LAST frame of a generated clip rather than the last surviving one, which on a trimmed clip is a frame nobody sees — JET-212 is filed for the API change that fixes it, and until it lands a trimmed render's seam scores are measured on discarded frames. Batch 7's shot list replaces where prompts come from; this changes only the clock.
