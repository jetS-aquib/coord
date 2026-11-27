---
id: JET-470
title: Console v2: Growth analytics (activation funnel, retention, adoption, churn, time to first render, segments) and Explore
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:49:01+05:30
updated: 2026-11-27T15:51:56+05:30
decisions: 
---

## Request

Analytics pages on the named queries in .coord/contracts/api-admin.md PostHog section (JET-455) with D-110 Q6 definitions.
Size: M. Builds on: JET-461, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Queries: activation_funnel, time_to_first_render, feature_adoption, renders_per_active_user, churn, limit_hits, ai_quality, plus the existing ones; segment all|plan|cohort only where /meta namedQueries says segmentable; window <= 92 days. Labels use D-110 definitions: active user = any event; activation = completed render within 7 days of signup; churn = 28 days quiet after a completed render; north-star weekly creators with a completed render. Platform and app-version segments are absent until JET-373 (state that on the page). Explore: HogQL editor with label, Cmd/Ctrl+Enter runs, result table, CSV (logged).

## Plan

1. Funnel, retention heatmap with segment selector, adoption bars, churn, time to first render.
2. Definitions shown under each chart title.
3. Explore page.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/analytics/**

## Acceptance criteria

Each chart loads against the live project; switching segment to plan splits retention; every chart states its definition; a failed query shows its error, not empty.

## Test steps

—

## Thread
2026-11-26T15:49:01+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:56+05:30 aquib N: status: open -> approved
