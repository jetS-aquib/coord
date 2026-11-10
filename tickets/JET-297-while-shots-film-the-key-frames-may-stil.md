---
id: JET-297
title: While shots film, the key frames may still be drawing: show both on the progress line
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-10T15:04:53+05:30
updated: 2026-11-10T15:06:47+05:30
decisions: 
---

## Request

In the 'rendering' progress line, when anchorsDone < anchorsTotal, also say how many key frames are drawn, e.g. 'Filming 4 shots right now. 3 of 35 done. Key frames 20 of 36.'

## Understanding

Only the progress text changes; anchorsDone and anchorsTotal are already in the render state (generation.ts:412-413). When they are equal, the line is exactly today's. Assumption: no new screen or visual element, just the sentence.

## Plan

Depends on: JET-296.
1. In the 'rendering' case, append 'Key frames {anchorsDone} of {anchorsTotal}.' when anchorsDone < anchorsTotal.
2. Nothing else.

## Reason

Backend JET-296 starts filming a shot as soon as its two stills are ready, so status turns 'rendering' while stills are still being drawn. Today the 'rendering' line (src/lib/generation.ts, the case 'rendering' near line 1419) only counts clips, so the key frames would silently stop being reported halfway.

## Related files

src/lib/generation.ts

## Acceptance criteria

During a render, the progress line shows key frame progress until the last still is drawn, then reads exactly as today.

## Test steps

—

## Thread
2026-11-10T15:04:53+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:06:47+05:30 aquib N: status: open -> approved
