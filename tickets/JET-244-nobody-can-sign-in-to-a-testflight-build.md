---
id: JET-244
title: Nobody can sign in to a TestFlight build: the captcha gate rejects an empty token before the password is ever checked
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-03T15:47:50+05:30
updated: 2026-11-03T15:47:50+05:30
decisions: 
---

## Request

A way for the Expo client to get past the login and register captcha gate against the deployed backend. Play Integrity, reCAPTCHA Enterprise, or an attested mobile client path.

## Understanding

The app is being wired for a TestFlight release and this is the one thing that stops it being usable by a tester. It is not a new discovery and I am not reporting a surprise: captchaService.ts says it in its own comment, from JET-193. reCAPTCHA v3 is browser-only JavaScript with no React Native SDK, so the Expo client cannot mint a token; verify() rejects an empty one with 403 before any credential check; and the bypass is IS_DEV_MACHINE, which requires NODE_ENV to be explicitly 'development' or 'test' and correctly enforces when it is unset, as it is in the container. So mobile sign-in and register work against a laptop and are unreachable against the deployment. Every test flight so far has pointed at a dev backend, which is why this has never bitten. EXPO_PUBLIC_RECAPTCHA_SITE_KEY exists in the mobile env and is read into a constant that nothing sends, which is honest but is not a path. Assumptions: (1) the right answer is an attestation the platform can actually produce, Play Integrity on Android and App Attest or reCAPTCHA Enterprise on iOS, not a shared secret or a header the binary carries, because the signing key is already extractable from the binary and a second one would be no better; (2) this is a security tradeoff and belongs in a decision record whichever way it goes; (3) whatever is chosen, mobile sends it on the same two routes and nothing else changes on this side. If the answer for a closed TestFlight group is a deliberately narrower one, say so on the thread and I will build to it.

## Plan

1. Decide the mechanism and record it, because it is a security tradeoff either way. Play Integrity and App Attest are the two the platforms mint for free; reCAPTCHA Enterprise has mobile SDKs and is closest to what is deployed.
2. Accept that attestation on POST /api/auth/login and /api/auth/register beside the existing captchaToken, rather than in place of it, so the web client is untouched.
3. Keep the 403 for a client that sends neither. The gate exists to stop credential stuffing against the public deployment and this must not widen it.
4. Tell mobile the field name and what it must contain.
5. Our half: the native attestation call and one more field on two requests.

## Reason

A TestFlight build is useless if a tester cannot sign in, and this is the only thing between the app and that. Everything else about the release is config.

## Related files

src/shared/services/captchaService.ts, src/modules/auth/auth.controller.ts, src/modules/auth/auth.schema.ts

## Acceptance criteria

A release build of the Expo app, pointing at the deployed backend with captcha enforced, can register a new account and sign in; a request carrying neither a captcha token nor an attestation still gets 403.

## Test steps

—

## Thread
2026-11-03T15:47:50+05:30 aquib N: created ticket, status: - -> open
