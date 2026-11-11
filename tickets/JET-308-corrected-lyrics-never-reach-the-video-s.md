---
id: JET-308
title: Corrected lyrics never reach the video's captions: send them on every stitch, and re-stitch a finished video when they change
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-11T16:23:40+05:30
updated: 2026-11-11T16:41:35+05:30
decisions: 
---

## Request

On staging a creator changed 'exotic' to 'XO tatted' in the lyrics editor; the finished video's captions still said 'exotic'. Editing lyrics must show in the video.

## Understanding

The stitcher has burnt creator-corrected lines since JET-267 (lyricLines on clip-stitching-with-lyrics and segment-concat, v1 and v2), and JET-266 stores corrections per user on SongReadV1.edits, but our stitch never sent them: the corrections only reached the planner. Two cases: (a) corrected before or during the render, (b) corrected after the video finished. For (b) every shot is already filmed, so only the stitch is redone: no model call, only encode time. Assumption: the creator wants every finished, captioned video of theirs on that song updated, and the old video should stay until the new one is ready.

## Plan

1. lyricLinesForStitchV1: the lines this person changed (same rule as the overlay), read fresh at stitch time.
2. Send them as lyric_lines / lyricLines on both stitch paths; absent when none, so an uncorrected request is unchanged.
3. Record burnedLyricLines on the plan.
4. PUT/DELETE /lyrics queue a re-stitch of this person's finished captioned renders on that song when the lines differ from what was burnt; serialised per render; old video kept until the new one lands and on failure; captionsUpdating on the render state. Also re-checked once after every finished render.
5. Contract note; test for the line diff.

## Reason

—

## Related files

src/services/render/lyricsEditV1.ts, src/services/render/renderOrchestratorV1.ts, src/modules/video/video-api.service.ts, src/models/RenderPlanV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

A word changed in the lyrics editor shows in the captions of a new render, and of an already-finished video within a few minutes of saving, without re-filming.

## Test steps

1. Open a song that already has a finished video with captions, change one word in the lyrics editor (e.g. exotic -> XO tatted), save.
2. The save answers `restitching: 1`; the render state shows `captionsUpdating: true` and the old video still plays.
3. A few minutes later `captionsUpdating` is false and `finalVideoUrl` is a new file: the captions show the corrected word, the shots are the same.
4. Change a word, then start a new render of that song: its captions show the corrected word.
5. Save the lyrics again without changing anything: nothing re-stitches (server log has no "stitching again").

## Thread
2026-11-11T16:23:40+05:30 aquib N: created ticket, status: - -> open
2026-11-11T16:24:14+05:30 aquib N: Built ahead of approval at the user's direct ask (staging bug). Root cause: the stitcher accepted lyricLines since JET-267 but nothing on our side sent them; the contract still said 'waits on JET-267'. Checked: both stitch calls now carry the changed lines (and only those), an uncorrected request is byte-for-byte the old one, and the stitcher reads lyricLines on both v2 routes. Could not reproduce on staging data from here: this machine's database is not staging's.
2026-11-11T16:28:23+05:30 aquib N: status: open -> approved
2026-11-11T16:41:35+05:30 aquib N: status: approved -> in_progress
2026-11-11T16:41:35+05:30 aquib N: status: in_progress -> review
