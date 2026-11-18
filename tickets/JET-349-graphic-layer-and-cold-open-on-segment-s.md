---
id: JET-349
title: Graphic layer and cold open on segment stitches: block-grid wipe, split screen, B&W flash, grain, and a hook cold open
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-18T13:38:13+05:30
updated: 2026-11-18T13:38:13+05:30
decisions: 
---

## Request

Optional per-boundary and per-render effects on the hard-cut path from JET-344. Per clip: transition_in one of 'block_grid' | 'bw_flash' (absent = hard cut). Per segment-stitch: split_pair, two clip indexes shown side by side for their shared length. Per segment-concat: grain (0-1) applied once at the end, and cold_open {start, end} seconds of the finished song played first, then a 0.3s black and the song from the top.

## Understanding

Everything is absent by default and byte-identical when absent, like JET-344. The music backend sends them only under its flags.render.directorV2, and only for directors whose spec asks for graphics. Cold open needs the audio too, so it belongs in the concat that muxes the master audio. Assumed: block_grid can be built from 4x4 overlay boxes over about 6 frames.

## Plan

1. schemas/jobs.py: transition_in on ClipInput; split_pair on SegmentStitchRequest; grain and cold_open on SegmentConcatRequest.
2. Hard-cut path: a block_grid or bw_flash filter over the first frames of a clip that asks for one.
3. split_pair: hstack (vstack in 9:16) of the two clips, trimmed to the shorter.
4. Concat: optional noise=alls grain, then the cold open (trim + concat of video and audio) ahead of the song.
5. Tests: absent fields give an identical filtergraph; each effect changes only its own frames.

## Reason

The reference video uses block-grid wipes at section changes, split screens on call-and-response, B&W flash frames and a cold open on the hook. Our steal-a-style read of it (docs/rnd/steal-tu-mil-jaaye.json) lists exactly those. Every field is a deterministic ffmpeg filter, with no generation cost.

## Related files

—

## Acceptance criteria

A segment stitch with transition_in block_grid on clip 3 shows a grid wipe into clip 3 and nothing else changes. A concat with cold_open {60, 66} starts with those 6 seconds, then the song from 0, and captions stay in sync.

## Test steps

—

## Thread
2026-11-18T13:38:13+05:30 aquib N: created ticket, status: - -> open
