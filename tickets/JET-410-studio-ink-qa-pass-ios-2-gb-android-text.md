---
id: JET-410
title: Studio Ink QA pass: iOS, 2 GB Android, text scale, screen readers, light theme, before/after screenshots
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:10+05:30
updated: 2026-11-23T15:50:10+05:30
decisions: 
---

## Request

Depends on: JET-397, JET-398, JET-399, JET-400, JET-401, JET-402, JET-403, JET-404, JET-405, JET-406, JET-407, JET-408, JET-409.

Close the redesign with a device pass: iOS simulator full journey, an Android 2 GB profile (JET-371 picker), font scale 1.3x and 2.0x, TalkBack/VoiceOver on Home, Lyrics, Ready, Working and the video page, light theme, and re-shot screenshots compared with the artifact; re-score with mobile-design-review against design-baseline.json.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Uses mobile-mcp (now connected) for element-based taps and screenshots. Findings become follow-up tickets rather than scope creep.

## Plan

1. Run the journey on both platforms.
2. Accessibility and scale checks.
3. Screenshots into docs/ux-revamp-v2/screenshots.
4. Design review report.

## Reason

Verifies the redesign holds on real constraints before it ships.

## Related files

docs/ux-revamp-v2/*, design-baseline.json

## Acceptance criteria

No clipped primary action at 2.0x; reading order matches visual order; design review score at or above baseline; screenshots match the artifact.

## Test steps

—

## Thread
2026-11-23T15:50:10+05:30 aquib N: created ticket, status: - -> open
