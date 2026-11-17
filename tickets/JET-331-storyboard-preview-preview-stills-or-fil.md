---
id: JET-331
title: Storyboard preview: 'Preview stills' or 'Film now', then an animatic of the real stills over the song
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-17T15:36:51+05:30
updated: 2026-11-17T15:36:51+05:30
decisions: 
---

## Request

On the ready/call-sheet step offer 'Preview stills' (default) and 'Film now'. After the preview, play an on-device animatic: each shot's still for its musicalSeconds at its startSeconds with a slow zoom, over the actual audio, with the section strip as scrubber. Edits from the edit bar redraw just those stills; 'Film' starts the render.

## Understanding

Backend preview mode is JET-325 (accept {mode}). The animatic is client-only (expo-video not needed; Image + Reanimated scale + the existing TrackPlayer), no server render. Assumption: 'Preview stills' becomes the default and the review gate default turns on with it.

## Plan

1. Ready/call sheet: two actions, accept with mode.
2. Working screen: handle 'previewing' with a stills-drawing progress view.
3. Animatic player component (stills timed by startSeconds, Ken Burns zoom, audio sync, tap to select shot).
4. Hook edit bar (from the call sheet request) into the animatic; refresh redrawn stills.
5. 'Film' → accept mode film → existing working flow.

## Reason

Users should see and steer the look before paying for video.

## Related files

src/app/(create)/ready.tsx, src/app/(create)/plan.tsx, src/app/(create)/working/[id].tsx, src/lib/generation.ts

## Acceptance criteria

Choosing Preview shows every still, the animatic plays in sync with the song, an edit redraws only the chosen stills, and Film starts filming without redrawing them.

## Test steps

—

## Thread
2026-11-17T15:36:51+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:02+05:30 aquib N: The 'call sheet request' referenced in the plan is JET-330 (shared EditBar). Needs backend JET-325.
