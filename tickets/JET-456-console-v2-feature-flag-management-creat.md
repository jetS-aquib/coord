---
id: JET-456
title: Console v2: feature flag management (create, targeting, multivariate, usage)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:34+05:30
updated: 2026-11-26T15:35:33+05:30
decisions: D-109
---

## Request

Create flag (key, description, default off); target by user id/email list and person properties; allow/deny lists; multivariate variants (Phase 3); archive; per-flag evaluation counts (from PostHog $feature_flag_called if available).

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b9. Suggested priority: P2.

## Understanding

PATCH /admin/posthog/flags/:key supports active, rolloutPercentage (single condition only, else 409 flag_too_complex) and payload. No create, targeting or delete. Ops must go to PostHog to create a flag or target internal testers, splitting the audit trail. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: PostHog flags API. Schema: None. Events: Audit: flag.create/update/archive with before/after. Security: Ops+; refuse edits to kill switches through this route (they have their own).

## Plan

1. Confirm feasibility and answer the open questions: Should flags stay PostHog-managed long-term (D-089) or is a local store wanted?
2. Propose the API shape (POST /admin/posthog/flags, PATCH with conditions, DELETE (archive), GET /admin/posthog/flags/:key/usage.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Targeting an email list makes the flag true for those users within ~30 s (local evaluation poll).
4. Fill Test steps.
Risks: PostHog API rate limits; personal API key scope needs feature_flag:write (exists). Dependencies: B2 for audit shape.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Create, target, archive work against PostHog; audit has before/after; kill switch keys refused.

## Test steps

1. `POST /api/admin/posthog/flags {key:'test-flag-console',description:'test'}`: created off at 0%. 2. `PATCH /api/admin/posthog/flags/test-flag-console {active:true, allowEmails:['<your email>']}`: in PostHog the flag has a distinct_id condition with your user id (no email); within ~30s the server evaluates it true for you. 3. `GET /api/admin/audit?action=flag.` shows create and update with before/after. 4. `PATCH /api/admin/posthog/flags/renders-enabled {active:false}` is 409 use_killswitch_route; `POST /api/admin/killswitches/renders-enabled {on:false}` needs a recent sign-in. 5. `DELETE /api/admin/posthog/flags/test-flag-console` archives it.

## Thread
2026-11-26T15:07:34+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:19+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:10+05:30 aquib N: BUILT. Contract section 'PostHog'. POST /posthog/flags (created off at 0%). PATCH now also takes conditions (replaces release conditions, person properties), allowUserIds/allowEmails and denyUserIds/denyEmails. Emails become user ids on the server, so no email goes to PostHog. Lists are distinct_id conditions, which posthog-node evaluates locally, so the server sees them within ~30s. DELETE archives (soft delete, switched off). GET /posthog/flags/:key/usage reads $feature_flag_called; the server evaluates without sending those, so only client evaluations count. Kill switches are refused on these routes (409 use_killswitch_route) and have GET /killswitches and POST /killswitches/:key {on}; turning one off is C2. Multivariate is not editable here (Phase 3). Flags stay in PostHog (D-089); no local store.
