---
id: JET-332
title: Editor studio on the video screen: scene strip under the player, select scenes, type the change, see before/after, film, undo
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-17T15:36:51+05:30
updated: 2026-11-17T15:36:51+05:30
decisions: 
---

## Request

Under the player on app/(app)/video/[id].tsx add a scene strip (one thumbnail per clip from clipMap) that highlights the playing scene and seeks on tap. Select one / several / a section / from here on, then use the same edit bar: dry run (affected shots + cost) → confirm → before/after stills → 'Film these N shots' → progress → new video. Offer 'Smooth the cut in' (off by default), lock/keep on a shot, and Undo edit.

## Understanding

Backend: clipMap, multi-clip re-render, takes/undo and locks are JET-327; the edit API is JET-326. Edge default is a hard cut (user-confirmed). Reuses the EditBar and selection from the call sheet request and ShotStrip/thumbnails code. The video screen today only plays/shares/deletes and has no clip-to-time mapping.

## Plan

1. Scene strip bound to clipMap + player position.
2. Selection + EditBar reuse; dry run sheet.
3. Before/after stills compare; Film these N shots; poll progress (reuse working-screen pieces).
4. Smooth-in toggle, lock toggle, Undo edit.
5. Error states for 409 busy and failed edits.

## Reason

Users need to fix specific parts of a finished video by prompt, without re-rendering everything.

## Related files

src/app/(app)/video/[id].tsx, src/features/create/shot-strip.tsx, src/lib/generation.ts

## Acceptance criteria

On a finished video, selecting shots 10+ and typing 'make it night' shows a dry run, then before/after stills, then a new video where only those shots changed; Undo restores the previous video.

## Test steps

—

## Thread
2026-11-17T15:36:51+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: The 'call sheet request' referenced is JET-330 (EditBar + selection). Needs backend JET-326 and JET-327.
