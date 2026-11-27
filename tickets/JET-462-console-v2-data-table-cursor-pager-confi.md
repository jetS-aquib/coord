---
id: JET-462
title: Console v2: data table, cursor pager, confirm dialog levels and re-auth (REAUTH_REQUIRED) handling
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:50+05:30
updated: 2026-11-27T15:51:13+05:30
decisions: 
---

## Request

One table and one confirm pattern for every page (music-jetkreate-web/planning/ui-ux-audit/02 §5, 07 confirm levels, doc 08 F0.3-F0.4), using the final paging, user labels and re-auth rules in .coord/contracts/api-admin.md (JET-448, JET-450, JET-458).
Size: M. Builds on: JET-460. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Backend now: cursor paging everywhere ({..., nextCursor}), userEmail on every row that names a user, errors {status, code, message, details}, 401 REAUTH_REQUIRED on C2 routes when the last real sign-in is older than 10 minutes (D-109), 403 PERMISSION_DENIED {details.permission}. DataTable: sticky header, th scope, sortable columns, density toggle (compact 32px / comfortable 40px, cookie), email + mono id with copy, sticky first column on mobile, CSV export that calls POST /audit/export first. ConfirmDialog: C1 (object echo, reason), C2 (plus type-to-confirm, impact summary), before -> after preview slot for money actions, aria-labelledby, focus first field, aria-live result. On REAUTH_REQUIRED the dialog asks the admin to sign in again (Google popup or password) and retries once. On PERMISSION_DENIED it says which permission is missing.

## Plan

1. DataTable + CursorPager in packages/ui.
2. ConfirmDialog C1/C2 replacing ActionButton internals; keep act() as the only write path.
3. Re-auth flow: server action returns REAUTH_REQUIRED, dialog shows sign-in, then retries.
4. CSV export logs via POST /audit/export.
5. Migrate the existing tables and actions to them.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

packages/ui/src/components/{data-table,confirm-dialog}.tsx, apps/admin/components/client.tsx, apps/admin/lib/actions.ts

## Acceptance criteria

An admin who signed in > 10 minutes ago and deletes a test user is asked to sign in again, then the delete goes through; a support account sees "needs billing.write" when granting 600; every exported CSV appears in the audit log as admin.export.

## Test steps

—

## Thread
2026-11-26T15:48:50+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:13+05:30 aquib N: status: open -> approved
