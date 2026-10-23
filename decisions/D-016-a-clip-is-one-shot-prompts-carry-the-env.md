---
id: D-016
title: A clip is one shot: prompts carry the environment, anchors share one plate, and identity survives
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-198
---

## Context

First complete v1 render, 2026-10-23. All 28 measurable clips missed their pins: minimum seam 4.118 against a 4.0 threshold, worst 67.8, nothing near the 2.1-3.3 band a held pin measures. Clip 1 was pinned to a blue classic car on a lit forecourt and opened on a black modern sedan in a dark car park, confirmed by eye. 29 of 31 clips were then re-rendered with identical inputs and failed again: 60 generations for 31 clips, roughly double the money, no change.

## Options considered

Raise the seam threshold to match reality; keep the prompt and re-render harder; or find why the pins lose and fix the inputs.

## Decision

Five changes. 1. A CLIP IS ONE SHOT: the storyboard's three-shot progression is collapsed to the single shot a clip opens on, and when both ends are pinned the prompt keeps only what MOVES - 99 words became 48, and the pin instruction went from a third of the text to the majority. 2. The scene's environment is carried onto every clip and into every anchor. 3. Anchors are a STAR on one establishing plate, not a 32-link chain. 4. Identity survives: @imageN tags become per-character descriptions, from the project's selected characters or from autoGenerateCast, which the v0 path already uses. 5. A seam re-render strips the prompt to the movement alone and keeps whichever take landed closer.

## Reason

The prompt gave three orders at once: the storyboard said cut twice, the added continuity line said never cut, and the pin instruction said begin and end on exact frames. The model followed the longest and most specific of the three and treated the stills as loose references. Batch 1 measured 6 of 6 pins holding, with a short prompt; it never tested one carrying a three-shot progression. On environment: deriveClipsV1 read only scene.prompt, so environment, mood and style were dropped, and 13 of 32 anchors then contained no place word at all while every scene carried one. On the chain: each link copies its predecessor's errors and adds its own, which is the one topology guaranteed to accumulate them - anchor 1 and anchor 2 showed different men under different canopies. On identity: three distinct characters all collapsed into one generic subject, and a regex that matched ',' or 'and' but never ', and' wrote 'the subjects, and the subject' into 9 of 32 anchors.

## Consequences

Verified by dry run against the storyboard that failed, with no spend: anchors with no place word 13 to 3, garbled identity text 9 to 0, stray style tails 0, three characters preserved as three. Shots past the first are DROPPED for a scene that yields one clip - the storyboard over-specifies for an 8-second clip, and a clip that cuts twice cannot honour the stills at either end. If shot-level content matters, the fix is a storyboard authored one shot per clip, not cramming three back in. Separately: tsconfig.build.json now keeps tests out of dist, because npm run build followed by npm test was failing on the compiled copies.
