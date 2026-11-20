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

Setup: video-processing with JET-362 deployed; flags.render.filmFinish = true; restart.
1. Film a realistic-style song: the master has a soft contrast curve, slightly lifted blacks, a touch less saturation, a warm glow off highlights and fine even grain across every cut; the lyrics are clean (not grained).
2. Film an artistic style (anime, watercolour…): no finish.
3. scripts/rnd/renderReport.ts <jobId>: stitch.finish 'film' and stitch.concatSeconds; compare concatSeconds and file size with a flag-off render of the same song.
4. filmFinish false: the master is today's, byte for byte.
Regression sheet row TC-095.

## Thread
2026-11-18T17:34:08+05:30 aquib N: created ticket, status: - -> open
2026-11-20T11:48:38+05:30 aquib N: status: open -> approved
2026-11-20T12:03:58+05:30 aquib N: HANDOFF (video side built in video-processing-backend, uncommitted at time of writing; contract: .coord/contracts/video-segments.md 'Cold open and film finish'). segment-concat now takes finish:'film' (absent = today's output): soft S-curve, blacks lifted ~4%, saturation x0.9, warm halation off highlights, fine temporal luma grain, applied once on the joined master BEFORE captions burn (lyrics stay clean). Costs one extra crf-16 encode of the joined master; compare encode time in renderReport. This is the only grain; JET-349's grain was folded in here. MUSIC HALF TO DO (music-jetkreate-backend): (5) flags.render.filmFinish (off) in src/config/flags.ts + releaseCheck list; send finish:'film' on the segment-concat call in src/modules/video/video-api.service.ts, from stitchInSegmentsV1 in src/services/render/renderOrchestratorV1.ts (~line 4730), only for realistic styles (same rule JET-359's realism uses; artistic styles stay clean); (6) before/after frames from one Tu Mil Jaaye master, plus encode time and file size before and after. Related: JET-359 (photoreal stills) is the generation half of the same look.
2026-11-20T12:30:39+05:30 aquib N: Music half built (uncommitted): flags.render.filmFinish (off, in the release list); finish:'film' on segment-concat for realistic styles only (realisticStyleV1); plan.stitchInfo.finish + concatSeconds for the report. Live on mvr_1795085795309_80e429b5, same segments, concat with and without finish: both OK. FINDINGS FOR THE VIDEO SIDE before this is switched on: (1) the master is 4x bigger: 296 MB at 10.6 Mbps vs 75 MB at 2.7 Mbps for 3:44 — grain is noise the encoder spends bits on; the final encode needs a bitrate cap or a higher crf, or downloads and playback on phones suffer. (2) The grade reads strongly magenta/purple and darker on that night scene (frames at 0:02 and 1:00 compared side by side), not the gentle curve the request describes; the colour balance of the curve or the halation tint needs tuning. Encode times (548s plain vs 349s with finish) are not comparable: the first run was cold.
