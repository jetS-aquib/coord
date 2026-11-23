---
id: JET-407
title: Sign in, sign up and verify in Studio Ink: purpose line, live password checks, resend code, real reset link, About links
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:50:06+05:30
updated: 2026-11-23T18:11:55+05:30
decisions: 
---

## Request

Depends on: JET-398 (UI now); JET-385, JET-384 for final wiring in the auth batch.

SCREEN_REDESIGN.md §1 (V1 UX-021/040/041/042/043): render backdrop + logo + 'Turn any song into a music video'; hairline fields with Show; primary kept above the keyboard (KeyboardStickyView, already installed); Create an account as an equal secondary; live password rule checks; terms/privacy line; Verify gets Resend (cooldown from the backend) and Wrong email?; Forgot password opens the web reset view (${WEB}/login?view=reset, coordinate with JET-376); email survives an app restart. Settings gets an About group (version, privacy, terms, contact).

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

REVISED 2026-11-23: the auth BACKEND is deprioritised to the pre-release auth batch (JET-384 now also enables Google sign-in), but this UI work is not blocked: build the Studio Ink sign in / create account / verify screens, live password checks (rule from the 'limits' bundle when JET-413 lands, else the current constant), the Resend control with cooldown UI, Wrong email?, the reset link (${WEB}/login?view=reset), a 'Continue with Google' button behind a flag, persisted email, and Settings About now. Wiring Resend to JET-385 and the Google button to JET-384 happens in the auth batch. Privacy and terms URLs do not exist yet (product/legal); links read from config.

## Plan

1. Sign in / Create account / Verify restyle with ActionBar above the keyboard.
2. Live password checks; Resend countdown UI; reset link; persisted email.
3. Google button behind a flag (hidden until JET-384).
4. Settings About group.
5. Auth batch: wire Resend to JET-385 and Google to JET-384; remove the flag.

## Reason

First launch should explain the product and must actually let people sign up.

## Related files

src/app/(auth)/*.tsx, src/lib/auth.ts, src/app/(app)/settings.tsx

## Acceptance criteria

On staging a new account receives its code, Resend works with a countdown, Forgot password lands on the reset view, the keyboard never hides the primary button.

## Test steps

1. Kill and reopen signed out: Sign in shows the mark and 'Turn any song into a music video.'; with the password field focused, Sign in and Create an account stay above the keyboard.
2. Type an email, kill the app, reopen: the email is still there.
3. Create account: type 'abc' -> only a–z ticks; 'Abcdefg1!' -> all five tick and Create account enables.
4. Create a new account on staging: Verify counts down 'Resend in 0:30', then 'Get a new code' goes to Sign in; 'Wrong email?' opens Create account with the email filled.
5. Forgot password opens <web>/login?view=reset. Settings > About shows 'Version x.y.z (build)'.

## Thread
2026-11-23T15:50:06+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:06:31+05:30 aquib N: Revised in place 2026-11-23 (unapproved): see the REVISED note in Understanding and the updated Depends on line. Reason: remote-config design (JET-411..413) and the person's reprioritisation (auth backend later with Google sign-in, auth UI now, push last).
2026-11-23T18:10:51+05:30 aquib N: status: open -> approved
2026-11-23T18:11:55+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T18:23:23+05:30 aquib N: Built, not committed. Studio Ink sign in / create account / verify on a shared AuthScreen (features/auth/auth-screen.tsx): mark, purpose line, Fields with Show, actions kept above the keyboard. Live password rule checks (PASSWORD_RULES, JET-413 later). Verify: 30s resend countdown then 'Get a new code' -> sign in (no resend route yet, JET-385); Wrong email?. Forgot password opens WEB_URL/login?view=reset. Email remembered across restarts (AsyncStorage). Google button behind GOOGLE_SIGN_IN=false (JET-384). Settings About: version/build; privacy/terms/contact rows hidden until URLs exist. Backdrop is a colour fade until a render image is added.
