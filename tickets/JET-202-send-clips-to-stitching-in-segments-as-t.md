---
id: JET-202
title: Send clips to stitching in segments as they finish, instead of one call at the end
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-26T13:04:41+05:30
updated: 2026-10-26T13:04:41+05:30
decisions: 
---

## Request

Stitch each group of consecutive clips as it completes and passes its seam check, rather than holding every clip until the end. The final step joins the finished segments, which is a remux and costs almost nothing.

## Understanding

stitchPlanV1 collects every done clip and makes one call. That call is 59s on a 31-clip, 248s song (measured), and it starts only after anchors, clips and seam verification have all finished — by which time this service has been idle for about 4 minutes.

Nothing requires that. xfade needs both clips of a boundary, so it needs consecutive clips, but it does not need ALL of them. Clips 1-6 can be stitched while 7-12 are still being generated.

The join is the part worth getting right. Segments encoded with identical codec, resolution, fps and pixel format concatenate with -c copy — no re-encode, effectively free. The cost is the transition across a segment boundary, which xfade cannot do after the fact.

Assumptions, and the third is the one I most want corrected:
1. Clips complete roughly in order. They are fanned out 6 at a time, so a segment of 6 should close fairly promptly. If completion order is wildly out of order, segments stall and this buys nothing.
2. A clip's seam score must be final before its segment is stitched, or a re-render would invalidate an already-encoded segment. That means segments close only behind the verification, not behind generation — which is still well before the end.
3. Segment boundaries lose their crossfade unless something is done. Options: align segments to scene boundaries where a cut is natural; carry one clip of overlap into the next segment; or accept a hard cut at 4-5 points in the song. I do not know which is acceptable to you and would rather not guess — this is the decision the ticket really needs.

The endpoints do not exist yet; they are mine to build once the shape and the boundary question are settled.

## Plan

Mine to build:
1. A segment stitch endpoint taking an ordered group of clip URLs plus a segment index, returning a stored segment rendered to a fixed target.
2. A finalise endpoint taking the segment list in order, concatenating with -c copy, muxing the master audio, and burning captions if lyrics are on.
3. Both keep the current single-call endpoints working untouched, so nothing that uses them has to move.

Yours:
4. Track which clips are verified and group them into ordered segments.
5. Post each segment as it closes; post finalise when the last one does.
6. Fall back to the existing single call if any segment fails, so a bad segment costs a slower render and not a failed one.

## Reason

You asked whether clips can be batched to this service so it is not sitting idle while the model works. They can, and this is the shape. It is worth about 59s directly, which is the smallest of the wins I found — JET-199 and JET-200 are worth minutes each and should come first. Its real value is that it removes stitching from the critical path entirely, which matters more once the song gets longer.

## Related files

src/services/render/renderOrchestratorV1.ts (runPlanV1, stitchPlanV1), src/modules/video/video-api.service.ts

## Acceptance criteria

A song's stitching finishes within a few seconds of its last clip being verified, rather than ~59s after. The output is equivalent to today's single-call render except at the segment joins, in whatever way we agree those should behave. The existing single-call endpoints still work and the orchestrator can still fall back to them.

## Test steps

1. Render a song and confirm segment stitch calls appear in the service logs during clip generation, not after it.
2. Compare total time from last clip verified to final URL, before and after.
3. Play the result and watch each segment join specifically.
4. Force a segment to fail and confirm the render falls back to the single call and still completes.

## Thread
2026-10-26T13:04:41+05:30 aquib N: created ticket, status: - -> open
