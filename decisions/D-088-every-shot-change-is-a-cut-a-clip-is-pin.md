---
id: D-088
title: Every shot change is a cut: a clip is pinned to its own opening and closing still, never the next shot's
date: 2026-11-18
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-350
---

## Context

D-029 exempted only section changes from the end pin. Inside a section clip i was pinned from still i to still i+1, the NEXT shot: a different person, size and place. On mvr_1794989625320_48693f7a this morphed shots into each other (one metro into another); 17/57 clips drifted above seam 15. EDIT_V2 now hard-cuts between shots anyway.

## Options considered

1) Keep D-029. 2) Start pin only. 3) Draw a closing still per shot, drawn against its opening still, and pin both.

## Decision

Option 3, behind flags.render.shotPins: the closing still is drawn against the opening still, passes the same still check, and the seam check measures the clip's end against it. Old plans and flag off keep D-029 exactly.

## Reason

Quality first (the requester's call): a pinned arc inside one shot holds people and place for the whole clip; start-only lets the last second drift.

## Consequences

One more image and one more check per shot. The extra N+1th anchor is still drawn for resume compatibility but unused. Clips no longer wait on the next shot's still. The call sheet shows the shot's own closing still.
