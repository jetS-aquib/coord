---
id: JET-310
title: Add captionsUpdating to GET /api/music-videos/:id so a finished video can say its captions are being updated
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-11T16:39:05+05:30
updated: 2026-11-11T16:41:36+05:30
decisions: 
---

## Request

Return captionsUpdating (true while a finished render of this project is being re-stitched with corrected lyrics) on the music video record from GET /api/music-videos/:id.

## Understanding

The video screen (opened from Your videos by project id) polls GET /api/music-videos/:id. I assume the flag can be read from the project's newest completed RenderPlanV1 (captionsUpdating) when building that response, as an optional boolean (absent = false). finalVideoUrl on the same record already updates when the re-stitch lands (MusicVideo.updateOne in restitchOneV1). Alternative I would accept: let GET /:id/render also return a completed plan while captionsUpdating is true.

## Plan

1. In the GET /api/music-videos/:id handler, look up the project's newest completed plan and add captionsUpdating: Boolean(plan.captionsUpdating). 2. Document the field in api-music-videos.md. 3. Mobile (JET-309) already polls every 6s while it is true and swaps the player when finalVideoUrl changes.

## Reason

JET-308 sets captionsUpdating on the render state, but GET /api/v1/music-videos/:id/render answers 404 once a render is completed, and the project record has no such field. The video screen only knows the project id, so it cannot learn the jobId or the flag.

## Related files

src/modules/musicVideo (GET /api/music-videos/:id), .coord/contracts/api-music-videos.md

## Acceptance criteria

Save a changed lyric on a song with a finished video; GET /api/music-videos/:id shows captionsUpdating: true until the new stitch lands, then false with a new finalVideoUrl.

## Test steps

1. On a song with a finished, captioned video, change one word in the lyrics editor and save (`restitching: 1`).
2. `GET /api/music-videos/:id` for that project: `captionsUpdating: true`, and `finalVideoUrl` is still the old video.
3. A few minutes later the same call shows `captionsUpdating: false` and a new `finalVideoUrl` with the corrected word in its captions.

## Thread
2026-11-11T16:39:05+05:30 aquib N: created ticket, status: - -> open
2026-11-11T16:40:51+05:30 aquib N: Checked: legit. GET /:id/render only returns running or resumable renders (findResumablePlanV1), so a finished one is 404, and the project GET returns the stored record with no such field. Built differently from the plan: the flag is written onto the MusicVideo record next to finalVideoUrl (which the re-stitch already updates), so GET /api/music-videos/:id returns it with no extra lookup on every poll. Same field name and meaning; absent on old records = false.
2026-11-11T16:41:19+05:30 aquib N: status: open -> approved
2026-11-11T16:41:35+05:30 aquib N: status: approved -> in_progress
2026-11-11T16:41:36+05:30 aquib N: status: in_progress -> review
