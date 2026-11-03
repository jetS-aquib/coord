---
id: JET-243
title: A budget a producer picks, demo or standard or hero, and the cost before the money rather than after
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-03T15:20:10+05:30
updated: 2026-11-04T00:39:08+05:30
decisions: D-068, D-069
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

All on a project with a saved storyboard. The log lines quoted are from
`renderOrchestratorV1`.

1. **Nothing changes for a client that says nothing.** `POST
   /api/v1/music-videos/:id/render` with no `tier`. The state reads
   `"tier": "standard"`, `estimatedCostUsd` is what it has always been, and the log's
   `re-render budget: N/<cap>` cap is `ceil(clips/5)` — the same number as before.
   `modelKey` still comes off the project record.
2. **demo is one take of each shot.** `POST .../render` with
   `{ "tier": "demo", "review": true }` -> 202, status `review`. `GET
   /api/v1/music-videos/render/:jobId/call-sheet` shows `"tier": "demo"` and
   `costCeilingUsd` equal to `estimatedCostUsd`. Accept it and watch the log: no
   `frame gate:` line, no `clip check:` line, and the budget cap is `0`.
3. **hero pays to re-shoot.** Same with `{ "tier": "hero", "review": true }`. The call
   sheet's `costCeilingUsd` is about 1.5x `estimatedCostUsd`; the log's budget cap is
   `ceil(clips/2)` and the gate and clip-check lines are both there.
4. **The number is there before the money.** In steps 2 and 3 both figures are on the
   call sheet while the render is still `review` — nothing has been drawn yet.
5. `POST .../render` with `{ "tier": "platinum" }` -> 400 from the body schema.
6. **Expected, and the deferred half:** all three renders report `"modelKey": "omni"`.
   Tiers do not differ in model yet — see the thread and D-068.
7. A render started before this change (an existing plan in the database) still polls
   and resumes; its state reads `"tier": "standard"`.

## Thread
2026-11-03T15:20:10+05:30 aquib N: created ticket, status: - -> open
2026-11-03T23:46:38+05:30 aquib N: status: open -> approved
2026-11-03T23:48:02+05:30 aquib N: status: approved -> in_progress — picked it up
2026-11-03T23:54:06+05:30 aquib N: linked decision D-068 (A render tier buys checking and re-shooting, not a cheaper model)
2026-11-03T23:54:20+05:30 aquib N: Built, with one half of the 'done when' deferred and that is the thing to read before closing it.

Tiers differ measurably in re-render budget (demo 0, standard a fifth of the clips, hero half), in whether the frame gate and the clip check run at all, and in reported cost. They do NOT differ in model: omni is the only model the v1 pipeline can render — generateClipV1 speaks the Interactions API and startRenderV1 refuses every BytePlus row — so a tier pointed at seedance-1-5-pro would 400 every render on that tier. The modelKey field on the tier is wired and read, and a test asserts all three resolve a google-omni model, so the day a provider is renderable 'demo at half price' is one row. D-068 records the trade. Say the word and I will file that as its own request.

On your pricing worry: the number can be honest, so I did not fall back to relative shape. estimatedCostUsd is a floor (nothing re-shot) and costCeilingUsd is the most the tier's budget can add — both arithmetic over a plan that already exists, both on the state payload and the call sheet before anything is bought. 31 clips of 8s: demo $24.80 flat, standard $24.80-30.40, hero $24.80-37.60.
2026-11-03T23:54:46+05:30 aquib N: status: in_progress -> review — Built: tier on the render body resolving the model, the re-render budget and the two check budgets server-side (RENDER_TIERS_V1, one table), tier stored and echoed on the plan, and estimatedCostUsd + costCeilingUsd on the state payload and the call sheet before anything is bought. Contract updated, D-068 records the trade. The model half of the 'done when' is deferred and explained on the thread — read that before closing. Mobile's half is yours: the three-way dial, and a floor-to-ceiling range rather than one figure.
2026-11-04T00:02:38+05:30 aquib N: Filed the provider half as JET-248 (waiting on your approve). It is not a swapped base URL: seedance cannot pin a closing frame, so a cheaper demo means a different continuity model, and that is written up in its Understanding.
2026-11-04T00:39:08+05:30 aquib N: linked decision D-069 (A render's cost is itemised, and the lines we cannot predict are counted rather than guessed)
