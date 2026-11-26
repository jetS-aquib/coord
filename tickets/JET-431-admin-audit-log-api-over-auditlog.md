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

1. Do two admin actions on one test user (e.g. suspend then reactivate). 2. `GET /api/admin/audit?target=<userId>`: both, newest first. 3. `GET /api/admin/audit?limit=2` and keep passing nextCursor: no row twice, none missing compared with one big page. 4. Sign in to the app: `GET /api/admin/audit?action=user.login` shows it. 5. `GET /api/admin/audit/<id>` returns one row.

## Thread
2026-11-24T17:04:23+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:49+05:30 aquib N: status: open -> approved
