---
id: JET-364
title: Release: delete my account — required by App Store and Play before launch
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-19T12:27:09+05:30
updated: 2026-11-19T17:21:34+05:30
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

Two accounts, A and B, each with a finished video, and A's video shared by link.
1. As A, POST /api/auth/refresh, then within 5 minutes DELETE /api/users/me (signed) -> 200 {success:true}.
2. A's old access token on any call, and A's refresh token on /api/auth/refresh -> 401.
3. A's share link /s/<token> -> not found. In Mongo: no users/musicvideos/renderplanv1/usergenerationquotas rows with A's id; A's generationlogs rows now say userId 'deleted'.
4. Server log: "[deleteAccount] <id>: n/n files deleted"; one of A's clip URLs no longer opens.
5. B signs in; B's video and share link still work.
6. A token older than 5 minutes -> 401 REAUTH_REQUIRED, nothing deleted.
7. Signing in again with A's Google account creates a fresh empty account.
Regression sheet rows TC-087 to TC-089.

## Thread
2026-11-19T12:27:09+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:16:01+05:30 aquib N: status: open -> approved
2026-11-19T17:21:34+05:30 aquib N: Built. DELETE /api/users/me (src/modules/auth/deleteAccount.ts): token must be <5 min old (401 REAUTH_REQUIRED), cancels live renders, deletes the user's rows in 10 owned collections plus settings and quotas, song caches only for the user's own uploads that nobody else uses (the catalogue is shared), $pulls their lyric edits, keeps GenerationLog rows with userId/email set to 'deleted' (the spend breaker sums them), deletes the Firebase user (a failure is logged, not fatal), deletes the User row last so a half-done delete can be retried. Files are deleted in the background after the 200, from the URLs the deleted records held; GCS keys are not per user, so a prefix delete is impossible. No file is shared between users today (0 of 7,554), so no cross-user check; noted in code. Share links die with the MusicVideo row. Not done: deleting the person in PostHog needs a personal API key the backend doesn't have; events carry only the user id, which now points at nothing. Delete them from PostHog's Persons page on request, or file it when a key exists. Contract api-users.md updated. Live-checked on the local DB with a throwaway user.
2026-11-19T17:21:34+05:30 aquib N: status: approved -> in_progress
2026-11-19T17:21:34+05:30 aquib N: status: in_progress -> review — Built and tested; see the note. Not committed.
