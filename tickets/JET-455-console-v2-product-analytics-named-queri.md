---
id: JET-455
title: Console v2: product analytics named queries and missing events (activation, adoption, churn, segments)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:33+05:30
updated: 2026-11-26T15:35:33+05:30
decisions: D-109
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

1. `POST /api/admin/analytics/query {name:'activation_funnel',from,to}`: four rows, one per step. 2. Same with `segment:'plan'`: a segment column, `default` for users on the default plan. 3. `retention_weekly` with `segment:'plan'` splits retention by plan. 4. Every name in `/api/admin/meta` namedQueries answers 200 over the last 30 days (each was run against the live project on 2026-11-26). 5. Approve a plan in the app: a `plan_approved` event appears in PostHog for that user.

## Thread
2026-11-26T15:07:33+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:12+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:10+05:30 aquib N: BUILT. Contract section 'PostHog'. New named queries: activation_funnel (one row per step), time_to_first_render, feature_adoption, renders_per_active_user, churn, limit_hits, ai_quality. segment=all|plan|cohort on the ones marked segmentable in /meta (retention_weekly included). The window is capped at 92 days; the 60s cache is kept. Every query and segment combination was run against the live PostHog project on 2026-11-26 and returned 200. Churn default: no activity for 28 days after at least one completed render. Server-side additions: a plan_approved event (afterPreview=true means stills approved), and the plan_id person property when an admin changes a plan (users on the default plan show 'default'). ai_quality has plan_score and reshoot rate but no thumbs ratio: thumbs are in Mongo (GET /feedback), not PostHog. Platform, app_version and signup_source segments need the mobile client events (JET-373).
