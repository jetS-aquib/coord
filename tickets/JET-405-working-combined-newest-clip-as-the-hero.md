---
id: JET-405
title: Working, combined: newest clip as the hero, five-stage rail, one count, shot strip, quiet controls; call sheet with one coral commit
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:03+05:30
updated: 2026-11-23T15:50:03+05:30
decisions: 
---

## Request

Depends on: JET-390, JET-389, JET-398.

SCREEN_REDESIGN.md §9-10 (V1 UX-044/045/047): keep today's hero that swaps to each new clip, the shot strip with ticks, the cutting collage and the full-screen Watch; add the Plan·Cast·Frames·Film·Cut rail over the image and a single count from clipsDone/clipsTotal; Pause and Stop as tertiary (Stop destructive), Leave it running secondary. Call sheet: close in the header, pitch once, cast as portrait frames with the short summary (not prompt text), footer padding so nothing hides under it, one commit 'Film N shots' in coral.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Counts come from one source so '4 of 5' never sits over '5 of 5 ready' (JET-336's checking stage is reused). Opening copy names the storyboard step instead of repeating 'Reading your track'. Cast summary comes from the render poll.

## Plan

1. StageRail + headline + count.
2. Restyle ShotReel/ShotStrip/AssemblyCollage/done state.
3. Controls.
4. Call sheet: header close, cast summary, single approval, padding.

## Reason

The production moment the user liked, made honest and consistent.

## Related files

src/app/(create)/working/[id].tsx, src/app/(create)/plan.tsx, src/features/create/shot-reel.tsx, shot-strip.tsx, assembly-collage.tsx, planning-stage.tsx, cast-portrait.tsx, narration.ts

## Acceptance criteria

During a 5-shot render the headline and strip always agree; the call sheet's cast card shows a short summary; 'Film 5 shots' is the only coral button in the create flow; Approve all is no longer separate.

## Test steps

—

## Thread
2026-11-23T15:50:03+05:30 aquib N: created ticket, status: - -> open
