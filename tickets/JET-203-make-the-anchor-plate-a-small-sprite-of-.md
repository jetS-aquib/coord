---
id: JET-203
title: Make the anchor plate a small sprite of the cast and environment instead of a single frame
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-26T13:05:05+05:30
updated: 2026-10-26T13:18:18+05:30
decisions: D-019
---

## Request

Generate one sprite — 4 to 6 views of the cast and the environment in a single image — as the plate that every anchor is drawn against, instead of using the first anchor frame. Keep the per-scene anchors themselves full resolution and one per scene.

## Understanding

Aquib's idea, which I think is right at this layer and wrong at the one it was first aimed at.

The original suggestion was a sprite holding every scene, cropped per cell to pin clips with. That fails on resolution: clips need roughly 720x1280 anchors, and even a 2048x2048 sheet gives 512px cells at 16 scenes. Upscaling a 512px crop into a pin makes the clip soft, and the seam check then measures the clip against a blurry target, so scores get worse for a reason that has nothing to do with the model honouring its pin.

As the PLATE it is a different proposition. renderAnchorsV1 currently uses the first successful anchor as the reference for all the others — one frame, one angle, one moment. A sprite of several views is how character sheets are normally used, and gives the model more to hold constant: the person from more than one angle, the environment from more than one position.

Assumptions:
1. generateSceneImage takes referenceImageUrl and characterImageUrls already, so a sprite is just a different image in an existing slot. I have NOT checked whether it treats a multi-panel reference sensibly — that is the main risk and the first thing to test.
2. This is a continuity change, not a speed one. Once JET-199 makes anchors concurrent there is no time argument for batching them, so this should be judged purely on whether the stills look more consistent.
3. It costs one extra image generation per song, before the plate is usable.
4. It may interact with JET-200: if continuity improves, seam scores should drop and fewer clips should trip the threshold. That would be the clearest evidence it worked.

## Plan

1. Generate the sprite first: one image, 4-6 panels, cast and environment, from the existing cast descriptions and characterImageUrls.
2. Pass it as referenceImageUrl for every anchor, in place of the current first-anchor plate.
3. Keep the current behaviour as the fallback when the sprite generation fails — a song must not be blocked on it.
4. Compare on the same storyboard rendered both ways: do the anchors hold the same person and place better, and do the seam scores move?

## Reason

Continuity across the whole song is the product requirement, and the plate is the single point where it is decided. A one-frame plate is the least information the model could be given for that job. Low priority relative to JET-199 and JET-200, which are worth minutes each; this is a quality bet that costs one image.

## Related files

src/services/render/renderOrchestratorV1.ts (renderAnchorsV1), src/services/ai/thumbnails.ts (generateSceneImage)

## Acceptance criteria

Anchors drawn against a sprite plate hold the cast and environment at least as consistently as the current single-frame plate, judged on the same storyboard rendered both ways. Sprite failure falls back to today's behaviour and never blocks a song.

## Test steps

1. Render one storyboard with the current plate and once with a sprite plate; put the two anchor sets side by side and look at whether it is the same person and the same place.
2. Compare the seam score distributions of the two runs.
3. Force sprite generation to fail and confirm the render completes on the old path.

## Thread
2026-10-26T13:05:05+05:30 aquib N: created ticket, status: - -> open
2026-10-26T13:07:18+05:30 aquib N: status: open -> approved
2026-10-26T13:18:18+05:30 aquib N: linked decision D-019 (The anchor plate is a drawn six-panel reference sheet, on by default)
2026-10-26T13:19:35+05:30 aquib N: Built, on by default, off with RENDER_PLATE_SPRITE=0. D-019.

Your assumption 1 is the risk and it is still untested — I have not seen a sprite come back from generateSceneImage. But I found the thing that would most likely have broken it: generateSceneImage appends 'NO OVERLAYS: No watermarks, UI elements, borders, grids, frames, or diagrams' — but ONLY on its structured branch, the one taken when a prompt contains '## SCENE DESCRIPTION'. platePromptV1 does not contain that marker, so the sheet goes down the branch that forbids text and labels but says nothing about panels. That means thumbnails.ts is not touched at all; your FILES line expected it and it turned out not to be needed.

Assumption 2 is right and it is why this is on by default: with JET-199 making anchoring concurrent, the sprite costs one image and no wall-clock, so the only question left is whether the stills look better — which needs it rendered.

Two things your plan did not say and the code now does: the sprite is stored as plan.plateUrl, so a resume re-bases nothing (a render that changed plate halfway would be two songs); and the fallback is not just 'sprite failed' but also the pre-existing path intact, so an old plan resumed after this deploy still uses its first anchor as plate.

Your assumption 4 is the acceptance test and it is yours to run: same storyboard with RENDER_PLATE_SPRITE=1 and =0. If it works, the seam scores should drop — and since D-018 just re-based that threshold to 9.0 off the current distribution, a visible shift in the body is exactly the signal.
