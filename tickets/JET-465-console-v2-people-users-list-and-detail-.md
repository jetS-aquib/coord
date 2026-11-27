---
id: JET-465
title: Console v2: People (users list and detail, timeline, danger zone, roles, data export, support grant cap)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:54+05:30
updated: 2026-11-27T15:51:26+05:30
decisions: 
---

## Request

Users pages from music-jetkreate-web/planning/ui-ux-audit/03-04 using the final Users API in .coord/contracts/api-admin.md (JET-448, JET-457, JET-458).
Size: M. Builds on: JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

List: cursor paging (sort=newest), columns email, name, role, status, plan, balance, created; filters as chips. Detail: header with identity, status light, one primary action and an overflow menu; tabs Overview (billing always present now, one balance), Renders, Credits, Activity, Audit, and a Timeline merging audit rows, PostHog events and ledger rows. Danger zone at the bottom of Overview: role change (owner only, C2, roles creator/owner/ops/support/finance/viewer; warn when a third owner is added since D-110 caps owners at 2; note admin roles go only to company Google Workspace accounts), delete (owner, C2, type email). Suspend for support, ban for ops+. Export user data: POST /users/:id/export downloads JSON (owner, support). No view-as (D-110 Q7). Grant credits dialog shows email, current -> new balance; for support the maximum is grantLimit from /me (500). Handle 409 self_action, target_is_admin, last_owner, 400 confirm_mismatch with clear copy.

## Plan

1. List page on DataTable.
2. Detail header, tabs, Timeline.
3. Danger zone and role dialog.
4. Export download.
5. Grant dialog with before -> after and grantLimit.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/users/**, apps/admin/components/account-panel.tsx

## Acceptance criteria

Delete and role change appear only in the danger zone and only for owners; support cannot type more than 500 in Grant; Export downloads a JSON with the user's ledger; the profile and billing tab show the same balance.

## Test steps

—

## Thread
2026-11-26T15:48:54+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:26+05:30 aquib N: status: open -> approved
2026-11-27T16:12:48+05:30 aquib N: BUILT (uncommitted). Users list (cursor/sort headers, filter chips), detail with tabs Overview/Renders/Credits/Activity/Audit/Timeline, danger zone (role C2 with 2-owner warning, delete C2), grant dialog before->after capped by /me grantLimit, JSON export. Plan/balance not on list rows (no per-row fetch). TEST: 1) support grants: can't exceed 500. 2) owner: danger zone at bottom of Overview. 3) More > Export user data -> user-<id>.json with ledger. 4) Overview and Credits show the same balance.
