---
id: JET-199
title: Anchor stills render one at a time, but the star topology no longer requires it
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-26T13:03:20+05:30
updated: 2026-10-26T13:03:20+05:30
decisions: 
---

## Request

Render the anchor stills concurrently through runCappedV1, the way clips already are. The plate still goes first and alone; every other anchor is drawn against that same plate, so they do not depend on each other.

## Understanding

renderAnchorsV1 (renderOrchestratorV1.ts:523) is a plain for-loop with an await inside: 32 stills, strictly one after another. The docstring above it explains that this used to be a CHAIN (anchor i conditioned on anchor i-1) and was deliberately rebuilt as a STAR (every anchor conditioned on the first successful one, the plate) to stop drift compounding. A chain has to be serial. A star does not — only the plate must exist before the rest. The loop looks like it was simply never changed when the topology was.

Assumptions, please correct any:
1. I have NOT measured this phase. My estimate of ~5 minutes is 32 image calls at roughly 10s each, derived from the code, not from your logs. If generateSceneImage is much faster than I think, this ticket is worth far less than I claim and you should say so.
2. Output is unchanged by this: each anchor sees exactly the same plate it sees today, so nothing about continuity or drift changes. Only the order of the calls does.
3. The plate selection on resume (first anchor already done) still has to happen before the fan-out, or a restart would re-base the song on a different image.
4. Your image provider tolerates the same concurrency as the video provider. I do not know this — plan.concurrency is currently used only for clips.

## Plan

1. Render the plate first, alone, exactly as today (including the resume case where it is an already-done anchor).
2. Fan the remaining anchors out through the existing runCappedV1 at plan.concurrency.
3. Keep the per-anchor try/catch: one failed still must still cost only its own boundary, not the song.
4. Progress reporting currently increments inside the loop; it needs to count completions instead of index.
5. Confirm the image provider's real concurrency limit and use it rather than inheriting the video cap blindly.

## Reason

On the render I profiled, the video service sat idle for 224 of 318 seconds while Node worked. Anchors are the phase I could not see, and they are the only one still running serially. If the estimate is right this is about 4 minutes of a roughly 14 minute render, recovered by a change that alters no output.

## Related files

src/services/render/renderOrchestratorV1.ts (renderAnchorsV1)

## Acceptance criteria

A song's anchors complete in roughly the time of ceil(32/concurrency) image calls rather than 32 sequential ones. The plate is still the first successful anchor and every other anchor is still drawn against it. A single failed still leaves its neighbours' clips unpinned on that side, exactly as now.

## Test steps

1. Render a song and time the anchoring phase before and after.
2. Confirm the plate in the log line 'anchors N/M (plate: yes)' is the same image a serial run would have chosen.
3. Force one anchor to fail and confirm only that boundary loses its pin.

## Thread
2026-10-26T13:03:20+05:30 aquib N: created ticket, status: - -> open
