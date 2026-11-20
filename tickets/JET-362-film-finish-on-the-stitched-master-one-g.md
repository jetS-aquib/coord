---
id: JET-362
title: Film finish on the stitched master: one grade over the edit, matched grain and light halation, behind a request flag
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-18T17:34:08+05:30
updated: 2026-11-20T11:48:38+05:30
decisions: 
---

## Request

An optional 'finish' on segment-stitch / segment-concat: one grade applied over the whole edit (gentle contrast curve, slightly lifted blacks, mild desaturation), film grain at ~15-20% matched across clips, and a light halation on highlights. Requested per call (e.g. finish: 'film'); absent = today's output byte for byte.

## Understanding

Part of JET-359 (photoreal look). Grain belongs in post, added last and the same over every clip; a single grade over the edit hides clip-to-clip colour jumps that read as AI. Assumed: ffmpeg filters only (curves/eq, temporal noise, a blurred-highlight blend for halation), applied once on the final pass (segment-concat, which already re-encodes for captions) so there is no extra encode. finish takes 'film' only for now; absent = today's output byte for byte. This is the only grain: JET-349's grain field moved here.

Both ends, one sitting. The music-backend half is part of this ticket: send finish: 'film' on segment-concat under a new flags.render.filmFinish (off), only for realistic styles (the same rule JET-359's realism uses; artistic styles stay clean). Captions are burnt after the finish so lyrics are not grained.

## Plan

video-processing-backend:
1. Accept optional finish on segment-concat (and the single-request stitch, for parity).
2. ffmpeg chain for 'film': curves (soft S, blacks lifted ~4%), eq saturation ~0.9, temporal grain ~15-20%, halation = blurred highlights blended warm at low opacity.
3. Applied once, before captions, on the final encode.
4. Absent field = unchanged output (test the filtergraph string).
music-jetkreate-backend:
5. flags.render.filmFinish (off) + releaseCheck list; send finish: 'film' for realistic styles only.
6. Before/after frames from one Tu Mil Jaaye master, plus encode time and file size before and after.

## Reason

AI clips each carry their own colour and are too clean; a shared finish is what makes them read as one filmed piece.

## Related files

video-processing-backend: app/schemas/jobs.py (SegmentConcatRequest), app/services/job_service.py, the concat ffmpeg chain. music-jetkreate-backend: src/modules/video/video-api.service.ts (segment-concat call), src/services/render/renderOrchestratorV1.ts (stitchInSegmentsV1), src/config/flags.ts.

## Acceptance criteria

With finish:'film', the master shows even fine grain and one consistent grade across cuts; without it, output unchanged.

## Test steps

—

## Thread
2026-11-18T17:34:08+05:30 aquib N: created ticket, status: - -> open
2026-11-20T11:48:38+05:30 aquib N: status: open -> approved
