---
id: JET-384
title: Release blocker: POST /api/auth/google trusts the email in the body — verify a Google ID token before signing anyone in
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:45:57+05:30
updated: 2026-11-23T15:45:57+05:30
decisions: 
---

## Request

POST /api/auth/google (auth.routes.ts:8, auth.service.ts:80 googleAuth) takes {sub, email, name, picture} from the request body and issues tokens for that email. Nothing checks that the caller holds a Google account for it (googleAuthSchema auth.schema.ts:36; accessToken is optional and unused). Anyone can sign in as any existing user by posting their email. Verify a Google ID token server-side and take sub/email from the verified token, never from the body.

## Understanding

This is a different hole from JET-375 (password takeover of passwordless accounts). Assumptions: (1) the web client can send the Google ID token (credential) it already receives from Google Identity Services instead of the profile fields; (2) mobile does not call /google today, so only the web client changes now; (3) allowed audiences are the web client ID plus future Android/iOS client IDs, read from env (GOOGLE_CLIENT_IDS, comma-separated); (4) verification uses Google's public keys — google-auth-library OAuth2Client.verifyIdToken is the standard way and is a new dependency, or a small JWKS check with the existing jsonwebtoken; whoever implements picks and records a decision. Email must be email_verified=true in the token.

## Plan

1. googleAuthSchema: require idToken; drop trust in sub/email/name/picture from the body.
2. Verify idToken against Google keys and GOOGLE_CLIENT_IDS audiences; reject expired, wrong aud, unverified email with 401.
3. googleAuth(sub,email,…) takes the verified claims.
4. Web: send credential/idToken (music-jetkreate-frontend, its own change, coordinated).
5. Test: forged body without token -> 401; valid token -> same user as before.

## Reason

Full account takeover of every user whose email is known. Must close before any public build; also a prerequisite for offering Google sign-in on mobile.

## Related files

src/modules/auth/auth.schema.ts, src/modules/auth/auth.service.ts, src/modules/auth/auth.controller.ts, src/config/env.ts

## Acceptance criteria

curl POST /api/auth/google with {sub,email} of an existing user and no token -> 401 and no tokens. With a real Google ID token for that email -> signs in. Token for an unverified email or a foreign audience -> 401.

## Test steps

—

## Thread
2026-11-23T15:45:57+05:30 aquib N: created ticket, status: - -> open
