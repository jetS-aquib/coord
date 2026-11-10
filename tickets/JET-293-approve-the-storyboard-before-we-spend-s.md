---
id: JET-293
title: Approve the storyboard before we spend: shots, prompts, cast stills and the price, then render
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:45+05:30
updated: 2026-11-10T20:30:41+05:30
decisions: 
---

## Request

Let a creator see and edit the plan (shots, prompts, cast stills) and the cost before any video is generated, and re-render one finished shot with an edited prompt.

## Understanding

Backend parts exist (review gate, regenerateShotV1, estimate). Single-shot regenerate today re-runs the whole shot list (:915) and may need a backend follow-up. A decision record on charging for failed shots goes with this.

## Plan

Depends on: JET-286.
1. App requests review mode, shows the storyboard with prompts and cast stills and the price.
2. Edit a shot's prompt, then approve to render.
3. On a finished render, re-render one shot with an edited prompt.
4. Decision: failed shots are free (recommended).

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Competitors (Neural Frames, Freebeat, LTX) make planning free and storyboard-first; complaints centre on credits burned by bad or failed renders. The backend already has a review gate (renderOrchestratorV1.ts:1788) the app does not use. Open product decision: failed shots should not be charged.

## Related files

render flow screens in music-jetkreate-mobile

## Acceptance criteria

A creator sees every shot's prompt and the price before paying, can change one, and the render uses the change.

## Test steps

—

## Thread
2026-11-10T01:57:45+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:30:41+05:30 aquib N: status: open -> approved
2026-11-10T21:05:23+05:30 aquib N: Most of this is already built (plan screen, price, ShotOverride, accept). The two missing routes are filed for the backend as the request just created. Failed-shots-free needs a decision from the person.
