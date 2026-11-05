---
id: JET-253
title: Refresh turns every failure into a 401, and a refresh token can never be revoked
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-05T11:42:05+05:30
updated: 2026-11-05T11:42:05+05:30
decisions: 
---

## Request

In auth.service.ts refreshTokens(), the try/catch wraps the DB lookup too, so a Mongo outage or timeout returns 401 'Invalid or expired refresh token' — indistinguishable from a dead token. Mobile now signs the user out on 401 from /api/auth/refresh, so a backend blip logs everyone out. Return 5xx for infrastructure errors and 401 only for a bad/expired token or missing user. Also: refresh tokens are stateless JWTs with no server-side revocation, so logout, password change and suspension do not end a session for up to 7 days, and refresh does not check user.status (requireAuth does, so suspended users get 403 on API calls but can keep minting tokens). And requireAuth passes a valid token whose user row no longer exists (the 'user &&' guard), so a deleted account stays authenticated until the access token expires.

## Understanding

Mobile review of the sign-in path found the app never reacted to a dead session; I fixed that client-side. While tracing /api/auth/refresh I found the server-side items above. I assume refresh tokens staying stateless was a shortcut, not a decision, and that a tokenVersion on the user is the cheapest revocation.

## Plan

1. Narrow the catch in refreshTokens to verify errors only, let DB errors propagate as 5xx. 2. Reject missing or non-active users in refresh. 3. Make requireAuth 401 when the user is missing. 4. Decide and record revocation (tokenVersion in both JWTs, bumped on logout/password change/suspend).

## Reason

Mobile can now tell 'sign in again' from 'could not reach the server' only if the backend uses the status codes honestly. Security hardening on the same path.

## Related files

src/modules/auth/auth.service.ts,src/shared/middleware/requireAuth.ts,src/shared/jwt.ts

## Acceptance criteria

Refresh with DB down returns 5xx, not 401. Refresh for a deleted or non-active user returns 401. requireAuth returns 401 when the user row is missing. Decision recorded on whether refresh tokens get a revocation list or a per-user tokenVersion.

## Test steps

—

## Thread
2026-11-05T11:42:05+05:30 aquib N: created ticket, status: - -> open
