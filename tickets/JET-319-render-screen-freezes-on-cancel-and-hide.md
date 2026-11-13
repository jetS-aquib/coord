---
id: JET-319
title: Render screen freezes on cancel and hides lost contact: the poll ignores cancelled and swallows every error
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:30+05:30
updated: 2026-11-13T15:25:44+05:30
decisions: 
---

## Request

Handle every terminal render status in the poll, and show when the app has lost contact or the session expired.

## Understanding

Statuses per api-music-videos.md plus planning and review. I assume 'lost contact' after about 5 failed polls in a row is the right threshold, and that a 401 should go to sign-in like the (app) group does.

## Plan

1. Poll: cancelled and failed -> the existing stopped() view; unknown statuses keep polling (default branch).
2. Count consecutive poll failures; after 5 show 'Lost connection, retrying' and back off to 15s.
3. 401 -> expire session and route to sign-in; 404 -> stopped view.
4. Add the same auth redirect to (create)/_layout as (app).

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 6. The poll (working/[id].tsx:371-424) has no cancelled branch, so a cancel from elsewhere falls through to running, liveJob goes null, polling stops, and the screen sits on 'Making your video'. The catch at :425 swallows 401/404/network forever. The (create) group has no auth gate.

## Related files

src/app/(create)/working/[id].tsx, src/app/(create)/_layout.tsx

## Acceptance criteria

A cancel from another device shows 'Stopped' within one poll. Airplane mode shows 'Lost connection' and recovers when back online.

## Test steps

1. Start a render on the phone, cancel it with curl.
2. Within 5 seconds the phone shows it stopped.
3. Start another, turn on airplane mode: after ~20s the screen says it lost connection; turn it off and it carries on.

## Thread
2026-11-13T13:07:30+05:30 aquib N: created ticket, status: - -> open
2026-11-13T15:25:44+05:30 aquib N: status: open -> approved
