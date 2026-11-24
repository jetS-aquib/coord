---
id: JET-422
title: Admin billing API: rate cards, plans, switches, per-user grants and freezes, ledgers, and a cost vs credits report
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-24T12:55:52+05:30
updated: 2026-11-24T12:56:05+05:30
decisions: D-100
---

## Request

Depends on: JET-416, JET-418, JET-419, JET-420. When the admin panel is built it needs everything configurable: cost per call per model, plans and limits, the free-reshoot switch, and per-user control. This request is the API; the panel is a separate repo that does not exist yet.

## Understanding

Assumptions: (1) under /api/admin (requireAdmin, auditAdmin, as JET-372 A6); (2) rate card, plans and settings: list versions, read active, create draft, publish, rollback (the routes from JET-416, grouped here); (3) per user: account and ledger, grant/adjust credits with a reason (ledger entry), change plan, freeze/unfreeze; (4) reports: per day and per model: credits charged, USD cost, margin; top spenders; refund totals; frozen accounts; (5) every write is audited with before/after; (6) a dry run: POST a draft rate card to /preview to see what last week's usage would have cost under it.

## Plan

1. Routes for users, ledger, grants, freeze.
2. Reports by aggregation.
3. The draft preview.
4. Extend api contracts.
5. Tests: grant writes one ledger entry and an audit row; the report sums match the ledger.

## Reason

Puts every billing number under admin control, ready for the panel.

## Related files

src/routes/admin.ts, src/modules/billing/*, .coord/contracts/api-billing.md

## Acceptance criteria

An admin grants 500 credits with a reason and the user's /me shows it; the report shows yesterday's credits and USD cost per model; a draft preview shows the difference a price change would have made.

## Test steps

1) POST /api/admin/billing/users/<id>/grant {credits:500, reason} -> ledger entry, AuditLog row; 2) GET /api/admin/billing/reports?from=&to= -> per model credits, cost, margin; 3) POST /api/admin/billing/users/<id>/freeze -> /me shows frozen and spending returns 403 account_frozen; 4) POST a rate card draft to /preview -> old vs new totals for last week.

## Thread
2026-11-24T12:55:52+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
