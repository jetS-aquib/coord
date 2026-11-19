---
id: JET-364
title: Release: delete my account — required by App Store and Play before launch
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T12:27:09+05:30
updated: 2026-11-19T12:27:09+05:30
decisions: 
---

## Request

An authenticated DELETE /api/users/me that removes the account and everything it owns.

## Understanding

There is no account deletion endpoint. Apple (5.1.1(v)) and Google Play both require in-app account deletion for apps with sign-up. Assumptions: (1) hard delete, not soft: User, MusicVideo projects, RenderPlanV1, uploaded songs, quotas, share links; (2) GCS objects under the user's renders are deleted best-effort in the background — the response does not wait on them; (3) the Firebase Auth user is deleted too; (4) a render in progress is cancelled first; (5) re-auth: the request needs a fresh token (issued within 5 min) so a stolen long-lived token cannot delete an account. Mobile needs a screen for it — filed separately.

## Plan

1. DELETE /api/users/me: cancel live renders, delete Mongo docs owned by the user, delete the Firebase user, revoke refresh tokens.
2. Background GCS cleanup of the user's render/upload prefixes, logged.
3. Shared links of their videos stop resolving (404).
4. Tests: everything owned is gone, someone else's data untouched, a stale token is refused.

## Reason

Store review rejects apps without it.

## Related files

src/modules/auth/*, src/routes/index.ts, models owned by userId

## Acceptance criteria

After DELETE /api/users/me the user can't sign in, their projects and share links 404, and another user's data is unchanged.

## Test steps

—

## Thread
2026-11-19T12:27:09+05:30 aquib N: created ticket, status: - -> open
