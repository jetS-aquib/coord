---
id: JET-199
title: Anchor stills render one at a time, but the star topology no longer requires it
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-10-26T13:03:20+05:30
updated: 2026-10-27T16:25:21+05:30
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
2026-10-26T13:06:55+05:30 aquib N: status: open -> approved
2026-10-26T13:19:09+05:30 aquib N: Done in code, not yet verified on a render.

Your assumption 1 was the right thing to flag and I still cannot settle it — nothing in the logs or the plan documents times the anchoring phase, so ~5 minutes remains an estimate from the code. What is now true either way: only the plate is serial, the other 31 stills fan out through runCappedV1, and progress counts settled anchors instead of a loop index.

Assumption 4, the one you said you did not know: still not measured, so it is not inherited. Anchors run at IMAGE_CONCURRENCY_V1, which is its own env knob (RENDER_IMAGE_CONCURRENCY) defaulting to 6 — the same number as the video cap, but not the same setting, so turning one down does not touch the other. First 429 during anchoring, turn it down.

One thing your plan did not cover and the code now does: if the first still FAILS, the old loop quietly promoted the next successful one to plate. Fanning out at that point would have drawn 32 unrelated places. It draws serially until one succeeds, then fans out — normally one pass.

Note that the plate itself is no longer the first anchor when JET-203 is on (default): it is the drawn sprite. Your assumption 2 — 'each anchor sees exactly the same plate it sees today' — holds for JET-199 alone, and is deliberately broken by JET-203. Render with RENDER_PLATE_SPRITE=0 to time this one in isolation.
2026-10-27T16:25:20+05:30 aquib N: status: approved -> in_progress
2026-10-27T16:25:21+05:30 aquib N: status: in_progress -> review — Anchors render through runCappedV1 at IMAGE_CONCURRENCY_V1 instead of one at a time; the star topology means each is conditioned on the plate, not on its predecessor, so there was nothing left to serialise. Shipped in e7494ab.
