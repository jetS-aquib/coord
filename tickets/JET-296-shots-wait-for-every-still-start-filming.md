---
id: JET-296
title: Shots wait for every still: start filming a shot as soon as its two stills are drawn and checked
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T15:04:37+05:30
updated: 2026-11-10T15:33:02+05:30
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

1. `npx vitest run src/services/render/renderV1.test.ts`: passes, including "anchorReadinessV1".
2. Demo render of a song you rendered before. In the log, the first `clip.generate` starts while `anchor.image` lines are still coming; the status turns `rendering` while `anchorsDone` is below `anchorsTotal`.
3. The final `timing:` line: anchoring is a short phase now, and anchoring + rendering together is shorter than the same song's earlier render (recent renders: anchoring 83-130s, then rendering 6-12 min).
4. Pause during the overlap, then resume: no shot renders twice, stills not yet drawn are drawn on resume, and the render finishes.

## Thread
2026-11-10T15:04:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:06:44+05:30 aquib N: status: open -> approved
2026-11-10T15:31:15+05:30 aquib N: status: approved -> in_progress
2026-11-10T15:33:02+05:30 aquib N: Built. runPlanV1 runs renderAnchorsV1 and renderClipsV1 together. anchorReadinessV1 gives each still a 'ready' promise (released after its draw and check, redraw included, or when it fails); a clip lane waits for stills i and i+1 before taking a video slot, so waiting lanes hold no slot. settleAll on any exit of the stills phase (stop, error) so no shot waits forever. Status turns 'rendering' when the first shot starts; anchor progress never moves the bar backwards. Plate still first. Not measured on a real render (it costs one): Test steps 2-3 do that. Contract: note that anchoring and rendering overlap. Mobile follow-up: JET-297 (approved).
2026-11-10T15:33:02+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
2026-11-10T16:12:31+05:30 aquib N: BUG found in the first real render (mvr_1794306984742_66e80797): when the first shot started, setPhase('rendering') called plan.save() while the stills phase was still saving the same document through queueSaveV1 -> Mongoose ParallelSaveError, the run ended, and a queued save then wrote 'rendering' back over 'failed', so the app showed 'filming 0 of 24' with nothing running. Fixed (uncommitted): setPhase saves through queueSaveV1; runPlanV1's catch waits for queued saves before writing failed. The stuck render resumed on the dev server's restart (startup sweep) and is filming 6 at a time.
