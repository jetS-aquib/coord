---
id: JET-404
title: Director, Direction and Ready in Studio Ink: top 3 directors with why, art-direction sentence and style frames, Ready as a spec sheet
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:01+05:30
updated: 2026-11-23T15:50:01+05:30
decisions: 
---

## Request

Depends on: JET-395, JET-394, JET-398.

SCREEN_REDESIGN.md §6-8 (V1 UX-011/012/013/022/023/024): Director as a list of 76dp rows with the illustrated avatars, top 3 with one line of why, More directors, I'll direct myself; Direction with the director's note, style frames (bundled stills per visual style) as the hero, the four chip groups written as one tappable sentence, an always-visible special request; Ready with frame-icon shape choice, flat quality rows with typical prices, lyric looks as frames, and the cost plus allowance in the action bar.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Director avatars are kept everywhere (user instruction). Style example stills are bundled assets chosen from existing renders (no backend). Caption-style previews depend on the existing JET-233; until it lands, render the sample word in app fonts as an approximation and say so.

## Plan

1. Director list + why.
2. Direction note, style frames, sentence-with-sheets, special field.
3. Ready: shape icons, quality rows with typical, lyric-look frames, action bar.

## Reason

The creative choices become visual and short; the director becomes a collaborator.

## Related files

src/app/(create)/director.tsx, brief.tsx, ready.tsx, src/features/create/visual-styles.ts, caption-style-sheet.tsx, assets/styles/*

## Acceptance criteria

Director shows 3 avatars with reasons; Direction fits the picks in one sentence and opens chips per word; Ready shows three distinct typical prices and the weekly allowance next to Preview stills.

## Test steps

—

## Thread
2026-11-23T15:50:01+05:30 aquib N: created ticket, status: - -> open
