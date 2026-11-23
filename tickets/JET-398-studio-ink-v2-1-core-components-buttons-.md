---
id: JET-398
title: Studio Ink V2-1: core components — buttons, action bar, sections, one chip, segmented, fields, confirm sheet, sheet shell
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-11-23T15:49:53+05:30
updated: 2026-11-23T16:50:47+05:30
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

Rebuild first (same as JET-397).
1. Settings: switching Appearance slides the ivory thumb (jumps with Reduce motion on).
2. Settings > Sign out and Delete account: a dark themed sheet, never a white system dialog; Cancel closes it.
3. Stop a running render and delete a video: same themed confirm sheet.
4. Ready: price on the left, "Film now" (outline) and "Preview stills" (ivory) on the right of a bottom bar. Call sheet after a preview: "Film it" is the only coral button.
5. Password fields have Show/Hide; lyric style, place, shot and edit sheets all share the same grabber, radius and ✕.

## Thread
2026-11-23T15:49:53+05:30 aquib N: created ticket, status: - -> open
2026-11-23T15:50:34+05:30 aquib N: linked decision D-093 (Lock the Studio Ink design language for the mobile app (V2))
2026-11-23T16:11:29+05:30 aquib N: status: open -> approved
2026-11-23T16:27:00+05:30 aquib N: Implemented (uncommitted): Button variants primary/cue/secondary/tertiary/destructive/icon, size md 48/sm 40 (hitSlop keeps 44), fill hug/full, icon + loading spinner keeps label; ActionBar, Section, Chip (one, with busy; local Chip in video-about deleted), Segmented with sliding ivory thumb (reduced motion jumps), Field (hairline box, mono caps label, Show/Hide on password), Sheet shell, ConfirmSheet. 4 Alert.alert -> ConfirmSheet (sign out, delete account, stop render, delete video). 5 modal sheets on Sheet (caption style, place, shot, edit-log, edit confirm); the other two 'sheets' counted in the audit (video-studio panel, edit-bar input bar) aren't modals and were left to V2-3. ActionBar on Ready and Call sheet ('Film it' is the cue button); Lyrics actions in a row; Working leave/pause -> tertiary, stop -> destructive; auth primaries fill=full. Test steps: Settings > Sign out shows themed sheet (no white dialog); same for Delete account, Stop render, Delete video; Ready shows price left, Film now + Preview stills right; Appearance switch thumb slides; Password field Show toggles.
2026-11-23T16:50:47+05:30 aquib N: status: approved -> in_progress
2026-11-23T16:50:47+05:30 aquib N: status: in_progress -> review — Implemented; Test steps filled in. Committed on v1-render-and-design-pass.
