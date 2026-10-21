# music-jetkreate-mobile — aquib N

- **Current task:** Nav Read committed; next is the Library screen and the (create) flow
- **Status:** working
- **Blockers:** none. JET-193 landed; real sign-in works and the dev bypass is deleted
- **Last updated:** 2026-10-21T11:50:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-10-21T13:43:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +8 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T12:06:49+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +8 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T12:01:39+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +6 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:57:18+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md, src/lib/signing.ts, src/app/(app)/_layout.tsx, +6 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:51:28+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-21T11:46:13+05:30

Session ended. Touched: aquib-n.md, src/config/env.ts, src/lib/session-context.tsx, src/lib/auth.ts, .env, MOBILE-DESIGN.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-20T20:53:26+05:30

Session ended. Touched: aquib-n.md. Nothing committed. (written automatically — no one said what is next)

### 2026-10-20T21:05+05:30

Scaffolded the repo from scratch and shipped the auth flow.

**Done.** Expo SDK 58 (RN 0.88, Expo Router, Hermes), Android-first. Design tokens
ported from iris: OKLCH converted to sRGB hex, contrast measured rather than assumed
(`inkFaint` fails AA in both modes and is marked decorative-only). Full design record
in `MOBILE-DESIGN.md` including the RISK register. Auth screens: sign-in,
create-account, verify. Request signing in `src/lib/signing.ts` mirrors the backend's
`requireSignature` canonical string exactly, with clock-skew correction because the
backend allows only 60s of drift and phone clocks wander.

**The blocker.** reCAPTCHA v3 is browser-only; there is no React Native SDK. The
backend rejects an empty captcha token with 403 before checking credentials, so
`/api/auth/login` and `/api/auth/users` are unreachable from this client. JET-193 asks
for a non-production exemption at the `captchaService.verify()` chokepoint.

**Interim.** `/api/auth/refresh` checks no captcha and no signature and returns a real
access token with a real `snonce`, so a pre-minted refresh token exchanged at launch
gives a genuine session. Dev-only, behind `__DEV__` and
`EXPO_PUBLIC_DEV_REFRESH_TOKEN`. Remove it once JET-193 lands.

**Next.** Approve or reject JET-193. Then run `mobile-nav-plan` for the
upload-and-generate tree before building those screens. The pipeline shape is already
traced: presigned GCS upload (not base64), `/api/video/music-storyboard`, per-scene
jobs, then `/api/video/assemble-music-video`. SSE will not work in React Native, so
job progress has to poll `/api/jobs/:id/status`.

**Housekeeping.** The repo has no git remote and zero commits; everything is still
untracked. Other machines will see a registry row for a repo they cannot clone until
that is fixed.
