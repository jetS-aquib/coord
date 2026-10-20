---
id: JET-193
title: Allow non-production clients past the reCAPTCHA gate on login and register
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: in_progress
created: 2026-10-20T20:52:41+05:30
updated: 2026-10-20T20:58:05+05:30
decisions: 
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

—

## Thread
2026-10-20T20:52:41+05:30 aquib N: created ticket, status: - -> open
2026-10-20T20:57:10+05:30 aquib N: status: open -> approved
2026-10-20T20:58:05+05:30 aquib N: status: approved -> in_progress — work started in music-jetkreate-backend
