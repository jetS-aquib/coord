---
id: JET-419
title: Charging: reserve before a render, settle after it, refund failed shots behind a switch, and charge every other AI call
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-24T12:55:48+05:30
updated: 2026-11-24T12:56:05+05:30
decisions: D-100
---

## Request

Depends on: JET-417, JET-418. Every AI call is billed. Renders need a reserve/settle flow so a running render cannot overspend, and failed or refused shots are refunded behind a reversible switch (freeReshoots), which may be turned off later.

## Understanding

Assumptions: (1) render start reserves the tier's ceiling estimate in credits (renderCostV1, now in credits), refused if the balance or a limit cannot cover it; the rate card version and freeReshoots are frozen on the plan at start; (2) while it runs, every metered call with that jobId accrues against the reservation; at the end (done, failed, cancelled, deleted) it settles: charge = the sum of metered credits, minus failed/refused/re-shot clips when freeReshoots was on at start; the rest is refunded; (3) if a render's metered total passes its reservation (a re-shoot storm), it tops up the reservation and pauses if it cannot, rather than going negative; (4) calls outside a render (song read, brief, special request, director ranking, recut, reel, captions) are charged per call as they happen; each needs a small minimum balance before it starts, else 402 {code:'insufficient_credits'}; (5) the estimate route, render state and call sheet return credits (floor, typical, ceiling) next to the USD figures, which stay for admins; (6) the spend breaker (dailySpendUsd) and renders-enabled stay as platform guards; (7) billingEnforced=false in settings makes everything log and charge but never refuse (the soft launch mode).

## Plan

1. reserveRenderV1 at startRenderV1 and create-and-render; settleRenderV1 on every terminal state, idempotent per jobId.
2. Freeze rateCardVersion and freeReshoots on RenderPlanV1.
3. chargeCallV1 for non-render calls, with the minimum-balance pre-check.
4. Estimate, render state and call sheet in credits.
5. Replace checkRenderLimitV1's seconds check with balance and limits.
6. Tests: settle refunds failed clips only with freeReshoots on; a render cancelled halfway refunds the rest; reserve refused when it does not fit; billingEnforced off never refuses.

## Reason

Users pay for what they got, the platform never overspends, and free reshoots can be withdrawn without a deploy.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/renderCostV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/middleware/generationLimiter.ts, src/models/RenderPlanV1.ts, src/modules/billing/*

## Acceptance criteria

A render with 2 refused clips settles with those clips refunded when freeReshoots is on and charged when it was off at start; cancelling halfway refunds the unfilmed part; a render that does not fit the balance is refused before any call; a special request with no credits returns 402.

## Test steps

1) Balance 1000; start a standard render -> a reserve entry equal to the ceiling; 2) let it finish -> a settle entry, and a refund of the difference; 3) force 2 refused clips -> they appear as refunded in the settle meta; 4) turn freeReshoots off, render again -> they are charged; 5) set balance to 5, POST /special/understand -> 402 insufficient_credits; 6) set billingEnforced off -> the same call works and is still charged.

## Thread
2026-11-24T12:55:48+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
