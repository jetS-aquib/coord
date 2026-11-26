---
id: JET-427
title: PostHog through the backend: analytics queries, a user's event timeline, and feature flag control
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:18+05:30
updated: 2026-11-26T12:23:35+05:30
decisions: 
---

## Request

Admin routes that read PostHog analytics, a person's events, and list and change feature flags, so the console never holds PostHog keys (D-104).

## Understanding

src/shared/posthog.ts only captures events and evaluates flags; it never calls PostHog's REST API. Reading data needs a personal API key (phx_) plus the project id, both backend env only. Named queries keep HogQL out of the console; a raw HogQL box is for admins, with a row cap. A flag change must be audited (auditAdmin already logs every admin request with its body). Assumptions: EU cloud host from POSTHOG_HOST; responses cached ~60s in memory to save PostHog rate limit (single instance per memory note); distinct_id = Mongo user id (JET-372).

## Plan

1. env: POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID (optional; routes return 503 posthog_not_configured without them).
2. src/shared/posthogApi.ts: tiny fetch wrapper for /api/projects/:id/query and /feature_flags.
3. POST /admin/analytics/query {name, from, to}: named queries dau/wau/mau, signups, signup_to_first_render funnel, retention weekly, renders_per_day by status, render_failures by reason, ai_spend_per_day. Plus {hogql} raw, LIMIT capped at 1000.
4. GET /admin/users/:id/events?cursor: that person's recent events.
5. GET /admin/posthog/flags; PATCH /admin/posthog/flags/:key {active?, rolloutPercentage?, payload?}.
6. Check that the server events cover every named query; add missing captures.
7. Tests for the query builder and the flag patch body validation.

## Reason

Dashboards, the per-user timeline and the control room (W3, W4, W8) depend on it.

## Related files

src/shared/posthogApi.ts (new), src/routes/admin.ts, src/config/env.ts, .env.example, .coord/contracts/api-admin.md

## Acceptance criteria

Each named query returns rows for a staging project; a user's events come back newest first; toggling a flag from the API shows in PostHog and in AuditLog; with no key set every route answers 503 posthog_not_configured.

## Test steps

1. Without POSTHOG_PERSONAL_API_KEY: `POST /api/admin/analytics/query {name:'dau',from,to}` answers 503 posthog_not_configured. 2. Set POSTHOG_PERSONAL_API_KEY (phx_, query:read + feature_flag:write) and POSTHOG_PROJECT_ID on staging. 3. Run each named query (dau, wau, mau, signups, signup_to_first_render, retention_weekly, renders_per_day, render_failures, ai_spend_per_day) for the last 14 days: each returns columns + rows. 4. `GET /api/admin/users/<your id>/events`: newest first. 5. `PATCH /api/admin/posthog/flags/<a test flag> {active:false}`: PostHog UI shows it off; `GET /api/admin/audit?action=admin.posthog.flag` shows before/after.

## Thread
2026-11-24T17:04:18+05:30 aquib N: created ticket, status: - -> open
2026-11-24T17:05:23+05:30 aquib N: Decision: D-104 (console reaches PostHog only through the backend). Unlocks JET-434, JET-435 Activity tab, JET-439.
2026-11-26T12:23:35+05:30 aquib N: status: open -> approved
