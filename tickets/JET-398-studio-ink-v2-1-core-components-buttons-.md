---
id: JET-398
title: Studio Ink V2-1: core components — buttons, action bar, sections, one chip, segmented, fields, confirm sheet, sheet shell
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-23T15:49:53+05:30
updated: 2026-11-23T16:11:29+05:30
decisions: D-093
---

## Request

Depends on: JET-397.

Rebuild the shared component language: Button variants primary (ivory) / cue / secondary (hairline) / tertiary / destructive / icon at 48 and 40 tall, hugging their label; ActionBar (context on the left, actions on the right) replacing stacked full-width buttons; Section (mono label + hairline) replacing panel wrappers; one Chip; Segmented with a sliding ivory thumb; hairline Field with Show; ConfirmSheet replacing the 4 Alert.alert calls; one Sheet shell for the 7 hand-built modal sheets.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Restyle in place (docs/ux-revamp-v2/COMPONENT_AUDIT.md), no second component system. The local Chip in features/video/video-about.tsx:279 is folded in. Hit areas stay >= 44 even at 40 visual height. No backend.

## Plan

1. button.tsx variants/sizes/fill.
2. action-bar.tsx, section.tsx, chip.tsx, confirm-sheet.tsx, sheet.tsx.
3. segmented.tsx thumb (Reanimated spring, reduced-motion jump).
4. field.tsx restyle.
5. Swap Alert.alert (settings sign out/delete, stop render, delete video).

## Reason

Every screen redesign uses these; doing them once keeps the app consistent.

## Related files

src/components/*, src/features/create/*-sheet.tsx, src/features/video/video-about.tsx, src/app/(app)/settings.tsx

## Acceptance criteria

No screen shows two stacked full-width filled buttons (auth excepted); no white system dialog anywhere; one Chip implementation; all buttons >= 44 hit area (checked with layout inspector).

## Test steps

—

## Thread
2026-11-23T15:49:53+05:30 aquib N: created ticket, status: - -> open
2026-11-23T15:50:34+05:30 aquib N: linked decision D-093 (Lock the Studio Ink design language for the mobile app (V2))
2026-11-23T16:11:29+05:30 aquib N: status: open -> approved
