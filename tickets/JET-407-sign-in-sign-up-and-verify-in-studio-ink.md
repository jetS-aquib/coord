---
id: JET-407
title: Sign in, sign up and verify in Studio Ink: purpose line, live password checks, resend code, real reset link, About links
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:06+05:30
updated: 2026-11-23T15:50:06+05:30
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

—

## Thread
2026-11-23T15:50:06+05:30 aquib N: created ticket, status: - -> open
