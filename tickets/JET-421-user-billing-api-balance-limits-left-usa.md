---
id: JET-421
title: User billing API: balance, limits left, usage broken down by feature and model, and a history of charges and refunds
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-24T12:55:51+05:30
updated: 2026-11-24T12:56:05+05:30
decisions: D-100
---

## Request

Depends on: JET-417, JET-418, JET-419. The app needs to show a person their credits, what is left today and this week, and where their credits went, broken down.

## Understanding

Assumptions: (1) GET /api/v1/billing/me -> {balance, plan {name, refill {amount, period, nextAt}, rollover on/off}, limits {day, week, month: {used, limit, resetsAt}}, frozen, freeReshoots, lowBalance}; (2) GET /api/v1/billing/usage?period=day|week|month|custom -> totals by category (planning, stills, clips, checks, song, lyrics, captions, stitch), by feature, and by project (title, thumbnail), from GenerationLog credits; models shown by display name only, not provider ids; (3) GET /api/v1/billing/history?cursor= -> ledger entries newest first, each with a label the app can show ('Video: Zaaya', 'Monthly refill', 'Refund: 2 shots failed'), credits, balanceAfter, and for a render its breakdown; (4) all three are reads, cheap, cached nothing; (5) USD never appears in these responses.

## Plan

1. Three routes and their response shapes.
2. Aggregations on GenerationLog and the ledger with the new indexes.
3. Labels for each entry type.
4. Contract section in .coord/contracts (billing).
5. Tests: shapes, a render breakdown sums to its settle, pagination.

## Reason

Users see their credits and where they went, which is the first thing they ask once credits exist.

## Related files

src/modules/billing/billing.routes.ts, src/routes/index.ts, .coord/contracts/api-billing.md

## Acceptance criteria

After one render and one special request, /me shows the balance and limits left; /usage?period=week lists clips, stills, planning and special_request with credits that add up to the week's charges; /history shows the render with its refund line.

## Test steps

1) GET /api/v1/billing/me -> balance, plan, limits with resetsAt; 2) GET /api/v1/billing/usage?period=week -> categories and projects; totals equal the sum of the week's charges; 3) GET /api/v1/billing/history -> newest first, cursor works; a render entry has a breakdown; 4) no response contains a USD figure.

## Thread
2026-11-24T12:55:51+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
