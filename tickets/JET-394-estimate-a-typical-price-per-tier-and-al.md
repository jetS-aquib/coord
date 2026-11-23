---
id: JET-394
title: Estimate: a typical price per tier, and always say what is left this week
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T15:47:57+05:30
updated: 2026-11-23T16:51:15+05:30
decisions: 
---

## Request

POST /estimate returns tiers [{tier, floor, ceiling}] (musicVideoV1.routes.ts:237-258). All three tiers share the same floor ($2.09 for the Zaaya hook) so they read the same; and allowance is only sent when PostHog limits are enforced (generationLimiter.ts:408), so the app cannot show it reliably.

## Understanding

Assumptions: (1) add tiers[].typical — the expected cost from renderCostV1 at the tier's average retry rate (or the median of recent renders per tier if that data is easy); (2) always include allowance; when limits are off send {unlimited: true} rather than omitting it; (3) no change to how limits are enforced.

## Plan

1. typical per tier in renderCostV1.
2. Always return allowance (unlimited flag when off).
3. Update the app contract note.

## Reason

Ready can show three distinct prices and 'You have 2:10 left this week' before anyone builds a video they cannot afford.

## Related files

src/services/render/renderCostV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/middleware/generationLimiter.ts

## Acceptance criteria

POST /estimate for a 27s window returns three different typical values between floor and ceiling and an allowance object in every environment.

## Test steps

—

## Thread
2026-11-23T15:47:57+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:51:15+05:30 aquib N: status: open -> approved
2026-11-23T17:11:47+05:30 aquib N: Built, not committed. tiers[].typical = floor + half the floor-to-ceiling range (0.5 is a guess until a measured median per tier exists). allowance always sent: {unlimited:true} where limits are off, {unlimited:false, allowanceSeconds, secondsLeft, windowDays} where on. TEST: POST /estimate {seconds:27} -> three different typical values between floor and ceiling, and allowance present.
