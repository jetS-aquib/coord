---
id: JET-365
title: Release: a Delete account button in settings that calls DELETE /api/users/me
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-19T12:27:10+05:30
updated: 2026-11-19T17:27:00+05:30
decisions: 
---

## Request

Settings → Delete account, with a confirm step, calls the new backend endpoint, then signs out.

## Understanding

Needed for store review alongside the backend endpoint (filed in the same batch). Assumption: the app re-authenticates (fresh token) right before the call, since the backend will refuse a token older than 5 minutes.

## Plan

1. Settings row 'Delete account' → confirm sheet stating it is permanent.
2. Refresh the token, call DELETE /api/users/me, sign out, return to the welcome screen.
3. Show an error and keep the account if the call fails.

## Reason

—

## Related files

—

## Acceptance criteria

Deleting signs the user out and they cannot sign back in with the same account.

## Test steps

Backend on JET-364. Use a throwaway account.

1. Settings → Account → "Delete account" (red). A confirmation says it is permanent; Cancel leaves everything as it was.
2. Tap it again → "Delete account": a spinner shows, then you land on sign-in.
3. Sign in with the same email and password: refused. The account is gone.
4. Stale token: sign in, leave the app idle 6+ minutes, then delete. It still works (the 401 REAUTH_REQUIRED is refreshed and retried once by the API layer).
5. Failure: turn off Wi-Fi and delete. A red message shows under the button, you stay signed in, and the account still works once back online.

## Thread
2026-11-19T12:27:10+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:21:34+05:30 aquib N: Backend is built (JET-364, committed when approved). Call: POST /api/auth/refresh first, then DELETE /api/users/me, signed, no body, within 5 minutes of the refresh. 200 {success:true} -> clear tokens, go to welcome. 401 code REAUTH_REQUIRED -> refresh and retry once. See .coord/contracts/api-users.md.
2026-11-19T17:22:49+05:30 aquib N: status: open -> approved
2026-11-19T17:27:00+05:30 aquib N: status: approved -> in_progress
