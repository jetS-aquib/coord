---
id: JET-385
title: Release blocker: mobile sign-up never receives its 6-digit code — send it by email, and add a resend endpoint
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:47:44+05:30
updated: 2026-11-23T15:47:44+05:30
decisions: 
---

## Request

register (auth.service.ts:188) and login-while-unverified (:120-137) store emailVerificationCode but nothing sends it: there is no email library in the backend and the code is only console-logged on dev machines (IS_DEV_MACHINE). The web verifies through Firebase links (firebase-verify); the mobile app uses the code path (POST /api/auth/verify-email). Outside dev, nobody who signs up on mobile can verify. Send the code by email, and add POST /api/auth/resend-verification {email} with a cooldown.

## Understanding

Assumptions: (1) keep the code path for mobile (the app's Verify screen is built for it) rather than moving mobile to Firebase links; (2) sending needs an email provider — a new dependency and a secret; options are Firebase/Google Workspace SMTP via nodemailer, SendGrid, or SES; the implementer records the choice with coord decide; (3) resend answers 200 whatever the email (no account enumeration), rate-limited to 1 per 30s and 5 per hour per email; (4) a resend issues a new code and invalidates the old one; (5) the email is plain: subject 'Your jetKreate Music code', the 6 digits, 15-minute expiry.

## Plan

1. Pick and wire an email sender (env-configured, no-op with a log on dev machines).
2. Send the code from register and from login-while-unverified.
3. POST /api/auth/resend-verification with rate limit + generic 200.
4. Tests: register sends one email; resend within 30s -> 429; old code rejected after resend.

## Reason

Every mobile sign-up outside dev dead-ends on Verify. Release blocker for the mobile launch.

## Related files

src/modules/auth/auth.service.ts, src/modules/auth/auth.routes.ts, src/modules/auth/auth.controller.ts, src/config/env.ts, new src/shared/email.ts

## Acceptance criteria

On staging: create an account from the app with a real inbox -> the code arrives within a minute and verifies. Tap resend -> a new code arrives, the old one is rejected. A second resend within 30s -> 429 with retryAfter.

## Test steps

—

## Thread
2026-11-23T15:47:44+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:06:32+05:30 aquib N: Deprioritised 2026-11-23: moved to the pre-release auth batch with JET-384 (which now also enables Google sign-in). The mobile auth UI (JET-407) proceeds earlier and is wired to this when it lands.
