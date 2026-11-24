---
id: JET-423
title: Settings: a Credits and usage screen with the balance, limits left, refill date and where the credits went
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-24T12:55:53+05:30
updated: 2026-11-24T13:43:31+05:30
decisions: D-100
---

## Request

Depends on: JET-421. Settings has Appearance, Privacy, Account and About, and nothing about credits. People need to see their balance, what is left today and this week, when it refills, and a breakdown of their usage.

## Understanding

Assumptions: (1) a 'Credits and usage' row at the top of Settings opens a screen; Studio Ink tokens and components only; (2) top: the balance in display type, the plan name, 'Refills with N on <date>' and whether unused credits carry over; (3) limits: three thin bars for today, this week and this month with 'resets at'; (4) breakdown: period switch (week, month); a list by category (Filming, Stills, Planning, Checks, Song and lyrics, Captions, Finishing) with credits and share; tapping a category lists the features in it; a second list by video, with the thumbnail; (5) history: newest first, infinite scroll, refunds shown as '+N refunded: 2 shots failed'; (6) a 'How credits work' sheet whose copy comes from the copy bundle (JET-412) so it can change without a release; (7) frozen and low-balance states; (8) no prices in currency.

## Plan

1. Settings row and the new route.
2. Balance, plan and limit bars from /billing/me.
3. Breakdown from /billing/usage.
4. History from /billing/history.
5. How-credits sheet from copy.
6. Empty, loading, error, frozen and low states.

## Reason

People who are given credits need to see them, and where they went.

## Related files

src/app/(app)/settings.tsx, src/app/(app)/credits.tsx, src/lib/billing.ts

## Acceptance criteria

Settings shows Credits and usage; the screen shows the balance, refill date, three limit bars, a breakdown that adds up to the period's total, and a history with refunds.

## Test steps

1) Open Settings -> Credits and usage row with the balance; 2) open it -> balance, plan, refill date, three bars with reset times; 3) switch Week/Month -> categories change and add up to the total; 4) tap Filming -> its features; 5) scroll history -> a render with its refund line; 6) as a frozen user -> the frozen notice.

## Thread
2026-11-24T12:55:53+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
2026-11-24T13:43:31+05:30 aquib N: status: open -> approved
