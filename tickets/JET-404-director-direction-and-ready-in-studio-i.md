---
id: JET-404
title: Director, Direction and Ready in Studio Ink: top 3 directors with why, art-direction sentence and style frames, Ready as a spec sheet
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:50:01+05:30
updated: 2026-11-23T18:11:55+05:30
decisions: 
---

## Request

Depends on: JET-395, JET-394, JET-398, JET-412, JET-413.

SCREEN_REDESIGN.md §6-8 (V1 UX-011/012/013/022/023/024): Director as a list of 76dp rows with the illustrated avatars, top 3 with one line of why, More directors, I'll direct myself; Direction with the director's note, style frames (bundled stills per visual style) as the hero, the four chip groups written as one tappable sentence, an always-visible special request; Ready with frame-icon shape choice, flat quality rows with typical prices, lyric looks as frames, and the cost plus allowance in the action bar.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Director avatars are kept everywhere (user instruction). Style example stills are bundled assets chosen from existing renders (no backend). Caption-style previews depend on the existing JET-233; until it lands, render the sample word in app fonts as an approximation and say so. REVISED 2026-11-23: style stills and lyric-look previews come from the 'styles' and 'lyricLooks' config bundles (JET-412) through useConfig (JET-413), with embedded defaults, instead of being bundled assets.

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

1. Director: 3 rows with avatars and one reason each, More directors shows the rest, I'll direct myself last, button 'Continue with <name>'.
2. Direction: director's note in italic serif at the top, style frames; tapping a frame moves the ring.
3. Tap an underlined word in the sentence: a sheet of chips opens; picking one updates the sentence. Type a film name in Anything special? and Continue: 'Reading your request' still appears.
4. Ready: Tall/Wide frame icons; three different 'about $X' prices; action bar shows 's · up to $X · m:ss left this week'.
5. With lyrics on, tap a 'Zaaya' frame (ring moves) and a dot on the 9:16 grid (big dot moves).

## Thread
2026-11-23T15:50:01+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:06:31+05:30 aquib N: Revised in place 2026-11-23 (unapproved): see the REVISED note in Understanding and the updated Depends on line. Reason: remote-config design (JET-411..413) and the person's reprioritisation (auth backend later with Google sign-in, auth UI now, push last).
2026-11-23T18:10:46+05:30 aquib N: status: open -> approved
2026-11-23T18:11:55+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T18:23:22+05:30 aquib N: Built, not committed. Director: 76dp rows, avatars, top 3 with server why, More directors, I'll direct myself. Direction: director's note, style frames (colour swatches until JET-413 config stills), picks as one tappable sentence opening a Sheet per group, special request always visible. Ready: frame-icon shape choice, flat quality rows with typical prices, lyric looks as 'Zaaya' frames in app fonts (JET-233 previews pending), 9:16 position grid with 44pt cells; caption-style-sheet.tsx removed. No 'director's pick' on styles: the brief returns no style recommendation.
