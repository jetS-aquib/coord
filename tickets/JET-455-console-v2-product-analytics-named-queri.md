---
id: JET-455
title: Console v2: product analytics named queries and missing events (activation, adoption, churn, segments)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:33+05:30
updated: 2026-11-26T15:12:12+05:30
decisions: 
---

## Request

New named queries: activation_funnel (signup -> song read -> plan approved -> render completed), time_to_first_render, feature_adoption (recut, reel, share, reshoot, edit as % of WAU), renders_per_active_user, churn (definition below), limit_hits by type, ai_quality (plan_score, $ai_feedback ratio, reshoot rate). Optional segment param (plan, platform, signup cohort). Server events/properties: plan_approved and stills_approved events (verify), person properties plan_id, platform, app_version, signup_source.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b8. Suggested priority: P2.

## Understanding

Named HogQL queries exist for dau/wau/mau, signups, signup_to_first_render, retention_weekly, renders_per_day, render_failures, ai_spend_per_day (src/shared/posthogApi.ts). Server events cover renders, edits, shares, limits. No activation funnel beyond one step, no feature adoption, no churn, no time-to-value, no segmentation by plan or platform. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: PostHog. Schema: None. Events: As listed; mobile client events tracked in JET-373 (status waiting). Security: Same as today.

## Plan

1. Confirm feasibility and answer the open questions: Churn definition (proposal: no activity 28 days after >= 1 completed render)? Which segments matter?
2. Propose the API shape (POST /admin/analytics/query {name, from, to, segment?}.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Funnel returns one row per step with counts.
4. Fill Test steps.
Risks: HogQL cost on large windows; keep the 60 s cache and the 92-day cap. Dependencies: B5 none; JET-373 for client events.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Each named query returns 200 against the live PostHog project (no repeat of the signup_to_first_render UUID bug fixed 2026-11-26); segment=plan splits retention.

## Test steps

—

## Thread
2026-11-26T15:07:33+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:12+05:30 aquib N: status: open -> approved
