---
id: JET-426
title: Admin console access: an /api/admin contract and console origins in CORS
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-24T17:04:17+05:30
updated: 2026-11-26T12:37:12+05:30
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

1. Run the backend with ALLOWED_ORIGINS unset. 2. `curl -si -X OPTIONS http://localhost:5006/api/admin/users -H 'Origin: http://localhost:3100' -H 'Access-Control-Request-Method: GET'` shows `Access-Control-Allow-Origin: http://localhost:3100`. 3. Same with Origin http://localhost:5173 still allowed; Origin http://evil.test gets no allow header. 4. Open .coord/contracts/api-admin.md: every route in src/routes/admin.ts is listed.

## Thread
2026-11-24T17:04:17+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:32+05:30 aquib N: status: open -> approved
2026-11-26T12:37:05+05:30 aquib N: BUILT (uncommitted). For web: contract is .coord/contracts/api-admin.md — every /api/admin route, shapes, error codes, paging. Auth = same as app: Bearer access token + request signature (requireSignature), user.role 'admin'; sign in via existing /api/auth/google or email login + /api/auth/refresh, no admin login route. Non-admin = 403 FORBIDDEN; flags.posthog.admin off = 404. CORS: env ALLOWED_ORIGINS (comma list) replaces defaults; defaults now include http://localhost:3100. Prod console origin must be added to ALLOWED_ORIGINS on deploy. Two paging styles: /users and /renders use limit+skip+total; every other list uses cursor+limit -> {items|entries, nextCursor}. Errors are {error, code}; zod failures 400 VALIDATION_ERROR with details. Code: src/index.ts (CORS), src/routes/admin.ts (header points at D-104). No .env.example exists in this repo, so env vars are documented in the contract and src/config/env.ts instead.
2026-11-26T12:37:12+05:30 aquib N: status: approved -> in_progress
2026-11-26T12:37:12+05:30 aquib N: status: in_progress -> review — backend built and tested; see notes and Test steps
