---
id: JET-448
title: Console v2: admin roles and permissions, admin MFA, re-auth for risky actions
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-26T15:07:24+05:30
updated: 2026-11-26T15:38:10+05:30
decisions: D-109
---

## Request

Roles owner, ops, support, finance, viewer (proposal; final list is a business call). A permission map per admin route (route -> required permission). GET /admin/me returns {role, permissions[]} so the console can filter nav and hide actions. Assign role (owner only). Admin MFA (feasibility). Recent-auth check: C2 actions (delete user, make live pricing, kill switch off, zero balance) require a login within the last 10 minutes.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b1. Suggested priority: P1 (Phase 2 build; decide roles in Phase 0).

## Understanding

Every admin can do everything: access is a single User.role === "admin" check (src/routes/admin.ts:46). Support staff and finance will join; least privilege is needed before that. No way to let support suspend users without also letting them change pricing, delete users or flip kill switches. No MFA on an account that can delete users and change prices. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: User.role extended (or a separate adminRole), permission map in code; MFA factor per admin; token auth_time claim. Schema: User.role enum widened (creator|admin|owner|ops|support|finance|viewer) or new field; no migration of existing admins beyond mapping admin -> owner. Events: Audit: admin.role_change with before/after; admin.mfa_enrolled/reset. Security: Owner-only role changes; last-owner guard (like last_admin today); permission checks server-side only (console hiding is cosmetic).

## Plan

1. Confirm feasibility and answer the open questions: Final role list and what each can do (business). MFA: Firebase Auth MFA (TOTP/SMS) vs TOTP in the backend for email/password admins? Support grant limit N?
2. Propose the API shape (GET /admin/me; POST /admin/users/:id/role accepts the new roles; 403 code PERMISSION_DENIED {permission}; 401 code REAUTH_REQUIRED for stale auth on C2 routes.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: A support user calling PUT /billing/rate-card publish gets 403 PERMISSION_DENIED; the console never shows that button for them.
4. Fill Test steps.
Risks: Firebase MFA only covers Google/Firebase sign-in, not the backend email/password flow; may need TOTP in-house. Re-auth UX needs a token auth_time claim. Dependencies: None. Unblocks F2.15 and role-filtered nav.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Each admin route declares a permission; a test asserts every /api/admin route has one; viewer can GET but not write; support can suspend but not grant > N credits; owner can change roles; C2 routes reject tokens older than 10 min with REAUTH_REQUIRED.

## Test steps

1. `GET /api/admin/me` as dev.khanna (role admin = owner): role owner, every permission. 2. In Mongo set a test account's role to `support` and sign in as it: `GET /api/admin/me` lists billing.grant but not users.delete; `POST /api/admin/billing/users/<id>/grant {credits:600,reason:'x'}` is 403 PERMISSION_DENIED, 50 credits works; `POST /api/admin/billing/rate-card/<v>/publish` is 403. 3. As viewer: GETs work, `POST /api/admin/users/<id>/status` is 403 PERMISSION_DENIED with details.permission. 4. As owner, wait 11 minutes after signing in (refreshes don't count) and `DELETE /api/admin/users/<id>`: 401 REAUTH_REQUIRED; sign in again and it goes through. 5. `POST /api/admin/users/<id>/role {role:'ops'}` as owner works; as ops it is 403.

## Thread
2026-11-26T15:07:24+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:11:51+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:08+05:30 aquib N: BUILT (backend). For the web session: contract .coord/contracts/api-admin.md, sections 'Access' and 'Me, search, meta'; decision D-109. Roles are owner|ops|support|finance|viewer; existing role 'admin' = owner, no migration. GET /api/admin/me gives {role, permissions[], recentAuth, grantLimit}; filter the nav and buttons from permissions[] (GET /meta has rolePermissions). A refusal is 403 {code:'PERMISSION_DENIED', details:{permission}}. A C2 route without a sign-in in the last 10 min is 401 {code:'REAUTH_REQUIRED'}: send the admin through sign-in again, then retry. C2 = delete user, role change, zero balance, billing make live / rollback, kill switch off. Support's grant cap is 500 credits (adminAccess.ts SUPPORT_GRANT_LIMIT_V1). The permission table is in src/routes/adminAccess.ts, and adminAccess.test.ts fails if a route has none. MFA FEASIBILITY (not built): Firebase MFA would only cover Google/Firebase sign-in, not our email/password login, so recommend TOTP in the backend for every admin regardless of how they sign in. Flow: enrol (secret + otpauth URL), verify a code, then a token claim that C2 routes also check; an owner can reset someone's MFA (admin.mfa_reset). That needs one new dependency (otplib, needs a decision record) and a recovery policy. About 1–1.5 days backend plus console screens. Say go if wanted.
2026-11-26T15:38:10+05:30 aquib N: status: approved -> in_progress
2026-11-26T15:38:10+05:30 aquib N: status: in_progress -> review — built; see the BUILT note and Test steps
