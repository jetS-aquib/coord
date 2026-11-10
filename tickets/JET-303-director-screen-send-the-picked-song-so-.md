---
id: JET-303
title: Director screen: send the picked song so the right regional director comes first
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-10T22:18:53+05:30
updated: 2026-11-10T22:18:53+05:30
decisions: 
---

## Request

Pass audioUrl (and the track title) on GET /api/v1/music-videos/directors so the list is ordered for the song and defaultId pre-selects its director (JET-289).

## Understanding

Small: the screen already renders whatever list comes back, draws a monogram when avatarUrl is empty, and pre-selects defaultId unless the person already tapped. Only the request needs the song. Assumption: the draft holds the picked audio URL and title by the director screen (audio -> lyrics -> director). The first call for a song can take up to 8s; the screen already shows the bundled list first and swaps when the answer lands, which is fine. Bundled fallback list (DIRECTORS) can stay at three.

## Plan

1. directorList(): add audioUrl and title query params from the create draft.
2. Nothing else; check the four new cards render with monograms and the pre-selection follows defaultId.

## Reason

JET-289: four regional directors (Jassi Punjabi pop, Rohan Bollywood, Gauri devotional, Neel indie) are ranked by the song's researched genre and region. Without the song the app gets the general order.

## Related files

src/lib/generation.ts (directorList), src/app/(create)/director.tsx

## Acceptance criteria

Picking 'Lutt Putt Gaya' shows Rohan or Jassi first and pre-selected; an English track shows Mira first as today.

## Test steps

1. Pick a Punjabi or Bollywood track, go to the director screen: Rohan/Jassi first and selected. 2. Pick a devotional track: Gauri first. 3. Pick an English pop track: Mira first, as before. 4. New cards show monograms, not blank boxes.

## Thread
2026-11-10T22:18:53+05:30 aquib N: created ticket, status: - -> open
