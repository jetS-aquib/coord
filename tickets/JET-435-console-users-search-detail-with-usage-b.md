---
id: JET-435
title: Console users: search, detail with usage, billing, renders, PostHog timeline and audit, and actions
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-24T17:05:06+05:30
updated: 2026-11-24T17:05:06+05:30
decisions: 
---

## Request

Find any user and see and control everything about them.

## Understanding

Table with search and filters; a detail page with tabs Profile, Usage & quota, Billing & ledger, Renders, Activity (PostHog events) and Audit. Actions: suspend, ban, reactivate, make/remove admin, force logout, set quota, delete — every destructive one behind a confirm dialog (delete makes you type the email). Needs JET-428 (users), JET-427 (timeline), JET-431 (audit) and the existing billing admin routes.

## Plan

1. /users table: search, status/role/provider/date filters, paging.
2. /users/[id] tabs as above.
3. Action menu with confirm dialogs and toasts; reload data after each action.
4. Quota override form; billing grant/freeze from the Billing tab reuse W7's components.

## Reason

—

## Related files

apps/admin/app/(console)/users/**

## Acceptance criteria

Suspend a test user -> their app session stops working; reactivate -> it works; their actions appear in the Audit tab.

## Test steps

—

## Thread
2026-11-24T17:05:06+05:30 aquib N: created ticket, status: - -> open
