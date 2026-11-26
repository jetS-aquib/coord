---
id: JET-431
title: Admin audit log API over AuditLog
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:23+05:30
updated: 2026-11-26T12:23:49+05:30
decisions: 
---

## Request

A filtered, paged read of AuditLog for the console's audit page and the user/render detail pages.

## Understanding

auditAdmin writes every admin request to AuditLog (actor, action, target, payload, ip, ua, timestamp), and indexes exist on actor, action, target and timestamp. Nothing reads it. Assumption: payload bodies can hold emails, so the response returns them as stored to admins only; no redaction beyond what auditAdmin already writes.

## Plan

1. GET /admin/audit?actor&action&target&from&to&cursor (cursor = timestamp+_id, limit 50).
2. GET /admin/audit/:id.
3. Check that auth events (login, delete, signup) also land in AuditLog; add any missing.
4. Test the cursor paging.

## Reason

—

## Related files

src/routes/admin.ts, .coord/contracts/api-admin.md

## Acceptance criteria

Filtering by target=<userId> returns that user's admin actions newest first; paging never repeats or skips a row.

## Test steps

—

## Thread
2026-11-24T17:04:23+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:49+05:30 aquib N: status: open -> approved
