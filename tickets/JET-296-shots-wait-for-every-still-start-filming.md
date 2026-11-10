---
id: JET-296
title: Shots wait for every still: start filming a shot as soon as its two stills are drawn and checked
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T15:04:37+05:30
updated: 2026-11-10T15:06:44+05:30
decisions: 
---

## Request

Overlap the stills phase with the shots phase: a clip starts generating as soon as the still it opens on and the still it closes on are done and have passed the frame check, instead of after all 35-45 stills.

## Understanding

Same work, different order: no change to what is drawn, checked or paid for. Assumptions: the plate still comes first (every still is drawn against it); a still that fails or is redrawn holds back only the clips pinned to it; a clip whose still failed falls back exactly as today (previous clip's last frame, or unpinned). Status becomes 'rendering' when the first clip starts, and anchorsDone/anchorsTotal keep counting while it does, so the app can show both. Pause and cancel stop both kinds of work at the next unit, as today. Resume from checkpoints still works because anchors and clips keep their own done flags.

## Plan

1. One scheduler: draw anchors in their lanes; when anchors i and i+1 are both settled (done+gated, or failed), queue clip i into the clip lanes.
2. Keep the per-render video slots (JET-284) and image concurrency as they are.
3. Phase: 'anchoring' until the first clip starts, then 'rendering'; keep anchorsDone/anchorsTotal live.
4. Contract note in api-music-videos.md: anchors may still be drawing during 'rendering'.
5. Measure on one song: anchoring+rendering wall time before and after.

## Reason

Follow-up to JET-284. On five recent renders anchoring took 83-130s and rendering only started after it (renderAnchorsV1 then renderClipsV1, runPlanV1). Clip i needs only anchors i and i+1 (renderPromptsV1 / renderOneClipV1). Overlapping can save up to ~2 minutes a render.

## Related files

src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

On the same song, the time from the first still to the last clip done drops by roughly the old anchoring phase; no clip starts before both its stills are settled; pause, cancel and resume behave as before.

## Test steps

—

## Thread
2026-11-10T15:04:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:06:44+05:30 aquib N: status: open -> approved
