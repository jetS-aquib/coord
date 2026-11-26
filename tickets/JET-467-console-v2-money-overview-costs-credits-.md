---
id: JET-467
title: Console v2: Money overview, costs, credits and unit economics (costs, unit-costs, liability)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-26T15:48:57+05:30
updated: 2026-11-26T15:48:57+05:30
decisions: 
---

## Request

Money pages from music-jetkreate-web/planning/ui-ux-audit/05 §4.1-4.4 on GET /billing/costs, /billing/unit-costs, /billing/liability, /billing/reports, /billing/ledger (.coord/contracts/api-admin.md, JET-452) with D-110 Q1-Q2, Q6.
Size: M. Builds on: JET-461, JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Every figure carries a number badge (Measured, Priced, Estimated, Entered, Projected); "margin" is labelled "price vs cost at rate card", never profit. Overview: AI cost, credits consumed, credit liability (credits and USD), runway tile (from /finance/runway, finance roles only) with deltas and sparklines; cost vs priced line; insights strip. Revenue panel: explicit state "Free credits phase: no sales yet. Packs via RevenueCat after launch + ~6 weeks (D-110)", with collected and recognised shown side by side once revenue exists (recognised = as credits are used; expired paid credits as breakage). Costs: waterfall, stacked bar by provider/feature/model, grouped table drilling to filtered lists, unit-cost cards (per completed render, per render-second, per active creator), waste by reason, estimate accuracy. Credits: credit flow waterfall, liability by plan, low balance, breakage 90d, top spenders, frozen. Pack pricing helper: show 2.5x measured cost per credit after a 15% store fee (D-110 Q1) as a reference line. Definitions on labels: active creator = at least one AI call (D-110 Q6). Ledger table with userEmail.

## Plan

1. Money overview.
2. Costs page with groupBy switch and drill-down URLs.
3. Credits page.
4. Unit economics page and pack price reference.
5. Reconcile: day totals equal /billing/reports for the same range.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/billing/** -> money/**

## Acceptance criteria

Costs total for 7 days equals /billing/reports within $0.01; nothing labelled profit; the revenue panel explains why it is empty; unit-cost cards name their definition.

## Test steps

—

## Thread
2026-11-26T15:48:57+05:30 aquib N: created ticket, status: - -> open
