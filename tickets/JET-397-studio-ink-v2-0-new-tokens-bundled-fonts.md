---
id: JET-397
title: Studio Ink V2-0: new tokens, bundled fonts, jetKreate Music brand mark, remove the glow orbs
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-23T15:48:26+05:30
updated: 2026-11-23T16:11:24+05:30
decisions: D-093
---

## Request

Lock the approved Studio Ink design language (docs/ux-revamp-v2, artifact https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM) into the theme: warm charcoal surfaces, ivory text, coral 'cue' for live states only, Instrument Serif + Geist + Geist Mono, and consistent 'jetKreate Music' branding with the real logo.

## Understanding

Token names stay, values change, so screens pick up most of the look without edits (0 hex literals outside src/theme). signal/signalSoft/orbs are retired; colors.signal has 125 uses in 32 files, each mapped to ink (selection/primary), inkMuted (links) or cue (live: playhead, progress, active lyric, record). Fonts are OFL TTFs bundled in assets/fonts and loaded with the already-installed expo-font, so no new npm dependency. Devanagari falls back per glyph to the system font. Depends on no backend change.

## Plan

1. tokens.ts: new values and tokens per docs/ux-revamp-v2/DESIGN_SYSTEM.md §1-4, 9.
2. Bundle Instrument Serif, Geist, Geist Mono; theme/fonts.ts; hold splash until loaded.
3. Map every colors.signal use to ink/inkMuted/cue.
4. components/brand-mark.tsx; Library header and Sign in show logo + 'jetKreate Music'; remove 'JETKREATE'.
5. Delete components/ambient-orbs.tsx and its uses.
6. Decision record for the direction and fonts.

## Reason

Approved visual direction; the foundation every other V2 ticket builds on. Cheap enough to ship before release.

## Related files

src/theme/tokens.ts, src/theme/fonts.ts, src/app/_layout.tsx, src/components/brand-mark.tsx, src/components/ambient-orbs.tsx, src/app/(app)/index.tsx, src/app/(auth)/sign-in.tsx, assets/fonts/*

## Acceptance criteria

grep -rn 'colors.signal\|JETKREATE' src is empty; titles render in the serif, timecodes in mono on Android and iOS; Sign in and Library show the logo mark and 'jetKreate Music'; contrast table in DESIGN_SYSTEM.md holds; Library memory (dumpsys meminfo) not higher than before.

## Test steps

—

## Thread
2026-11-23T15:48:26+05:30 aquib N: created ticket, status: - -> open
2026-11-23T15:50:34+05:30 aquib N: linked decision D-093 (Lock the Studio Ink design language for the mobile app (V2))
2026-11-23T16:11:24+05:30 aquib N: status: open -> approved
