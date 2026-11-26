---
id: JET-207
title: Per-clip in and out points on the stitch request
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: done
created: 2026-10-27T13:44:41+05:30
updated: 2026-10-27T16:46:30+05:30
decisions: D-031
closed: 2026-10-27
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

Everything below runs against this service; nothing needs the Node side.

1. **The suite.** From video-processing-backend:
   `docker run --rm -v "$PWD":/src -w /src video-processing-backend-video-api sh -c "pip install -q pytest pymongo; python -m pytest tests/test_clip_trim.py -q"`
   15 tests. They build their own clip with lavfi, so there is no fixture to fetch.

2. **Nothing changed for an untrimmed call.** POST your usual
   `/api/v1/clip-stitching-with-lyrics` body — no inSeconds or outSeconds anywhere —
   and poll it out. Same output as before, and the job log shows no trim lines.

3. **A trim takes effect.** Same body, but put `"outSeconds": 3.0` on two clips that
   are longer than that. The finished master is about 6 seconds shorter than the
   untrimmed one, and the job log has a line per trimmed clip reading
   `trimmed 0001_clip.mp4 to [0.000, 3.000) of 8.000s`.

4. **A cut lands where you asked.** Trim one clip to a length that is not a whole
   second — `"outSeconds": 5.217` — and ffprobe the master. The clip occupies 5.217s
   give or take a frame, not the nearest keyframe.

5. **A bad trim is refused, not clamped.** Send `"inSeconds": 5, "outSeconds": 2` —
   expect **422** on the request. Then send `"outSeconds": 9999` on a real clip —
   expect **202**, then the job settles **failed** with a message naming that clip's
   real duration. The second one is a failed job rather than a 422 on purpose; the
   reason is on the review note and in contracts/video-stitching.md.

6. **Segments got it too.** Same trims through `/api/v1/segment-stitch` and
   `/api/v1/segment-concat`. The joined master is the same length as the single-call
   one, and no frame outside a trim appears at a segment join.

## Thread
2026-10-27T13:44:41+05:30 aquib N: created ticket, status: - -> open
2026-10-27T13:47:36+05:30 aquib N: status: open -> approved
2026-10-27T15:08:03+05:30 aquib N: status: approved -> in_progress
2026-10-27T15:08:50+05:30 aquib N: status: in_progress -> review — Shipped. Trim is applied right after download, before analysis: the xfade offsets come from the durations analysis finds on disk, so transitions, captions, the master-audio mux and segment joins all work on the surviving frames with no change to the transition graph. ClipInput gained inSeconds/outSeconds (snake_case accepted too), so all three single-call endpoints and segment-stitch got it from one change. A clip with no trim is not decoded or re-encoded at all.

TWO DIVERGENCES FROM WHAT YOU ASKED, both worth knowing before you build against it.

1. 'An out beyond the clip duration is refused with 422' is only half possible. A self-inconsistent trim — out <= in, either one negative — is a 422 on the request, as you wanted. An out past the END of the clip cannot be: these endpoints answer with a job id before any clip is fetched, so the duration is not known when the request is accepted. That case fails the JOB instead, with the clip real duration in the error so your planner can recompute. Request-time refusal would mean probing before the 202, which is a different ticket if you want it.

2. There is a 0.05s tolerance on the out point, a little over one frame at 24fps, because you compute the out point from a bar length in floating point. Past that it fails rather than clamps — your reasoning about a wrong number moving the cut is right and it is written into the contract so nobody softens it later.

YOUR OPEN QUESTION about the segment boundary arithmetic: trimming does not change it. A trim is applied before the transition, so the crossfade at a segment INTERNAL boundaries overlaps surviving frames. The join BETWEEN segments is a hard cut and overlaps nothing, so the per-boundary overlap is what it always was and the final mux still trims to the master audio. Written into contracts/video-segments.md rather than left as an answer on a ticket.

One ceiling, marked in the code: a trimmed clip is encoded once here and again by the xfade pass. Folding the trim into that pass input arguments would make it free but means feeding trimmed durations into the xfade offset arithmetic by hand, which desynchs the song against its master audio if it is wrong. Worth doing when it shows up in a measurement; untrimmed clips pay nothing today.

Both contracts updated. Not committed — the dev commits here.
2026-10-27T16:21:11+05:30 aquib N: status: review -> done
2026-10-27T16:46:30+05:30 aquib N: linked decision D-031 (Scenes and clip lengths derive from the song's structure, not from the model's maximum duration)
