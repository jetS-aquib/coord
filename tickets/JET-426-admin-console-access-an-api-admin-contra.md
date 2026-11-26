---
id: JET-426
title: Admin console access: an /api/admin contract and console origins in CORS
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:17+05:30
updated: 2026-11-26T12:23:32+05:30
decisions: 
---

## Request

Document every /api/admin route in a contract the console can build against, and let the console's origins through CORS.

## Understanding

The console (music-jetkreate-web/apps/admin) calls the backend from its Next.js server, signed exactly like the mobile app (requireSignature) and as a user whose role is 'admin'. Server-to-server calls ignore CORS, but the login redirect and any future client calls need the origin listed. ALLOWED_ORIGINS is hard-coded at src/index.ts:31. No contract covers /api/admin or /api/admin/billing today. Assumption: the console signs in through the existing /api/auth/google and /api/auth/refresh routes and no new auth route is needed.

## Plan

1. Write .coord/contracts/api-admin.md: every /api/admin and /api/admin/billing route with auth, query/body, response shape and error codes.
2. Read ALLOWED_ORIGINS from env (comma list), keeping today's entries as the default; add http://localhost:3100.
3. Update the src/routes/admin.ts header comment to point at D-104.

## Reason

W2 (console shell and auth) can't start without a stable admin API shape.

## Related files

src/index.ts, src/routes/admin.ts, .coord/contracts/api-admin.md, .env.example

## Acceptance criteria

Contract lists every admin route; a request from origin http://localhost:3100 gets CORS headers; existing origins still work.

## Test steps

—

## Thread
2026-11-24T17:04:17+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:32+05:30 aquib N: status: open -> approved
