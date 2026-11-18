---
id: JET-354
title: The shot list keeps every shot in its section's place; a vehicle section is all inside or all outside
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-18T15:30:15+05:30
updated: 2026-11-18T15:30:15+05:30
decisions: 
---

## Request

Shot list rule under genV2: every shot in a section happens in that section's place. A platform section never shows the inside of the train. A vehicle section is wholly inside or wholly outside. The treatment's per-section places carry the story across places instead.

## Understanding

Prompt text only, plus a cheap code check that logs any shot whose action names a different kind of place than its section.

## Plan

1. shotListV1 genV2 rule text.
2. A placeConflictsV1 log line.
3. Snapshot test for the prompt with the flag off.

## Reason

On mvr_1794989625320_48693f7a section 0's place was a metro platform, but clip 1 was 'inside a decelerating train'. Mixed places inside a section feed the still and clip drift.

## Related files

src/services/render/shotListV1.ts

## Acceptance criteria

On the Zoya song, no shot's action contradicts its section's place.

## Test steps

—

## Thread
2026-11-18T15:30:15+05:30 aquib N: created ticket, status: - -> open
