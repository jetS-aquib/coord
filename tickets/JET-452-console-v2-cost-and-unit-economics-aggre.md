---
id: JET-452
title: Console v2: cost and unit-economics aggregates (AI cost by provider/feature/user/render, credit liability)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-26T15:07:29+05:30
updated: 2026-11-26T15:07:29+05:30
decisions: 
---

## Request

GET /admin/billing/costs?from&to&groupBy=day|provider|model|feature|category|user|plan&filters (userId, model, provider, feature, planId): rows {key, calls, tokens, seconds, costUsd}. GET /admin/billing/unit-costs: cost per completed render, per render-second, per active user (WAU/MAU from PostHog or distinct userIds in GenerationLog), waste (cost on failed/cancelled renders by reason), estimate accuracy (renderCostV1 floor/ceiling vs measured). GET /admin/billing/liability: sum of balances, by plan, low-balance count, breakage (expired/issued 90d).

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b5. Suggested priority: P1.

## Understanding

GenerationLog stores costUsd, tokens, model, category, feature, jobId, userId, durationMs per AI call; /billing/reports only groups by day and model. Credit balances live in CreditAccountV1. Finance cannot see cost by provider or feature, cost per render or per active user, waste on failed renders, estimate accuracy, or total credit liability. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: GenerationLog + RenderPlanV1 + CreditAccountV1 + CreditLedgerV1 (all exist). Provider derivable from model (map) or a new field. Schema: Indexes on GenerationLog {createdAt, model}, {createdAt, feature}; maybe a provider field; optional daily rollup collection if queries are slow. Events: None. Security: Finance and owner (B1); user-level rows include email.

## Plan

1. Confirm feasibility and answer the open questions: How is "active user" defined for cost per active user (PostHog WAU vs had an AI call)? Should infra cost entered via B6 be allocated per user (proposal: no, show unallocated)?
2. Propose the API shape (As above; same filter vocabulary as list endpoints so the console can drill down.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Costs grouped by day for a range equal /billing/reports totals for the same range.
4. Fill Test steps.
Risks: Aggregation cost on large GenerationLog; rollups may be needed. Dependencies: None.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Totals reconcile with /billing/reports within $0.01; per-render cost for a jobId equals /renders/:jobId callsCostUsd; liability equals sum of balances; 92-day query < 2 s on current data.

## Test steps

—

## Thread
2026-11-26T15:07:29+05:30 aquib N: created ticket, status: - -> open
