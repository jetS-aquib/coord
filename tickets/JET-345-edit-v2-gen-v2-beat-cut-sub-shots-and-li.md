---
id: JET-345
title: EDIT_V2 + GEN_V2: beat-cut sub-shots and livelier shot prompts for new renders, both flags off by default
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-18T01:21:25+05:30
updated: 2026-11-18T01:23:09+05:30
decisions: 
---

## Request

Make renders from now on feel alive, backend only. EDIT_V2: cut each finished clip into beat-length pieces with punch-ins, sized by the song's energy, and drop black or drifted clips. GEN_V2: prompt text for 3-4 places, one outfit change, moving cameras, one action per shot, and an anti-cliché list.

## Understanding

Both flags live in src/config/flags.ts, default false, and act as kill switches. Flag off = today's requests and prompts, proved by deep-equal and snapshot tests. No new generation calls: EDIT_V2 re-uses the clips each render already paid for. It needs JET-344 in video-processing-backend for hard cuts and zoom. Until that deploys, an EDIT_V2 stitch that fails falls back to today's stitch once. No mobile build. Lyric size is out of scope.

## Plan

1. scripts/rnd/analyzeVideo.ts plus docs/rnd/baseline.json and 00-architecture.md (scoreboard).
2. src/services/render/subShotV1.ts (pure): energy per bar -> piece length (2 bars / 2 beats / 1 beat), interleave the section's clips, zoom 1.0/1.25/1.5, no back-to-back repeats, piece lengths sum to each clip's musicalSeconds; drop clipCheck people/continuity fails, high seamScore and luma<16; never a gap.
3. stitchInSegmentsV1: one if (flags.render.editV2 && read) branch, with a fallback to today's stitch on error.
4. GEN_V2 text: locations 3-4, outfit change at the turn, moving camera list for static directors, action line and anti-cliché line in the shot list prompt.
5. Tests, then one demo-tier render with both flags on, compared with baseline.json.

## Reason

Measured: our video has about 46 soft-cut shots in 5:09 (8 cuts at scene>0.3); the reference has 206 hard cuts in 3:42, and cut density follows the song's energy. Pitch to a music label; reels and shorts need hooks.

## Related files

src/config/flags.ts, src/services/render/subShotV1.ts, src/services/render/renderOrchestratorV1.ts, src/modules/video/video-api.service.ts, src/services/render/directorsV1.ts, src/services/render/treatmentV1.ts, src/services/render/shotListV1.ts, scripts/rnd/analyzeVideo.ts, docs/rnd/

## Acceptance criteria

With both flags off, npm test passes and the request and prompt snapshots are unchanged. With both on, a demo render of the demo song has a median shot under 2s, cut density rising with energy, at least 3 places, no black shot, and stitch time no more than 50% over today's.

## Test steps

—

## Thread
2026-11-18T01:21:25+05:30 aquib N: created ticket, status: - -> open
2026-11-18T01:23:09+05:30 aquib N: status: open -> approved
2026-11-18T01:35:44+05:30 aquib N: Built. Deviations from plan: (1) clip-check fails are NOT used to drop clips except kind=continuity — on mvr_1794399372234_80e74c1d 26/33 clips are 'fail' (mostly hands/people count), dropping them would gut the video; seamScore not used for the same reason. (2) GEN_V2 does not ask for an outfit change: the still and clip checks would call it 'wardrobe wrong' and pay for re-renders; moved to JET-347. (3) segment-concat unchanged; MAX_CLIPS raise not needed (40/segment). Dry run on that render: 33 clips -> 155 pieces, median 1.32s, cuts/20s 5..29 following energy, black probe 18s, nothing dropped.
2026-11-18T13:06:39+05:30 aquib N: Tuned after the first full render (Tu Mil Jaaye, mvr_1794946792123_5da8b039: 276 cuts, median 0.83s, 384s stitch, cliff leap + invented jeeps). Edit: quiet bars play the clip whole, mid cuts per bar, loud per half bar; one cut-in partner per slot (different shot size preferred), each clip cuts in at most once; portrait zoom capped at 1.25; seam > 30 dropped. Re-cut of the same clips: 132 pieces, measured median 1.17s, 145 detected cuts, stitch 264s, clip 25 (seam 68.7) dropped. GEN_V2 text: no jumps/leaps/falls/edges; a vehicle is written into the section's location in full (type, era, colour, size, seated inside) and reused word for word. scripts/rnd/recut.ts re-stitches a finished render without generation.
