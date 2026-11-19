---
id: JET-376
title: Release: Forgot password on the sign-in screen, and a clear message for accounts that have no password
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-19T17:07:07+05:30
updated: 2026-11-19T17:10:09+05:30
decisions: 
---

## Request

Add Forgot password to the app's sign-in screen, and show the backend's message when sign-in or Create account answers 409 password_not_set. After JET-375, an account created with Google on the web (or by an email link) can no longer get a password by typing one into the app; it gets 409 password_not_set. The app has no Google sign-in and no Forgot password, so those people are stuck on mobile.

## Understanding

Backend JET-375 now answers POST /api/auth/login and POST /api/auth/users with 409 {code:'password_not_set', message:'This account signs in with Google or an email link. Use that, or Forgot password to set a password.'} for an account that exists but has no password. src/lib/api.ts already throws ApiError(payload.message, status, code), so the message probably shows as-is on sign-in.tsx and create-account.tsx today; worth checking. Setting a first password is the Firebase reset flow, and the web app already does all of it (AuthScreen.tsx: forgot view -> emailed link -> reset view -> POST /api/auth/reset-password). The app has no Firebase SDK, so rather than add one, the app opens the web app in an in-app browser (expo-web-browser) and the person uses Forgot password there; afterwards they sign in on the app with the new password. Assumption: the web sign-in page is reachable at music-beta.jetkreate.com and has no URL that opens straight onto its forgot view, so the person taps Forgot password once on the web page. Google sign-in in the app is a separate, larger decision and is not part of this request.

## Plan

1. sign-in.tsx: a Forgot password link that opens the web sign-in page in an in-app browser.
2. On ApiError code password_not_set (sign-in and Create account), show its message with the same Forgot password button.
3. Check that the message already renders as-is; if so, step 2 is only the button.
4. Test: a Google-created web account -> app sign-in -> message -> Forgot password -> web page -> emailed link -> set password -> app sign-in works.

## Reason

Without it, every Google-created web account is locked out of the app once JET-375 ships.

## Related files

src/app/(auth)/sign-in.tsx, src/app/(auth)/create-account.tsx, src/lib/auth.ts

## Acceptance criteria

A Google-created account can set a password from the app and then sign in on the app; a password_not_set answer shows the backend's message and a Forgot password button.

## Test steps

—

## Thread
2026-11-19T17:07:07+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:10:09+05:30 aquib N: status: open -> approved
