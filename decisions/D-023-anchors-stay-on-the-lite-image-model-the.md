---
id: D-023
title: Anchors stay on the lite image model; the tier is a known ceiling on continuity
date: 2026-10-26
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-203
---

## Context

First viewing of a full render (mvr_1793003811615, 26 Oct, RENDER_PLATE_SPRITE=0) showed characters changing between shots and lighting flipping bright-to-dark, while the seam scores for the same render were the best yet (median 5.86, max 10.95, one clip over threshold). Those are not in conflict: the seam check measures a clip against ITS OWN anchors and never compares anchor N to anchor N+1, so anchors that disagree with each other produce low scores and a visibly incoherent song. Four causes found in the plan data: (1) selectedCharacters and characterImageUrls are both empty, so three characters are held together by text description alone; (2) the plate was anchor 0, 'low angle on wet asphalt as a dark car pulls in' — a car, carrying no cast information at all; (3) DEFAULT_IMAGE_MODEL is nano-banana-2-lite (gemini-3.1-flash-lite-image), the cheapest configured tier, drawing the 32 images that carry continuity for the whole song; (4) each anchor prompt is ~1100 characters of which ~800 is cast description repeated twice, once inlined by substituteImageTagsV1 and again by castBlockV1, burying the shot and the location.

## Options considered

(a) move anchors to nano-banana (gemini-2.5-flash-image); (b) move anchors to seedream-5-0; (c) add a per-render imageModel field and A/B it; (d) leave the lite tier and attack the other three causes first.

## Decision

(d), on the dev's call. The lite tier stays wired for anchors. Recorded here rather than in a code comment because it is a known ceiling on output quality that somebody should revisit deliberately, not discover.

## Reason

The dev's reasoning: gemini-2.5-flash-image is deprecated with retirement scheduled 2027-03-15, so (a) would be migrating onto something already on its way out. The other three causes are free or nearly free to fix and none of them has been tried yet — the sprite plate (JET-203, D-019) was switched off for this render, reference images are a product question, and the prompt duplication is a plain bug. Changing the model at the same time as any of those would make it impossible to tell which one helped.

## Consequences

Anchor quality is capped by the lite tier until someone chooses a successor, and that choice should be made fresh rather than defaulting to gemini-2.5-flash-image. The upgrade path is one constant, DEFAULT_IMAGE_MODEL in config/aiModels.ts, or a per-render imageModel field if v0 thumbnails should stay on lite. Revisit when: the sprite plate and the prompt fix have both been measured and characters still drift, or when a non-deprecated successor is available. Until then the anchors are the cheapest images in a pipeline where they are the most important ones.
