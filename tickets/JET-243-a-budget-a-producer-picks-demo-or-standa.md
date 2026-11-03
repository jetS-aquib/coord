---
id: JET-243
title: A budget a producer picks, demo or standard or hero, and the cost before the money rather than after
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-03T15:20:10+05:30
updated: 2026-11-03T23:46:38+05:30
decisions: 
---

## Request

A budget tier on the render body that resolves the model, the re-render budget and the check budget server-side, and an estimated cost for that tier available before the render is started.

## Understanding

9.5b, and mobile has nothing to send. The render route takes modelKey, and this app deliberately sends none since Google retired the Veo 3.1 previews, so the server picks. There is no tier. The plan's own framing is that model names and prices per second are an engineer's control and a producer picks demo, standard or hero. The machinery it says exists is real but on the wrong side of the 202: estimatedCostUsd, discardedSeconds and rerenderBudgetV1 are on the render state, and the call sheet needs a number BEFORE Start filming, which is the whole shape of Batch 8's gate (D-051: nothing is bought until the plan is shown). Assumptions: (1) a tier resolves model, rerenderBudgetV1 and the frame-gate/clip-check budget in config/videoModelsV1.ts, server-side, so mobile never names a model or a price; (2) the estimate for the chosen tier is available at the review gate, where the plan already exists and the clip count is known, so it is arithmetic rather than a guess; (3) the tier is echoed on the plan, so two renders of one song can be told apart the way directorId already lets them be; (4) 9.5's model picker stays an engineer's control and mobile never draws it. If a tier cannot be priced honestly before the clips exist, say so on this thread: a number on the call sheet that turns out wrong is worse than no number, and I would rather draw the three tiers with their relative shape and no absolute figure.

## Plan

1. tier: 'demo' | 'standard' | 'hero' on the render body, default 'standard', which must be exactly what a request with no tier does today.
2. Each tier resolves model, rerenderBudgetV1 and the check budget in config/videoModelsV1.ts. One place, so the three differ in arithmetic rather than in prose.
3. estimatedCostUsd for the chosen tier on the state at the review gate, before anything is paid for.
4. Echo the tier on the plan.
5. Update .coord/contracts/api-music-videos.md, which you own.
6. Tell mobile. Our half: a three-way dial on the brief and the number on the call sheet.

## Reason

The brief can draw the dial today and has nothing to put behind it. Without a tier the only cost control is a model name nobody outside this repo should have to understand, and the only cost figure arrives after the render has started spending.

## Related files

src/config/videoModelsV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

The same song rendered at demo, standard and hero differs measurably in model, re-render budget and reported cost; a render with no tier behaves exactly as it does today; and the call sheet can show the cost of the chosen tier before Start filming is pressed.

## Test steps

—

## Thread
2026-11-03T15:20:10+05:30 aquib N: created ticket, status: - -> open
2026-11-03T23:46:38+05:30 aquib N: status: open -> approved
