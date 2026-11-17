---
id: JET-330
title: Call sheet you can approve at a glance: section filmstrips with stills, Approve all, multi-select and one edit bar
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-17T15:36:50+05:30
updated: 2026-11-17T15:37:03+05:30
decisions: D-083
---

## Request

Redesign app/(create)/plan.tsx: each song section is a horizontal filmstrip of shot cards (still, one-line action, duration); prose (beat, notes, why) behind an info tap; 'Approve all' at the top; long-press to multi-select, tap a section header to select it, 'From here on' in the card menu; one shared edit bar ('What should change?' + scope chip: This shot / N selected / From shot N on / Whole video) replacing the shot-override modal (size/lane/duration become quick chips); show errors instead of swallowing them; refresh only edited cards.

## Understanding

Today the sheet is 31-45 prose rows, one edit takes 4+ taps, failures are swallowed (plan.tsx:125-129) and plateUrl is never shown. Stills per row come from JET-325; the scoped edit call from JET-326. Until JET-325 lands, cards show the plate/cast as placeholders. The same edit bar component is reused by the editor studio (JET-332). Assumption: back navigation stays as is.

## Plan

1. Shot card + section filmstrip components.
2. Selection state (single/multi/section/from-here) shared with the edit bar.
3. EditBar component: instruction input, scope chip, quick chips; calls /edits dry run, shows diff+cost, applies.
4. Approve all → accept; error toasts; per-card refresh.
5. Replace shot-override modal usage.

## Reason

Review must not be cumbersome for serious users.

## Related files

src/app/(create)/plan.tsx, src/features/create/shot-override.tsx, src/lib/generation.ts

## Acceptance criteria

A 40-shot plan can be approved in one tap; changing three shots to night takes: select, type, confirm; a failed edit shows a message.

## Test steps

—

## Thread
2026-11-17T15:36:50+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: Needs backend JET-325 (stills on rows) and JET-326 (edit API).
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
