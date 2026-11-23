---
id: JET-401
title: Lyrics: karaoke view with the sung line large, coral underline, and edit in place
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:49:57+05:30
updated: 2026-11-23T18:11:55+05:30
decisions: 
---

## Request

Depends on: JET-398, JET-400.

Redesign the Lyrics check per SCREEN_REDESIGN.md §5 (V1 UX-010): active line in lyricLive with a coral underline that grows over the line's duration, neighbours at 60%, the rest at 30%; transparent header; dock with coral play, mini waveform and 'Looks right'; Edit turns lines into underlined inputs in place and opens on the tapped line.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Uses the existing per-line edit/undo and lyrics save; frontend only. Dimmed lines must stay >= 3:1 at their size. Reduced motion jumps instead of scrolling.

## Plan

1. LyricLines component.
2. Dock with mini SongTimeline.
3. Edit-in-place mode.
4. Accessibility: hint on lines ('double tap to play from here').

## Reason

The one musical moment of the setup flow, and a mandatory step.

## Related files

src/app/(create)/lyrics.tsx, src/features/create/lyrics.ts

## Acceptance criteria

Playing Zaaya, the current line is 26px with a coral underline advancing; tapping a line seeks; Edit opens on that line and undo still works.

## Test steps

—

## Thread
2026-11-23T15:49:57+05:30 aquib N: created ticket, status: - -> open
2026-11-23T18:10:43+05:30 aquib N: status: open -> approved
2026-11-23T18:11:55+05:30 aquib N: status: approved -> in_progress — Working on it
