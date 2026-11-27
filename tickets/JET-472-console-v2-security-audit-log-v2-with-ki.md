---
id: JET-472
title: Console v2: Security (audit log v2 with kinds, diffs, export logging; admins and roles page)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:49:04+05:30
updated: 2026-11-27T15:52:02+05:30
decisions: 
---

## Request

Audit and admin pages on GET /audit (kind=write|read|auth|all), /audit/:id, POST /audit/export and the role routes (.coord/contracts/api-admin.md; JET-448, JET-449) with D-110 Q4-Q5.
Size: S. Builds on: JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Audit: default kind=write; kind tabs; filters actor, action prefix (choices from /meta auditActions), target, date range; actorEmail and targetLabel columns; detail shows a before/after diff; ip and userAgent only for owners; retention note "kept 400 days; anonymised on account deletion" (D-110 Q5); CSV export logged. Admins page: list of users with an admin role, their role, last sign-in, revoke sessions (logout), role change (owner, C2); rules shown: max 2 owners, own accounts only, admin roles only for company Google Workspace accounts with 2-step verification (D-110 Q4).

## Plan

1. Audit list and detail with diff.
2. Admins and roles page.
3. Export logging.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/audit/**, new apps/admin/app/(console)/admins/**

## Acceptance criteria

Opening the audit log shows only writes; a grant shows balance before and after in its detail; a non-owner sees no IP column; the admins page lists every admin role.

## Test steps

—

## Thread
2026-11-26T15:49:04+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:52:02+05:30 aquib N: status: open -> approved
