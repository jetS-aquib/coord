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

Depends on: JET-385, JET-384, JET-398.

SCREEN_REDESIGN.md §1 (V1 UX-021/040/041/042/043): render backdrop + logo + 'Turn any song into a music video'; hairline fields with Show; primary kept above the keyboard (KeyboardStickyView, already installed); Create an account as an equal secondary; live password rule checks; terms/privacy line; Verify gets Resend (cooldown from the backend) and Wrong email?; Forgot password opens the web reset view (${WEB}/login?view=reset, coordinate with JET-376); email survives an app restart. Settings gets an About group (version, privacy, terms, contact).

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Mobile sign-up only works once codes are emailed (backend ticket). The Google token fix is listed as a dependency because offering Google sign-in on mobile is not safe before it; adding a Google button on mobile is optional and not in this plan unless asked. Privacy and terms URLs do not exist yet — needs product/legal pages; the links use config so they can be filled later.

## Plan

1. Sign in / Create account / Verify restyle.
2. Resend + cooldown.
3. Reset link.
4. Persist email in SecureStore.
5. Settings About.

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
