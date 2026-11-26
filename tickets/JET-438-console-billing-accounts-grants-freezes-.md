---
id: JET-438
title: Console billing: accounts, grants, freezes, ledgers, cost vs credits report, rate cards and plans
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:11+05:30
updated: 2026-11-26T12:39:12+05:30
decisions: 
---

## Request

Run billing from the console.

## Understanding

Uses /admin/billing (JET-422: users/:id, freeze/unfreeze/zero/grant/plan, reports, rate-card preview, draft/publish/rollback for rate cards and plans) and JET-430's ledger browse. Editing a rate card or plan is draft -> preview -> publish, with rollback.

## Plan

1. /billing overview: cost vs credits report.
2. Account panel (reused in user detail): balance, plan, grant, freeze, zero.
3. /billing/ledger browse.
4. /billing/rate-cards and /billing/plans: versions, JSON form editor for drafts, preview diff, publish, rollback.

## Reason

—

## Related files

apps/admin/app/(console)/billing/**

## Acceptance criteria

Granting credits to a test user changes their balance in the app; a published rate card can be rolled back.

## Test steps

—

## Thread
2026-11-24T17:05:11+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:39:12+05:30 aquib N: status: open -> approved
2026-11-26T12:57:02+05:30 aquib N: BUILT (uncommitted). /billing cost vs credits report (stats, charts, ledger by type, top spenders, frozen, by day/model table); /billing/ledger browse with filters; /billing/account?userId= account panel (also the user Billing tab): grant/adjust with a per-render idempotency key, change plan, freeze/unfreeze, zero; /billing/config/{rate-card,plans,settings}: versions, live vs selected side by side, rate-card preview vs live, JSON draft editor, publish, rollback. TEST: grant 10 credits -> app balance +10; publish a rate card then roll back.
