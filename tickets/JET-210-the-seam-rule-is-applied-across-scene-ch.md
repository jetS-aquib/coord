---
id: JET-210
title: The seam rule is applied across scene changes too, which is where it enforces the jump cut it exists to prevent
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-10-27T13:56:00+05:30
updated: 2026-10-27T15:30:15+05:30
decisions: D-029
---

## Request

At a scene change, stop pinning the previous clip to the next scene opening still, and stop scoring that end against it as a continuity failure. Continuity inside a scene, a clean break across one. Measure the break size and store it, but do not re-render on it yet.

## Understanding

This is 6.6 of the delivery plan, and it continues JET-200 — the same check, the same budget, a different kind of clip paying for it.

What we found reading renderOrchestratorV1 and seamCheckV1. Anchors are one per clip boundary: anchor i opens clip i and closes clip i-1, one shared still. deriveAnchorsV1 builds anchor i from clip i own prompt, so at a scene change anchor i already depicts the NEW scene. renderOneClipV1 then sets endFrame = anchorFrameV1(anchors, clip.index + 1).

Put together, the last clip of a verse is pinned to END on the chorus opening still. It is asked to arrive at the next scene inside its own four seconds, and then scoreClipV1 measures it against that still and re-renders it when it fails to get there. The craft rule is the opposite one: continuity inside a scene, a clean break across one. Two shots that match across a cut read as a jump cut, and a verse that dissolves into the chorus reads worse than either.

So the inversion is not only the threshold, it is the pin — measuring for a break while the model is pinned to produce a match burns the re-render budget on something it cannot fix, which is exactly the shape of the failure D-018 already paid for over five renders.

What we think it is, for you to take or leave:
1. A boundary index is a scene boundary when index is above 0, below clips.length, and clips[index-1].sceneIndex differs from clips[index].sceneIndex. Song start and song end are not scene boundaries. A pure exported predicate, testable without a render.
2. renderOneClipV1 stops taking an endFrame when the boundary after this clip is a scene boundary. Note this also flips pinned to false for that clip, so it goes down the unpinned clipPromptV1 path and cannot be re-rendered with pinFocused — both correct, there is no second pin to drive it toward.
3. The fallbackStart at line ~948 reaches for the previous clip last frame when a start anchor failed. That should not reach across a scene boundary either, or a failed anchor quietly restores the pin the change just removed.
4. scoreClipV1 stops folding the last-frame score into the continuity max at a scene boundary. The clip opening pin is untouched and still checked: anchor i is the new scene own still, and a clip that does not start there has genuinely gone somewhere else.

On the other half of the inversion, enforcing a MINIMUM difference across the cut: we would measure it and not act on it yet. The measurement is free — the comparison you would make is the one already being made, clip i-1 last frame against anchor i, same call, just read as a break size instead of a continuity error. But there is no measured band for too similar across a cut, and the 4.0 story in your own file header is what an unmeasured absolute threshold costs. Record it per clip, let a render or two produce a distribution, then choose the number the way 9.0 was chosen.

Assumptions: clips are in play order and sceneIndex is dense per scene, which segmentClipsV1 already relies on; a scene is still a storyboard scene, so this holds before 6.4 changes what a scene is and should still hold after. We are not asking for anything to do with 6.4 or the beat map here — this stands on its own and does not wait on JET-206.

## Plan

1. Nothing changes on our side. POST /api/v1/frame-comparison is unchanged and the same number of calls are made — one of them is simply read differently.
2. We would like the break score kept on the clip so the distribution exists, the way seamScores was added to answer whether re-rendering helps.
3. When a band appears, a minimum-difference threshold can be chosen from it, and we are happy to be asked for a video-to-video comparison shape at that point if the anchor proxy turns out not to be good enough. It would be a new ticket, not a change to the frames contract today.

## Reason

Every scene change in every render is currently paying generation money to look like a jump cut, and some of them are paying it twice because the seam check re-renders the clip for failing to dissolve into the next scene. JET-200 cut the re-render bill by re-basing the threshold; this cuts the part of it that was never a defect in the first place. It also unblocks nothing and breaks nothing, so it can go in whenever.

## Related files

src/services/render/seamCheckV1.ts; src/services/render/renderOrchestratorV1.ts (renderOneClipV1, scoreClipV1, measurableV1); src/models/RenderPlanV1.ts (a break score field); src/services/render/renderV1.test.ts

## Acceptance criteria

A render whose storyboard has several scenes shows no re-render triggered at a scene boundary, and the clip before a scene change is generated with a start pin and no end pin. Within a scene the check behaves exactly as it does today. Playing the result, a scene change is visibly a cut rather than a dissolve. The pure boundary predicate has a unit test that needs no render.

## Test steps

1. `npx vitest run src/services/render/renderV1.test.ts` — the `isSceneBoundaryV1` block, 4 tests, no render and no spend. It covers the mid-scene splits a long scene produces, which must NOT read as scene changes.
2. Render a storyboard with several scenes. In the logs, no clip at a scene boundary is re-rendered for its seam.
3. In the plan document, the last clip of each scene has a `breakScore` and a `seamScore` measured only at its opening still; clips inside a scene are unchanged — both ends folded into `seamScore` as before.
4. Play the result: a scene change is a cut, not a dissolve into the next scene.
5. Collect `breakScore` across a render or two before anyone picks a minimum-difference threshold — that is deliberately not enforced yet (D-029).

## Thread
2026-10-27T13:56:00+05:30 aquib N: created ticket, status: - -> open
2026-10-27T14:00:11+05:30 aquib N: status: open -> approved
2026-10-27T15:29:39+05:30 aquib N: linked decision D-029 (Scene changes are cuts: no end pin, no seam score, measure the break and do not enforce it)
2026-10-27T15:30:15+05:30 aquib N: status: approved -> in_progress
2026-10-27T15:30:15+05:30 aquib N: status: in_progress -> review — Took all four points as filed; the predicate lives in RenderPlanV1.ts beside deriveAnchorsV1, which is what creates the mismatch. One thing you did not list that needed it too: measurableV1 would have called a clip measurable when its opening anchor failed and its closing one is a scene change, scored nothing, and recorded a perfect 0 — it now requires an end that is actually a continuity check. Break size stored as clip.breakScore, not acted on and not on the wire. Recorded as D-029.
