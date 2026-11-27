---
id: JET-469
title: Console v2: finance inputs, burn, runway and scenarios (forecast vs actual, freshness after the 10th)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:59+05:30
updated: 2026-11-27T15:51:47+05:30
decisions: 
---

## Request

Runway and forecast pages from music-jetkreate-web/planning/ui-ux-audit/05 §3, §4.5 on /finance/* (.coord/contracts/api-admin.md Finance, JET-453) with D-110 Q3.
Size: M. Builds on: JET-461, JET-462, JET-468. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Owner and finance only. Inputs editor: monthly cost lines (category ai-provider:<name>, gcs, compute, db, posthog, email, people, tools, marketing, other; fixed/variable; amountUsd), month-end cash, revenue (until payments), fx (INR per USD, the month's RBI rate; INR bills converted on entry). Save draft / Make live / Roll back. Freshness: show last-published date; turn it red after the 10th when last month is missing (D-110). Burn: monthly stacked bar by category with net burn line; AI invoice vs measured variance per provider. Runway: cash line, months of runway or "not burning". Scenarios: form with inputs (source, confidence), worst/expected/best multipliers; projection chart dashed with a band; forecast vs actual overlay. Forecast numbers never summed with measured ones.

## Plan

1. Inputs editor with INR entry helper.
2. Burn and AI variance.
3. Runway.
4. Scenario editor and projection chart.
5. Freshness rule (pure function + test).

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/money/{runway,scenarios,inputs}/**

## Acceptance criteria

Entering October GCS and cash then Make live updates October burn and runway; on the 11th with last month missing the freshness badge is red; a projection reloads identically from its stored version.

## Test steps

—

## Thread
2026-11-26T15:48:59+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:47+05:30 aquib N: status: open -> approved
