---
id: JET-449
title: Console v2: audit log hardening (domain actions, redaction, retention, reads vs writes)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:25+05:30
updated: 2026-11-26T15:35:33+05:30
decisions: D-109
---

## Request

Explicit domain action names with before/after for every write (user.status, user.role, user.quota, billing.grant/freeze/zero/plan, billing.config.publish/rollback, config.activate, flag.update, killswitch.update, content.hide/unhide, asset.*, element.*); reads logged only for PII-sensitive views (user detail, events) or sampled; payload redaction (passwords, tokens, confirm emails -> hash); retention policy; GET /audit supports kind=write|read and returns the actor email.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b2. Suggested priority: P1.

## Understanding

AuditLog records every admin request as admin.<METHOD> <route> with full query and body, IP and user agent, forever (src/routes/admin.ts:53, models/AuditLog.ts). Admin GETs flood it. Real changes are buried under page-view reads; personal data (emails in delete confirm bodies) is stored indefinitely and survives account deletion; no before/after on most writes. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: AuditLog: add kind (write|read), before, after, actorEmail snapshot; TTL index per policy. Schema: New fields + TTL index (retention per answer below). Backfill not required. Events: admin.export for CSV exports; security events: admin.login, admin.login_failed. Security: IP/user agent visible only to owner (B1). Redaction happens before write.

## Plan

1. Confirm feasibility and answer the open questions: Retention period (proposal: 400 days)? Does account deletion purge or anonymise the user's audit rows (GDPR/DPDP)? Keep sampled reads at all?
2. Propose the API shape (GET /admin/audit?kind=write (default) ...; response adds actorEmail, targetLabel. POST /admin/audit/export logs an export event (console CSV exports call it).) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Default audit view shows only writes; each write shows a readable diff.
4. Fill Test steps.
Risks: Changing action names breaks existing filters; keep the old prefix searchable. Dependencies: B1 for role-scoped visibility (can ship before it).

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

No admin.GET rows unless kind=read requested; user delete leaves no plaintext email in payload; TTL index present; every write route emits a named action with before/after (test).

## Test steps

1. Open a few console list pages, then `GET /api/admin/audit`: no admin.GET rows, only writes. 2. Suspend a test user and open their profile: `GET /api/admin/audit` shows `user.status` with before/after and actorEmail; `?kind=read` shows `user.view`. 3. Try `DELETE /api/admin/users/<id> {confirm:'wrong@x.com'}`: the audit row's payload.body.confirm starts with `sha256:` and no plaintext email is anywhere in it. 4. As a non-owner, audit rows have no ip/userAgent. 5. After the post-deploy collMod, `db.auditlogs.getIndexes()` shows timestamp_1 with expireAfterSeconds 34560000.

## Thread
2026-11-26T15:07:25+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:11:55+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:09+05:30 aquib N: BUILT. Contract section 'Audit log'; D-109. Writes get domain names (user.status, billing.grant, …) with before/after; reads are logged only for personal-data views (kind 'read'); sign-ins are kind 'auth'. GET /audit defaults to kind=write, ?kind=read|auth|all, and every row has actorEmail and targetLabel (ip/userAgent for owners only). Redaction happens before writing: secrets become [redacted], emails become sha256:<16 hex>. Retention is 400 days via a TTL index; a deleted user's rows lose ip/userAgent and old plaintext confirm emails. Defaults chosen: 400 days, anonymise rather than purge, no sampled page-view reads. POST /audit/export {what, filters?, rows?}: call it on every CSV export. Old rows keep admin.<METHOD> <route> names; kind=all shows them. admin.login is not a separate action (user.login rows by an admin's id are it); user.login_failed is new. POST-DEPLOY: one collMod per environment (see the handoff note) or the TTL won't apply.
