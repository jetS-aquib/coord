---
id: JET-318
title: 'Start filming' and 'Try again' do nothing: they reload the render screen instead of starting a render
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:29+05:30
updated: 2026-11-13T15:25:41+05:30
decisions: 
---

## Request

Make the idle 'Start filming' and failed 'Try again' buttons actually start a render.

## Understanding

I assume the right start for an existing project is startRender with that project's id (backend returns 409 if one is already active, which the screen already handles).

## Plan

1. Give the buttons a start() that calls startRender for projectId.current, then sets running with the jobId.
2. Remove the unreachable branch at :308.
3. Map a 409 to re-attach.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 5. Both buttons do setTick (working/[id].tsx:740, 756). The effect re-runs, projectId.current is set, so it takes the re-attach branch (150-211), finds no active render and shows idle again. startRender is never called. Every saved-but-not-started project is stuck.

## Related files

src/app/(create)/working/[id].tsx, src/lib/generation.ts

## Acceptance criteria

Start filming on an idle project starts a render; Try again on a failed one starts a new render.

## Test steps

1. Open a project that was saved but never rendered.
2. Tap Start filming.
3. The screen moves to planning/rendering and the backend log shows a new render.

## Thread
2026-11-13T13:07:29+05:30 aquib N: created ticket, status: - -> open
2026-11-13T15:25:41+05:30 aquib N: status: open -> approved
