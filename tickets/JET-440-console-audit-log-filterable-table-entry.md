---
id: JET-440
title: Console audit log: filterable table, entry detail, links from users and renders
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:13+05:30
updated: 2026-11-26T12:39:19+05:30
decisions: 
---

## Request

See who did what in the console and to whom.

## Understanding

Uses JET-431. Shows actor, action, target, status, time; detail shows the full payload. The same table, filtered by target, is embedded in user and render detail.

## Plan

1. /audit table with actor/action/target/date filters and cursor paging.
2. Detail drawer with payload JSON.
3. Export a filtered page to CSV.
4. Reusable component for the user/render Audit tabs.

## Reason

—

## Related files

apps/admin/app/(console)/audit/**

## Acceptance criteria

Every action taken in the other console modules appears here with the right actor and target.

## Test steps

—

## Thread
2026-11-24T17:05:13+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:39:19+05:30 aquib N: status: open -> approved
2026-11-26T12:57:02+05:30 aquib N: BUILT (uncommitted). /audit with actor, action prefix (with suggestions), target, date filters and cursor paging; /audit/[id] detail with payload JSON; CSV of the current page. The same AuditTable is embedded in user detail (target=user) and render detail (target=jobId). TEST: do an action elsewhere, it appears here with your admin:<id> and the right target.
