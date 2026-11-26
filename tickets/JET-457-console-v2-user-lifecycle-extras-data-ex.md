---
id: JET-457
title: Console v2: user lifecycle extras (data export, read-only view-as, announcements, maintenance, push broadcast) - feasibility
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:35+05:30
updated: 2026-11-26T15:35:33+05:30
decisions: D-109
---

## Request

(1) POST /admin/users/:id/export -> async zip (profile, settings, videos metadata, ledger) with a signed URL, expiring. (2) Read-only view-as: feasibility (server-issued read-only token scoped to one user, every request audited) or a richer read-only user detail instead. (3) Announcement/maintenance banner via the copy bundle or a new announcements bundle with schedule and severity; app shows it. (4) Push broadcast to a segment with dry-run count (feasibility, needs mobile).

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b10. Suggested priority: P3.

## Understanding

Delete exists; export, impersonation, announcements and broadcast do not. ui-config has a killSwitch whose app behaviour is unverified. DSAR export requests need engineering; support cannot see what the user sees; no way to tell users about an outage. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: Export job record; announcements bundle. Schema: Export job collection (TTL). Events: Audit: user.export, admin.view_as_started, announcement.publish, push.broadcast. Security: View-as is high risk: read-only, time-boxed, reason required, owner/support only, banner in app? Export URL expiry 24 h.

## Plan

1. Confirm feasibility and answer the open questions: Is view-as wanted at all? DSAR legal requirements (DPDP Act)? Maintenance mode: banner only or block renders too (kill switch exists)?
2. Propose the API shape (As above.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Export completes for a test user and contains their ledger.
4. Fill Test steps.
Risks: Impersonation abuse; keep read-only. Dependencies: Mobile for banner and broadcast.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Feasibility notes per item with effort; export implemented if approved.

## Test steps

—

## Thread
2026-11-26T15:07:35+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:26+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
