---
id: JET-362
title: Film finish on the stitched master: one grade over the edit, matched grain and light halation, behind a request flag
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-18T17:34:08+05:30
updated: 2026-11-18T17:34:08+05:30
decisions: 
---

## Request

An optional 'finish' on segment-stitch / segment-concat: one grade applied over the whole edit (gentle contrast curve, slightly lifted blacks, mild desaturation), film grain at ~15-20% matched across clips, and a light halation on highlights. Requested per call (e.g. finish: 'film'); absent = today's output byte for byte.

## Understanding

Part of JET-359 (photoreal look). Research: grain belongs in post, added last and the same over every clip; a single grade over the edit hides clip-to-clip colour jumps that read as AI. Assumed: ffmpeg filters only (curves/eq, noise or a grain overlay, a blurred-highlight blend for halation), applied once on the final pass so no extra re-encode; music-jetkreate-backend sends the field under its own flag; no change to the response shape.

## Plan

1. Accept optional finish on segment-stitch and segment-concat.
2. ffmpeg chain for 'film': curves + eq saturation, temporal grain, highlight halation.
3. Apply once on the final encode only.
4. Absent field = unchanged output.
5. Sample before/after frames from one Tu Mil Jaaye master.

## Reason

AI clips each carry their own colour and are too clean; a shared finish is what makes them read as one filmed piece.

## Related files

transition_selector / stitch pipeline (video-processing-backend)

## Acceptance criteria

With finish:'film', the master shows even fine grain and one consistent grade across cuts; without it, output unchanged.

## Test steps

—

## Thread
2026-11-18T17:34:08+05:30 aquib N: created ticket, status: - -> open
