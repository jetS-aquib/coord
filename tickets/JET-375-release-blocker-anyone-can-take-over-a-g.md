---
id: JET-375
title: Release blocker: anyone can take over a Google-created account by logging in or registering with its email and any password
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-19T17:01:15+05:30
updated: 2026-11-19T17:02:16+05:30
decisions: 
---

## Request

Stop the email/password routes from setting a password on an account that has none (accounts created with Google sign-in). Today that lets anyone who knows a Google user's email sign in as them.

## Understanding

Verified in src/modules/auth/auth.service.ts: (1) login(): if the user has no password, it hashes the typed password, saves it and issues tokens — no check that the caller owns the email; (2) register(): if the email exists with no password, it saves the new password, marks the email verified and returns access + refresh tokens. Both are reachable unauthenticated (login has a rate limiter, register a captcha — neither proves ownership). Impact: full account takeover of every Google-signup user whose email is known. firebaseVerifyToken is fine (Firebase verified the email). ASSUMPTIONS: (a) a Google user who wants a password must prove the email first — the existing forgot-password / reset-password flow already emails a token and can set the first password, so no new flow is needed; (b) login and register answer 409 {code:'use_google_sign_in'} for a passwordless account instead of a generic error, so the app can say 'This account uses Google sign-in'; (c) accounts already given a password this way cannot be told apart from legitimate ones — I will report how many Google-provider accounts gained a password, not change them.

## Plan

1. login(): no password on the account -> 409 use_google_sign_in, nothing written.
2. register(): existing account with no password -> same 409, nothing written, no tokens.
3. Confirm reset-password can set a first password on a passwordless account (it is the ownership-proving path); fix if not.
4. Tests: login/register against a passwordless account write nothing and return 409; reset-password still works.
5. Read-only count of authProvider 'google' accounts that have a password, in the thread.
6. Ask mobile for the 409 message only if the app shows a generic error today.

## Reason

Account takeover with only an email address. Must ship before public launch.

## Related files

src/modules/auth/auth.service.ts, src/modules/auth/auth.controller.ts

## Acceptance criteria

Logging in or registering with a Google-created account's email and any password returns 409 use_google_sign_in and the account still has no password; Google sign-in still works; forgot/reset password still lets the owner set a password.

## Test steps

Web app (music-jetkreate-frontend) against this backend; the mobile app has no Google sign-in or Forgot password yet (JET-376).
1. Sign up with Continue with Google, then sign out.
2. Email login with that email and any password -> 409 "This account signs in with Google or an email link…" (code password_not_set); not logged in. In Mongo the user still has no password field.
3. Create account with the same email and any password -> the same 409; no tokens, the user is unchanged.
4. Continue with Google -> signs in as before.
5. Forgot password on that email -> open the emailed link -> set a password -> email login with it works.
6. A Firebase ID token whose email is not verified, POSTed to /api/auth/firebase-verify or /api/auth/reset-password -> 401 / 400, nothing written (covered by src/modules/auth/accountTakeover.test.ts).
Regression sheet rows TC-084 to TC-086.

## Thread
2026-11-19T17:01:15+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:02:16+05:30 aquib N: status: open -> approved
2026-11-19T17:07:33+05:30 aquib N: Built. login() and register() refuse an account with no password: 409 code password_not_set (renamed from use_google_sign_in — email-link accounts have no password either, so the message names both), nothing written, no tokens. Found while tracing: /firebase-verify and /reset-password never checked the Firebase token's email_verified, so an unverified Firebase account made with someone's email could sign in as them or set their password. Both now require it; the web's email-link and reset flows both yield verified tokens. auth.service.ts imports firebaseAdmin at the top instead of require() inside the functions, so it can be tested. Read-only count: the local DB has no Google accounts; run on production before launch: db.users.countDocuments({authProvider:'google', password:{$exists:true}}). Mobile has no Google sign-in or Forgot password, so Google-created accounts are locked out of the app until JET-376.
