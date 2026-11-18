---
id: JET-359
title: Photoreal look for every director: camera, lens and film stock per director, light as sources, real skin, no cinematic/4k words, no readable signage
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-18T17:10:47+05:30
updated: 2026-11-18T17:10:47+05:30
decisions: 
---

## Request

A realism block on every still: per-director camera/lens/stock (e.g. Zoya 35mm handheld Kodak 500T at night), light described as sources and colour temperature, natural skin texture, small imperfections; drop 'cinematic/4k/8k/perfect'. Signage soft or out of focus, no readable text. Director palettes stop defaulting to wet neon; night only where the treatment says so. Positive phrasing instead of 'no X'.

## Understanding

Every director currently grades to glossy teal neon; 10 of 20 still fails on the last render were garbled sign text. Research: concrete light + film language in the still, grain in post, one grade over the edit. Assumed: a new director spec field 'camera' (body/lens/stock) with a default; grade+grain is a separate video-processing request. Behind flags.render.realism.

## Plan

1. DirectorSpecV2.camera on all 10 directors + default.
2. realismBlockV1 in anchor/plate prompts; strip buzzwords.
3. Signage rule; palette text per director reviewed.
4. File the video-processing request: one grade + 15-20% grain + light halation over the edit.
5. Stills previews of the eval set, side by side with the last render.

## Reason

The look is what reads as AI slop first, before any hallucination.

## Related files

src/services/render/directorsV1.ts, src/services/render/renderPromptsV1.ts, src/services/render/treatmentV1.ts

## Acceptance criteria

Side-by-side stills: you judge them closer to real footage than mvr_1794998373760_2de1c52f; text fails drop to near zero.

## Test steps

—

## Thread
2026-11-18T17:10:47+05:30 aquib N: created ticket, status: - -> open
