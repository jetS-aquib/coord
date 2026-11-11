---
id: JET-309
title: After saving lyrics, show 'Updating captions' on a finished video and swap to the new file when it lands
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-11T16:24:06+05:30
updated: 2026-11-11T16:28:28+05:30
decisions: 
---

## Request

Backend JET-308 re-stitches a finished video when the creator saves corrected lyrics. The app should say so and pick up the new video.

## Understanding

PUT/DELETE /lyrics now return restitching (count of finished videos being re-stitched). While it runs, the render state has captionsUpdating: true and the old finalVideoUrl still plays; when done, finalVideoUrl changes and captionsUpdating goes false (about the stitch time, 1-5 min). Assumption: the app may cache the video by URL; the new file has a new URL so a refresh is enough.

## Plan

1. After a lyrics save with restitching > 0, tell the creator their video is getting the new words.
2. On the video screen, show 'Updating captions…' while captionsUpdating is true (poll or SSE as today).
3. Reload the player when finalVideoUrl changes.

## Reason

—

## Related files

—

## Acceptance criteria

Change a word in the lyrics of a song with a finished video: the video screen says captions are updating, then plays the new video with the corrected word.

## Test steps

—

## Thread
2026-11-11T16:24:06+05:30 aquib N: created ticket, status: - -> open
2026-11-11T16:28:28+05:30 aquib N: status: open -> approved
