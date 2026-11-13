---
id: JET-317
title: Going back and tapping Go again starts a second paid render: the start chain always saves a new project
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:28+05:30
updated: 2026-11-13T13:09:33+05:30
decisions: 
---

## Request

Reuse the draft's project when starting a render, and block swipe-back on the render and call-sheet screens.

## Understanding

The backend half (one active render per project) is a separate request. I assume the draft can hold the projectId once saved, and that 'Change the direction' should revise the same project rather than make a new one.

## Plan

1. After the first saveProject, keep its id on the draft; later starts pass it.
2. Set gestureEnabled:false on working and plan; Ready uses replace instead of push.
3. Blocked 'Change the direction' keeps the project id.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 1 (mobile half). working/[id].tsx:265 calls saveProject without an id, so every run of the fresh chain creates a new project (no 409 protection). iOS swipe-back works on working and plan (no gestureEnabled:false in app/(create)/_layout.tsx) and Ready pushes, so Go can be tapped twice. 'Change the direction' from blocked does the same.

## Related files

src/app/(create)/working/[id].tsx, src/app/(create)/_layout.tsx, src/app/(create)/ready.tsx, src/features/create/create-context.tsx

## Acceptance criteria

From Ready, any back/forward path ends with one project and one render.

## Test steps

1. Pick a song, go to Ready, tap Go.
2. Try swiping back from the render screen: it does not go back.
3. In the Library there is one new project, not two.

## Thread
2026-11-13T13:07:28+05:30 aquib N: created ticket, status: - -> open
2026-11-13T13:09:33+05:30 aquib N: status: open -> approved
