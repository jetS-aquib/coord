---
id: JET-409
title: Starter library and 'Make another like this'
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:09+05:30
updated: 2026-11-23T15:50:09+05:30
decisions: 
---

## Request

Depends on: JET-396, JET-389, JET-403.

SCREEN_REDESIGN.md §2b: a 'Start with a look' row on Home (and on first-run Pick a track) from GET /starters; a preview sheet with the example video; 'Use this look with my song' seeds the create draft (director, picks, place, mood, style, aspect, tier) and goes to Pick a track. On the video page ⋯ menu, 'Make another like this' seeds the draft from detail.recipe.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Every recipe choice stays editable. Recipes bring the person's own song in phase A (catalogue is preview-only and off); demo tracks come later. Hidden when the starters kill switch is off.

## Plan

1. starter-row.tsx, starter-sheet.tsx.
2. startFromRecipe() in create-context.
3. Make another like this.

## Reason

New users start from a finished-looking idea instead of a blank form.

## Related files

src/features/create/starter-row.tsx, starter-sheet.tsx, create-context.tsx, src/app/(app)/index.tsx, src/features/video/video-about.tsx

## Acceptance criteria

A new account sees recipes; choosing one and uploading a song reaches Ready with the recipe's director and look preselected; 'Make another like this' does the same from a finished video.

## Test steps

—

## Thread
2026-11-23T15:50:09+05:30 aquib N: created ticket, status: - -> open
