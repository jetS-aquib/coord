---
id: JET-320
title: Library and video screen show the wrong state: failed, blocked and paused all look like 'Rendering', and 'Updating captions' never times out
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:31+05:30
updated: 2026-11-13T15:25:52+05:30
decisions: 
---

## Request

Show the render's real state on Library cards and the video screen, and stop the captions banner after a timeout.

## Understanding

The list and project GET already return renderStatus/resumable/stalled beside status (musicVideo.controller.ts:17). I assume labels: Failed, Needs you (blocked), Paused, Rendering. Captions timeout 15 minutes, matching the backend sweep.

## Plan

1. Poster and video screen read renderStatus first, then status.
2. Blocked/paused/failed cards open the render screen, which already shows the right view.
3. Captions banner: start polling after a lyrics save too (use the PUT's restitching), stop after 15 minutes with a quiet note.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 7 and 10 (mobile half). The project status has three values, so video-poster.tsx:68 shows Rendering for failed/blocked/paused, and video/[id].tsx:309 shows 'Still rendering' with no poll. A blocked render that needs the user is invisible. The captions poll (video/[id].tsx:93-104) only starts if the flag is already true and never times out.

## Related files

src/components/video-poster.tsx, src/app/(app)/video/[id].tsx, src/lib/music-videos.ts, src/lib/generation.ts

## Acceptance criteria

A blocked render shows 'Needs you' in the Library; a failed one shows Failed; the captions banner never outlives 15 minutes.

## Test steps

1. Make a render end blocked (or set it in Mongo).
2. The Library card says it needs you; tapping it opens the fix screen.
3. Set captionsUpdating true by hand: the banner goes away after 15 minutes.

## Thread
2026-11-13T13:07:31+05:30 aquib N: created ticket, status: - -> open
2026-11-13T15:25:52+05:30 aquib N: status: open -> approved
