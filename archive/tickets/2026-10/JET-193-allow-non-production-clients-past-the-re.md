---
id: JET-193
title: Allow non-production clients past the reCAPTCHA gate on login and register
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: done
created: 2026-10-20T20:52:41+05:30
updated: 2026-10-27T16:22:26+05:30
decisions: 
closed: 2026-10-27
---

## Request

Skip reCAPTCHA verification when NODE_ENV is not production, at the single chokepoint in captchaService.verify(). Production behaviour must not change.

## Understanding

The backend hard-enforces reCAPTCHA v3 on exactly two endpoints: login (auth.controller.ts:62) and createUser (auth.controller.ts:25). Both call captchaService.verify(token, req.ip, action), which fails closed on a missing secret, an empty token, an action mismatch, a score under RECAPTCHA_MIN_SCORE (default 0.5), and on Google being unreachable. Its docblock says bypass is strictly forbidden, so I am asking to change that deliberately rather than working around it. No other auth route checks captcha: refresh, google, firebase-verify, verify-email, forgot-password and reset-password are all open, which is how the mobile client is currently getting a session at all (it exchanges a pre-minted refresh token in dev). ASSUMPTIONS: (1) the intent of the rule is to stop scripted credential stuffing against the public deployment, not to harden developer laptops; (2) NODE_ENV is reliably 'production' in the deployed environment, so gating on it does not weaken production; (3) nobody runs a publicly reachable backend with NODE_ENV unset. If (3) is wrong this is the wrong gate and I would rather use an explicit opt-in flag such as CAPTCHA_DISABLED. This request deliberately does NOT solve production mobile auth, which needs Play Integrity or reCAPTCHA Enterprise and should be a separate decision.

## Plan

1. In captchaService.verify(), return { success: true, score: 1, action: expectedAction } immediately when env.NODE_ENV !== 'production', before the secret and token checks. 2. Log once at warn level on that path so a misconfigured deployment is visible in logs rather than silent. 3. Update the docblock, which currently promises no bypass under any condition, to state the dev exemption and why. 4. Leave both call sites in auth.controller.ts untouched: one guard at the chokepoint covers login and register together and cannot drift. 5. No change to env.ts, no new variable.

## Reason

reCAPTCHA v3 is browser-only JavaScript with no React Native SDK, so the Expo client cannot produce a token. captchaService.verify() rejects an empty token with 403 before any credential check, which makes /api/auth/login and /api/auth/users unreachable from mobile. Every screen behind sign-in is currently unbuildable and untestable.

## Related files

src/shared/services/captchaService.ts

## Acceptance criteria

With NODE_ENV=development: POST /api/auth/login with a valid email and password and no captchaToken returns 200 with accessToken and refreshToken. POST /api/auth/users with no captchaToken creates the account. With NODE_ENV=production: both still return 403 'CAPTCHA token is required' when the token is absent. The Expo app signs in through the real form with no dev refresh token present.

## Test steps

1. With the backend running and NODE_ENV unset or "development", POST to
   /api/auth/login with a valid email and password and NO captchaToken.
   Expect 200 with accessToken and refreshToken, and a warn line in the backend
   log reading `CAPTCHA skipped for action "login"`.
2. Same call with NODE_ENV=production. Expect 403 and
   `{"error":"CAPTCHA token is required"}`. This is the gate that matters.
3. In the Expo app with no EXPO_PUBLIC_DEV_REFRESH_TOKEN set, sign in through the
   real form on the sign-in screen. Expect to land on the signed-in screen.
4. Register a new account from the app with no captchaToken. Expect the verify
   screen with a six digit code, confirming createUser took the same path.

## Thread
2026-10-20T20:52:41+05:30 aquib N: created ticket, status: - -> open
2026-10-20T20:57:10+05:30 aquib N: status: open -> approved
2026-10-20T20:58:05+05:30 aquib N: status: approved -> in_progress — work started in music-jetkreate-backend
2026-10-21T11:45:50+05:30 aquib N: status: in_progress -> review — Backend bypass is in at the captchaService.verify() chokepoint with a warn log, exactly as planned. Mobile side: removed the dev refresh-token workaround that stood in for this; the real sign-in form is now the only path.
2026-10-22T15:21:56+05:30 aquib N: Looks implemented, by a dev not on coord — found by reading commits, not the board. music-jetkreate-backend 091345a (2026-10-22) adds an IS_DEV_MACHINE gate in captchaService.ts and cites JET-193 in the comment.

It deliberately does NOT gate on 'NODE_ENV !== production': env.ts defaults NODE_ENV to development and the Dockerfile never sets it, so that check would have disabled captcha inside the deployed container. IS_DEV_MACHINE requires NODE_ENV to be explicitly development or test; unset enforces.

Verified on this machine: music-jetkreate-backend/.env has NODE_ENV=development, so mobile login and register should now work against local without a captcha token. Not yet exercised end to end from the app.

Production mobile auth is still unsolved and the commit says so — it needs Play Integrity or reCAPTCHA Enterprise, which is a separate decision, not this ticket.

Closing is yours: coord done JET-193 once you have seen mobile sign in.
2026-10-27T16:22:26+05:30 aquib N: status: review -> done
