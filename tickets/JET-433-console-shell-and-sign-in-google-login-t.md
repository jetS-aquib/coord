---
id: JET-433
title: Console shell and sign-in: Google login through the backend, signed server-side calls, guard, sidebar
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:04+05:30
updated: 2026-11-26T12:38:55+05:30
decisions: 
---

## Request

The admin console's skeleton: sign in, call the backend safely, and the layout every module plugs into.

## Understanding

Admins sign in with Google; the backend's /api/auth/google returns its own JWTs (access 15m, refresh 7d). The Next server keeps them in httpOnly Secure SameSite=Strict cookies and signs every call like music-jetkreate-mobile/src/lib/signing.ts (HMAC of snonce, METHOD|path|ts|nonce|bodyHash, server clock offset). The browser never sees the tokens or REQUEST_SIGNING_KEY. A non-admin gets 403 from /api/admin and sees a 'not an admin' page. Needs JET-426. Assumption: Google sign-in in the browser via Firebase Auth (same project as the app), then the ID token goes to our server action.

## Plan

1. lib/backend.ts (server-only): sign, bearer, refresh once on 401, typed errors.
2. Login page + server action that exchanges the Google credential, sets cookies; logout.
3. proxy.ts: no session -> /login.
4. App shell: sidebar (Overview, Users, Renders, Content, Billing, Control room, Audit), top bar with admin email, dark mode toggle.
5. shadcn: sidebar, table, dialog, dropdown, form, sonner, card, tabs, badge, chart.
6. One Playwright check: login stub -> users list renders.
7. Signer unit test against a vector computed from the backend's code.

## Reason

—

## Related files

apps/admin/lib/backend.ts, apps/admin/proxy.ts, apps/admin/app/(console)/layout.tsx, apps/admin/app/login/*, packages/ui/src/components/*

## Acceptance criteria

An admin signs in and reaches Overview; a creator account sees 'not an admin'; tokens are not readable from document.cookie; a session survives the 15-minute access expiry.

## Test steps

—

## Thread
2026-11-24T17:05:04+05:30 aquib N: created ticket, status: - -> open
2026-11-24T17:05:23+05:30 aquib N: Order: JET-426 first. Everything else in the console (JET-434..440) builds on this shell. Onboarding: D-103.
2026-11-26T12:38:55+05:30 aquib N: status: open -> approved
2026-11-26T12:57:01+05:30 aquib N: BUILT (uncommitted). Google sign-in via Firebase popup -> ID token -> server action -> backend /api/auth/firebase-verify (verifies the token; /api/auth/google does not, so not used). Tokens in httpOnly SameSite=Strict cookies; proxy.ts redirects without a session and refreshes the access token 60s before expiry; lib/backend.ts signs every call (lib/sign.ts, unit-tested against vectors from the backend's algorithm), learns clock offset from Date, 401->/login, 403 FORBIDDEN->/not-admin. Sidebar, top bar email, theme toggle, error boundary. Mutations go through one server action act() pinned to /api/admin. Skipped: Playwright check (no backend in CI yet). Env in apps/admin/.env.example. TEST: pnpm --filter admin test; sign in as admin -> Overview, creator -> Not an admin; document.cookie has no mjk_at/mjk_rt; idle 16 min still signed in.
2026-11-26T13:04:08+05:30 aquib N: Added email+password sign-in beside Google: same POST /api/auth/login the app uses, reCAPTCHA v3 (action login) when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set (backend skips captcha outside production), needsVerification shown as an error, Forgot password -> web app reset page like the app. Console now uses the app's brand mark, Studio Ink colours, Geist + Instrument Serif. Fixed: proxy no longer guards static files.
