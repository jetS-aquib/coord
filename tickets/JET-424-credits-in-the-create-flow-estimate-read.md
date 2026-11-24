---
id: JET-424
title: Credits in the create flow: estimate, Ready, stopped renders and out-of-credit and limit states
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-24T12:55:55+05:30
updated: 2026-11-24T12:56:05+05:30
decisions: D-100
---

## Request

Depends on: JET-419, JET-421. Ready shows dollar estimates and 'left this week' in seconds. With credits, every place that prices or refuses should speak credits, and running out should offer a way forward.

## Understanding

Assumptions: (1) Ready shows 'about N credits · you have M' per tier (floor and typical from /estimate), no currency; (2) when it does not fit: Film now disabled with the reason above it and two ways forward, a shorter part of the song or a cheaper tier; (3) daily or weekly limit reached: says which, and when it resets (resetsAt); (4) a 402 insufficient_credits on any AI call (brief, special request, song read) shows one consistent sheet with the balance and the next refill; (5) a stopped render shows what was refunded; (6) frozen accounts get one plain message and a support link; (7) the 'left this week' seconds line is removed.

## Plan

1. Estimate and Ready in credits.
2. The can't-afford state with shorter/cheaper actions.
3. Limit-reached state with the reset time.
4. One insufficient-credits sheet for 402 from any call.
5. Stopped-render refund line.
6. Frozen state.

## Reason

Credits only make sense if every price and refusal in the app uses them.

## Related files

src/app/(create)/ready.tsx, src/lib/generation.ts, src/features/create/*, src/app/(create)/working/[id].tsx

## Acceptance criteria

Ready shows credits for each tier and the balance; with too few credits Film now is disabled and offers a shorter part or a cheaper tier; at the daily limit it says when it resets; a stopped render shows the refund.

## Test steps

1) Open Ready with 1000 credits -> each tier in credits, 'you have 1000'; 2) set balance to 10 -> Film now disabled, reason shown, Shorter and Cheaper offered; 3) reach the daily limit -> 'resets at midnight' message; 4) with 0 credits tap special request Understand -> the insufficient-credits sheet; 5) a render with refused clips -> 'N credits refunded' on its page.

## Thread
2026-11-24T12:55:55+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
