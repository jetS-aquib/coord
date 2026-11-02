---
id: JET-232
title: An explicit output frame on the stitch and segment requests, because the phone already asked for 9:16 and gets landscape
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-01T02:34:47+05:30
updated: 2026-11-02T12:10:50+05:30
decisions: 
---

## Request

Add an optional output frame field to clip-stitching-with-audio, clip-stitching-with-lyrics, segment-stitch and segment-concat. An absent field keeps today's behaviour exactly. This supersedes the ENABLE_PORTRAIT_OUTPUT deployment flag with a per-request field.

## Understanding

We carry an aspect on every render plan and we have never been able to tell you about it. All 41 v1 render plans in our database carry aspectRatio '9:16' — the phone has been asking for portrait since the day it shipped — and every stitch request we send names no frame, because none of your request models has a field for one and all of them are extra="forbid", so sending one is a 422 rather than an ignored key. The master therefore comes back 1920x1080 and a portrait clip is scaled down and pillarboxed into it. ASSUMPTIONS, and say so on this thread if any is wrong: (1) the majority-of-clips derivation behind ENABLE_PORTRAIT_OUTPUT becomes dead once a frame can be stated, but you would rather keep an absent frame meaning landscape than migrate a deployment on the day — that is what we are asking for; (2) segment-stitch needs the field too and not just segment-concat, because your own contract says segments rendered in two different frames cannot be joined and the finalise refuses them; (3) 1:1 is a shape your pipeline can already produce and the limit is the request model, not ffmpeg. If (3) is wrong, 9:16 and 16:9 alone are worth the ticket.

## Plan

1. Put an optional output frame on the shared request model, so all four endpoints take one field rather than four that drift.
2. Accept the aspect names we hold — '16:9', '9:16', '1:1' — or explicit width/height if you would rather be told pixels; say which on the thread and we will send that instead.
3. Absent means exactly today's output: 1920x1080@30 for the audio and lyrics workflows, 1280x720@24 for bare clip-stitching. No deployment is reconfigured on the day this lands.
4. segment-stitch takes the same field; segment-concat refuses with a clear error when the segments it is given were not all rendered in the same frame.
5. Captions are laid out against the chosen frame, so a 9:16 master has its lyrics inside the frame and not off the side of it.
6. BACKWARD COMPATIBILITY IS THE CONSTRAINT, NOT A NICE-TO-HAVE. If any of the above cannot be done without changing a code path an existing caller depends on — the creator API, the web client, or anything else already calling these endpoints — do not change that path. Copy the function or the file, make the change in the copy, and route only the requests that name a frame through it. We would much rather have a second code path than a shared one that behaves differently for callers who never asked for this.

## Reason

9.3 in the render pipeline delivery plan, and it is blocking two batches rather than one. Right now a user picks portrait on the phone, we record it, and we hand them a landscape video — that is a live wrong answer, not a missing feature. There is also a measured saving parked behind it: 31 portrait clips encode in 13.6s at their native 720x1280 against 24.4s at 1920x1080, 1.8x, which is unreachable while the frame cannot be stated. Nothing on our side can move until the request can carry the field. D-026, and it supersedes D-017. Related: JET-196, which produced the deployment flag this replaces.

## Related files

yours: app/schemas/jobs.py (BaseJobRequest, LyricsOptions, SegmentStitchRequest, SegmentConcatRequest), app/pipeline/stitch_pipeline.py, app/api/v1/routes/clip_stitching.py, audio_stitching.py, lyrics_stitching.py. ours: src/modules/video/video-api.service.ts, src/services/render/renderOrchestratorV1.ts (stitchPlanV1, stitchTrimmedV1, stitchInSegmentsV1). contracts: .coord/contracts/video-stitching.md, video-segments.md — both yours to update.

## Acceptance criteria

A stitch request naming 9:16 returns a 1080x1920 master with the captions inside the frame. A request naming 1:1 returns a square one. A request naming nothing returns byte-for-byte what it returns today, on a deployment with the flag unset and on one with it set. segment-concat refuses segments whose frames disagree, naming which. No existing caller changes a line.

## Test steps

1. POST /api/v1/clip-stitching-with-lyrics with the clips and audio you already use, and no frame field. ffprobe the output: 1920x1080@30, exactly as today.
2. The same request with the frame named as 9:16. ffprobe: 1080x1920@30, and the burnt captions are inside the frame rather than clipped.
3. The same request naming 1:1. ffprobe: square.
4. POST /api/v1/segment-stitch twice naming 9:16, then segment-concat over both. The master is portrait end to end.
5. segment-stitch one segment as 9:16 and one as 16:9, then concat them. Refused with an error naming the mismatch, not a master whose second half is the wrong shape.
6. Run whatever the creator API and the web client send today against the deployed service, unchanged. Same outputs, same job shapes, same status codes.

## Thread
2026-11-01T02:34:47+05:30 aquib N: created ticket, status: - -> open
2026-11-02T11:59:56+05:30 aquib N: status: open -> approved
2026-11-02T12:10:20+05:30 aquib N: Built. Answering the three assumptions you asked about.

(1) Right: a named frame ignores ENABLE_PORTRAIT_OUTPUT in both states, so nothing is reconfigured on the day this lands and no later flip of the flag undoes a render. Absent still means today's behaviour exactly — the flag-off landscape default and the majority derivation both stay. The derivation is not dead and nothing has to migrate; it is now just the fallback for a caller that cannot name a frame.

(2) Right: segment-stitch takes it. segment-concat takes it too so you can hold one value and send it everywhere, but there it is checked rather than obeyed — the segments are already rendered and the captions burn onto their own pixels, so a finalise naming a frame its segments are not in fails with both shapes in the message. The existing segment-to-segment mismatch check is unchanged.

(3) Right, 1:1 works. The pipeline pads into whatever frame it is given.

Answering your open question: it takes ASPECT NAMES, not pixels. '16:9', '9:16', '1:1', anything else is a 422. Send the aspectRatio you already hold, unchanged. The reason is that the size class belongs to the workflow, not the caller: the named side is the SHORT one, so 9:16 is 1080x1920 on audio/lyrics (same 1080 you get today) and 720x1280 on bare clip-stitching, which has never had resolution selection and should not quietly become a 1080p encode because someone asked for a shape.

Field is outputFrame / output_frame, on the shared request model, so all four endpoints take exactly the same one.

No second code path was needed. Absent is a single branch that is never entered, above code that is untouched — the existing callers run the same lines they ran yesterday, not a copy of them. I would rather tell you that than duplicate the pipeline for a branch that cannot fire.

Contracts updated: video-stitching.md has the aspect table, video-segments.md the segment rule.
2026-11-02T12:10:50+05:30 aquib N: status: approved -> in_progress — output frame on all four stitch requests
2026-11-02T12:10:50+05:30 aquib N: status: in_progress -> review — Built. outputFrame on all four requests, aspect names, absent unchanged. Contracts updated. Test steps 1-6 as filed.
