---
id: JET-453
title: Console v2: manual finance inputs and forecast scenarios (opex, infra invoices, cash, assumptions)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:30+05:30
updated: 2026-11-26T15:35:33+05:30
decisions: D-109
---

## Request

A versioned, finance-entered dataset reusing the BillingConfigV1 draft/publish/rollback pattern: (1) monthly cost lines {month, category (ai-provider:<name>, gcs, compute, db, posthog, email, people, tools, marketing, other), kind fixed|variable, amountUsd, note}; (2) monthly cash on hand; (3) FX rate per month if revenue arrives in INR; (4) forecast scenarios {horizon, inputs with source+confidence, worst/expected/best multipliers}. Compute endpoints: burn by month, runway, scenario projection (deterministic month-by-month), forecast-vs-actual.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b6. Suggested priority: P2.

## Understanding

No infra, opex, cash or invoice data exists. AI prices are hard-coded tables in src/utils/tokenLogger.ts. Burn, runway, break-even and forecasts cannot be computed; measured AI cost cannot be reconciled with real provider invoices. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: New collection FinanceInputV1 (versioned), ScenarioV1 (versioned). Schema: Two new collections; zod schemas exposed via B3 meta. Events: Audit: finance.input.publish, scenario.publish with before/after. Security: Finance and owner only; cash figures are sensitive.

## Plan

1. Confirm feasibility and answer the open questions: Who owns entering these numbers and how often? Currency of record (USD vs INR)? Is a later accounting/billing-export integration (GCP billing export, Zoho/Tally) wanted?
2. Propose the API shape (GET/POST draft/publish/rollback for finance inputs and scenarios; GET /admin/finance/burn, /runway, /scenarios/:id/projection.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Entering the GCS bill for October updates October burn; publishing a scenario freezes its inputs so it can be compared with actuals later.
4. Fill Test steps.
Risks: Manual data goes stale; show last-updated prominently. Dependencies: B5 for measured AI cost inputs.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Runway = cash / trailing-3-month avg net burn (unit-tested); projection reproducible from stored inputs; AI invoice vs measured variance per provider per month.

## Test steps

—

## Thread
2026-11-26T15:07:30+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:06+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
