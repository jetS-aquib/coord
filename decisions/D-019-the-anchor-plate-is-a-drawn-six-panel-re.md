---
id: D-019
title: The anchor plate is a drawn six-panel reference sheet, on by default
date: 2026-10-26
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-203
---

## Context

renderAnchorsV1 draws every anchor against a plate. Until now the plate was whichever anchor happened to render first: one person, one angle, one instant, and then 31 stills asked to stay consistent with it. JET-203 proposes drawing the plate on purpose instead — one image, six panels, the cast from two angles each and the location from three.

## Options considered

(a) leave the first-anchor plate; (b) draw a sprite and use it, off by default; (c) draw a sprite and use it, on by default with an env switch; (d) change generateSceneImage so a plate can opt out of its no-grids rule.

## Decision

(c). platePromptV1 builds the sheet, renderPlateSpriteV1 draws it, plan.plateUrl stores it so a resume re-uses the same one. RENDER_PLATE_SPRITE=0 turns it off. Not (d): generateSceneImage's 'no grids, frames or diagrams' rule only applies on its structured branch, so the plate prompt simply avoids the '## SCENE DESCRIPTION' marker and the shared v0 file is not touched at all.

## Reason

Continuity across the whole song is the product requirement and the plate is the single point where it is decided; a one-frame plate is the least information the model could be given for that job. On by default because the acceptance test is a side-by-side of the same storyboard rendered both ways, and a flag defaulted off never gets rendered. It costs one image per song and no wall-clock, since JET-199 made anchoring concurrent.

## Consequences

Every render's anchors now reference a sheet nobody has judged yet — this is a bet, not a measurement, and the evidence is still to be gathered by rendering one storyboard both ways. A sprite that fails or is refused leaves plateUrl unset and anchoring falls back to exactly the old behaviour, so it can never block a song. If it works, seam scores should drop and fewer clips should trip the JET-200 threshold, which is the clearest signal available. One env var reverts it.
