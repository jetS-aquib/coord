---
id: JET-349
title: Graphic layer and cold open on segment stitches: block-grid wipe, split screen, B&W flash, grain, and a hook cold open
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-18T13:38:13+05:30
updated: 2026-11-20T11:48:26+05:30
decisions: 
---

## Request

Optional per-boundary and per-render effects on the hard-cut path from JET-344. Per clip: transition_in one of 'block_grid' | 'bw_flash' (absent = hard cut). Per segment-stitch: split_pair, two clip indexes shown side by side for their shared length. Per segment-concat: grain (0-1) applied once at the end, and cold_open {start, end} seconds of the finished song played first, then a 0.3s black and the song from the top.

## Understanding

Everything is absent by default and byte-identical when absent, like JET-344 (deployed: cutStyle 'hard' and zoom are live in video-processing 61208f9). Fields: per clip transition_in 'block_grid' | 'bw_flash'; per segment-stitch split_pair [i, j]; per segment-concat cold_open {start, end}. Grain moves to JET-362 (finish: 'film') so there is one grain, applied once, not two. Cold open needs the audio, so it belongs in the concat that muxes the master audio; captions must shift by the cold open's length plus the 0.3s black. Assumed: block_grid = 4x4 overlay boxes over ~6 frames; split_pair is hstack (vstack in 9:16), both halves cropped to fill, trimmed to the shorter clip.

Both ends, one sitting (every dev owns every repo). The music-backend half has no ticket of its own and is part of this one: a director's spec says which graphics it uses (DirectorSpecV2.graphics), EDIT_V2's planner (subShotV1) places them at section changes and call-and-response, and the stitch call sends them, all under a new flags.render.graphicLayer (off), so today's renders are unchanged. Reference: docs/rnd/steal-tu-mil-jaaye.json.

## Plan

video-processing-backend:
1. schemas/jobs.py: transition_in on ClipInput; split_pair on SegmentStitchRequest; cold_open on SegmentConcatRequest.
2. Hard-cut path: block_grid / bw_flash filter over the first frames of a clip that asks for one.
3. split_pair: hstack/vstack of the two clips, trimmed to the shorter.
4. Concat: cold open (trim + concat of video and audio) ahead of the song, 0.3s black, captions offset.
5. Tests: absent fields give an identical filtergraph; each effect changes only its own frames.
music-jetkreate-backend:
6. DirectorSpecV2.graphics on the directors whose look uses them (street-pulse, neon-chase); flags.render.graphicLayer (off) + releaseCheck list.
7. subShotV1: block_grid at section changes, bw_flash on a loud downbeat at most once per section, split_pair on call-and-response lines; cold open = the first chorus's first bar-aligned 4-6s.
8. Stitch call sends the fields only under the flag; the renderReport lists what was placed.
9. One render with the flag on and one off of the same song, side by side.

## Reason

The reference video uses block-grid wipes at section changes, split screens on call-and-response, B&W flash frames and a cold open on the hook. Our steal-a-style read of it (docs/rnd/steal-tu-mil-jaaye.json) lists exactly those. Every field is a deterministic ffmpeg filter, with no generation cost.

## Related files

—

## Acceptance criteria

A segment stitch with transition_in block_grid on clip 3 shows a grid wipe into clip 3 and nothing else changes. A concat with cold_open {60, 66} starts with those 6 seconds, then the song from 0, and captions stay in sync.

## Test steps

Setup: video-processing with JET-349 deployed; in src/config/flags.ts set flags.render.graphicLayer = true (directorV2 and editV2 are already on); restart.
1. Film a song with the street-pulse director (Zoya) on Standard. Server log: "[editV2] … graphics {blockGrid, bwFlash, splitPairs, coldOpen}".
2. Watch the video: it opens with 4-6s of the chorus (or the loudest section when none is labelled chorus), 0.3s of black, then the song from the start; captions stay in sync after the jump.
3. A black-block grid wipe at each section change; one short black-and-white flash at most per section, on a loud beat; one split screen of two different people in the hook (stacked in portrait).
4. A neon-chase render: wipes, flashes and cold open, no split screen. Any other director: no graphics at all.
5. A Hook render (it starts on its chorus): no cold open.
6. graphicLayer back to false: the same song renders with none of the above. scripts/rnd/renderReport.ts <jobId> shows stitch.graphics.
Regression sheet row TC-094.

## Thread
2026-11-18T13:38:13+05:30 aquib N: created ticket, status: - -> open
2026-11-20T11:48:26+05:30 aquib N: status: open -> approved
2026-11-20T12:03:57+05:30 aquib N: HANDOFF (video side built in video-processing-backend, uncommitted at time of writing; contract: .coord/contracts/video-segments.md 'Graphic layer' + 'Cold open and film finish'). Fields now live: per clip transitionIn 'block_grid'|'bw_flash' (drawn on the clip's own first 0.2s/0.1s, never moves a cut); segment-stitch splitPair [i, j] = clip ORDERs, clip i plays with j beside it (below in portrait) for the SHORTER of the two, and clip j is dropped from the sequence, so the planner must budget the segment's length without j; segment-concat coldOpen {start, end} (master clock, after any audio window, max 15s): that stretch plays first, then 0.3s black/silence, then the song from 0, captions shifted by end-start+0.3 automatically; a coldOpen ending within 0.3s of the master's end fails the job. Grain is NOT here, it is finish:'film' (JET-362). Absent fields = today's output. MUSIC HALF TO DO (music-jetkreate-backend): (6) DirectorSpecV2.graphics on street-pulse, neon-chase + flags.render.graphicLayer (off) + releaseCheck; (7) subShotV1: block_grid at section changes, bw_flash on a loud downbeat max once per section, splitPair on call-and-response lines, coldOpen = first chorus's first bar-aligned 4-6s from song read; (8) video-api.service.ts: add transitionIn to ClipInput type (~line 92), splitPair to the segment-stitch body (~line 928), coldOpen to the segment-concat body; renderOrchestratorV1.ts clip mapping (~line 4701) and stitchInSegmentsV1 (~line 4730) send them only under the flag; renderReport lists what was placed; (9) one render flag on/off same song side by side. Mobile cold-open toggle is JET-346 (blocked on JET-377).
