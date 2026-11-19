---
id: JET-365
title: Release: a Delete account button in settings that calls DELETE /api/users/me
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-19T12:27:10+05:30
updated: 2026-11-19T12:27:10+05:30
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

—

## Thread
2026-11-19T12:27:10+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:21:34+05:30 aquib N: Backend is built (JET-364, committed when approved). Call: POST /api/auth/refresh first, then DELETE /api/users/me, signed, no body, within 5 minutes of the refresh. 200 {success:true} -> clear tokens, go to welcome. 401 code REAUTH_REQUIRED -> refresh and retry once. See .coord/contracts/api-users.md.
