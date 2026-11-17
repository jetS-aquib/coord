---
id: JET-327
title: Re-film several shots of a finished video at once, keep the old takes for undo, and expose where each shot sits in the final video
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T15:36:21+05:30
updated: 2026-11-17T15:56:01+05:30
decisions: D-083
---

## Request

Generalise rerenderClipV1 from one clip to a set; keep clip.takes[] so an edit can be undone by swapping takes back and re-stitching; let users lock shots so range edits skip them; publish a clip map (start/end of each clip in the final output) on the poll and project; optional 'smooth the cut in' re-films the shot before the range.

## Understanding

Today rerenderClipV1 does one clip per run (409 while busy) and overwrites clip.videoUrl/finalVideoUrl in place; fixClipsV1 does many but only on blocked renders for missing shots. Default edge behaviour is a hard cut (user-confirmed); smoothing is opt-in and costs one extra clip. Undo re-stitches only, no re-filming. Clip map is derived from musicalSeconds/outSeconds as sent to stitch, so it is exact for a hard-cut stitch; segment joins may shift it by ~a crossfade, which I'll account for.

## Plan

1. clip.takes[{videoUrl, openingFrameUrl, prompt, at, editId}]; current take = videoUrl.
2. rerenderClipsV1(indices, {smoothIn}) reusing renderOneClipV1 + restillV1, one re-stitch at the end.
3. clip.locked + POST /render/:jobId/clips/:i/lock|unlock (post-spend too).
4. POST /render/:jobId/edits/:editId/undo → restore previous takes, re-stitch.
5. clipMap[] computed at stitch time, stored on plan, returned on poll and GET project.
6. Contract + tests (multi re-render, undo, lock exclusion).

## Reason

Editor studio needs range edits, undo and a time→scene mapping on the final video.

## Related files

src/services/render/renderOrchestratorV1.ts, src/models/RenderPlanV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Re-filming shots 10-14 of a completed render runs as one job with one re-stitch; undo restores the previous video without new clip spend; the poll returns a clipMap whose times match the final video.

## Test steps

1. On a finished render: `POST /api/v1/music-videos/render/:jobId/clips/rerender` body `{ "indices": [10,11,12] }` → 202 with `editId`; one run re-films exactly those three and re-stitches once.
2. Poll → `undoableEdits[0].editId` is that id; those clips show `takes: 1`; `clipMap` start/end times line up with the shots in the final video (±~0.5s).
3. `POST …/edits/:editId/undo` → 202; the render re-stitches with no clip in `generating`, and the previous video is back.
4. With `"smoothIn": true` on step 1, `refilmed` includes shot 9 as well (unless 9→10 is a section change).
5. `POST …/clips/11/lock`, then re-film `{ "indices": [11] }` → 400 "Shot 11 is locked".

## Thread
2026-11-17T15:36:21+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
2026-11-17T15:40:19+05:30 aquib N: status: open -> approved
2026-11-17T15:56:01+05:30 aquib N: status: approved -> in_progress
2026-11-17T15:56:01+05:30 aquib N: status: in_progress -> review — Built in music-jetkreate-backend (uncommitted). Contract api-music-videos updated. Render tests green.
