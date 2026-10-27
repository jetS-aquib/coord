---
id: JET-207
title: Per-clip in and out points on the stitch request
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-10-27T13:44:41+05:30
updated: 2026-10-27T13:47:36+05:30
decisions: 
---

## Request

Optional in and out points per clip on the stitch requests, so a clip generated at the model's native length is used at the music's length. On ClipInput alongside url and order, so it reaches clip-stitching, clip-stitching-with-audio, clip-stitching-with-lyrics and segment-stitch the same way. Absent in/out means the whole clip, exactly as today.

## Understanding

Cuts in a music video land on the downbeat and pop is built in 4- and 8-bar phrases. At 92 BPM a two-bar hold is 5.2 seconds, and no video model generates 5.2 seconds — they offer a small set of fixed lengths. D-027 settles how we deal with that: generate at whatever length the model supports, trim to the musical length at assembly. That decision names this change as its one dependency, so the Understanding here is mostly D-027's.

What that means for you: the plan will carry both numbers per clip — what was generated and what is used — and the stitch request carries the second as a trim on material you already hold. It is a stream operation on a file you are already downloading, so it should cost nothing in time or quality, and we are not asking for a re-encode.

Assumptions:
- Seconds as floats, relative to the clip's own start. Out exclusive. Both optional and independent: in alone trims the head, out alone trims the tail.
- Trim is applied before the transition, so an xfade overlaps the frames that survive, not the ones that were cut.
- A trim longer than the clip is a 422 rather than a silent clamp — a wrong number there means the cut is in the wrong place, and we would rather fail the request than ship an off-beat video.
- Nothing about the existing requests changes. An absent in/out is the whole clip and is what every caller sends today.

One consequence that is specific to how you built the seam check, and the reason this is not purely additive on our side: a clip that is trimmed shorter than its generated length must satisfy the seam check at the frames that survive, not the frames that were cut. We measure seams in music-jetkreate-backend against POST /api/v1/frame-extraction (JET-197, D-010), so the fix is ours — we extract at the trimmed in/out rather than at 0 and duration. Flagging it here because it is the thing most likely to be missed when the two halves land in different sittings, and because if frame-extraction ever grows its own notion of first and last frame, the two have to agree.

Open question for you rather than an assumption: whether the segment boundary arithmetic in contracts/video-segments.md still holds when clips are trimmed. The contract says each join keeps the crossfade's overlap a single-call render would have spent, and the final mux trims to the master audio. With per-clip trims the total is already meant to equal the music, so that extra overlap per boundary may now land somewhere it is noticed. Your call how to handle it; we would just like it written down in the contract either way.

## Plan

1. File this and wait. Approval first, then the work.
2. On our side, carry both durations per clip on RenderPlanV1: the generated length and the musical length cutPlanV1 chose.
3. Send the musical length as in/out on the stitch and segment-stitch requests once the contract has them.
4. Move our seam check to extract frames at the trimmed in and out rather than at 0 and duration, so a re-render is triggered by a seam the viewer will actually see.
5. Report discarded generated seconds alongside the cost estimate — roughly 40% on verse-heavy songs per D-027, reported rather than hidden.
6. Leave the no-trim path exactly as it is, so v0 and any render without a song read are unaffected.

## Reason

Without this, cuts cannot land on the beat for any model, because no model generates the lengths music asks for. It blocks 6.5, and 6.4's cut plan is only worth building if the lengths it chooses survive to the master. Settled as D-027.

## Related files

app/schemas/jobs.py (ClipInput); app/pipeline/stitch_pipeline.py; .coord/contracts/video-stitching.md, video-segments.md; consumers: music-jetkreate-backend render/cutPlanV1.ts, seamCheckV1.ts, models/RenderPlanV1.ts

## Acceptance criteria

A stitch request with in/out on each clip produces a master whose total length is the sum of the trimmed lengths, and playing it against the beat map puts every cut on a downbeat. A request with no in/out produces byte-identical output to today. An out beyond the clip's duration is refused with 422. A segment-stitch with trims joins and finalises without the frames outside the trims appearing anywhere.

## Test steps

—

## Thread
2026-10-27T13:44:41+05:30 aquib N: created ticket, status: - -> open
2026-10-27T13:47:36+05:30 aquib N: status: open -> approved
