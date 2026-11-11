---
id: JET-306
title: POST /api/v2/segment-concat answers 422 on callback_requested, so every segmented render falls back to a full re-stitch
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-11T14:01:34+05:30
updated: 2026-11-11T14:06:10+05:30
decisions: 
---

## Request

Accept callback_requested on SegmentConcatRequest (app/schemas/jobs.py:338), as SegmentStitchRequest already does through BaseJobRequest, and send the finish callback for the concat job.

## Understanding

Seen on the staging render mvr_1794384735775_ed42df55 on 2026-11-11 (08:22:36 UTC). music-jetkreate-backend sends callback_requested: true on /api/v2/segment-concat (video-api.service.ts:927, JET-252). SegmentConcatRequest extends LyricsOptions only, has extra='forbid', and callback_requested is declared on BaseJobRequest (jobs.py:126), so the call answers 422 extra_forbidden. The backend catches it ('segment stitching failed ... falling back to the single call') and sends the whole render again to /api/v2/clip-stitching-with-lyrics. That redoes work the segment jobs had already finished (segments done by 08:22:36, each 20 to 30s of encode) and starts with a full clip re-download (one segment job spent 93.8s in input_download); the fallback job was still in 'downloading' a full minute later when the node log ends at 08:23:47. Assumptions: (1) the fix belongs on the schema, not by dropping the field in the backend, so the concat gets its finish callback like every other job; (2) a concat with callback_requested should POST the same webhook the other jobs do; (3) I only saw logs up to 08:23:47, so I did not see the fallback finish or how long it took in total.

## Plan

1. Add callback_requested (bool, default False) to SegmentConcatRequest, or make it share the base field.
2. Make the concat job fire the finish callback when requested, as segment-stitch does.
3. Add a test that /segment-concat accepts callback_requested: true and answers 202.
4. Mention in the contract that concat takes callback_requested.
Backend follow-up, separate: do not fall back to a full re-stitch on a 422, which is a bug in the request and will repeat; fail loudly or retry the concat.

## Reason

Every segmented render pays for a second full stitch after the first is already done, so the finished video reaches the creator minutes late. The app is not slow: it polled every 4s and was told 'stitching' throughout.

## Related files

app/schemas/jobs.py, app/api/v1/deferred.py, tests

## Acceptance criteria

POST /api/v2/segment-concat with callback_requested: true answers 202, and a segmented render finishes with the concat and no fallback to clip-stitching-with-lyrics in the backend log.

## Test steps

1. `.venv/bin/python -m pytest -q tests/test_segments.py`: all pass, including `test_a_finalise_takes_callback_requested_and_keeps_it` for v1 and v2.
2. Deploy to staging and render a music video long enough to segment (2+ scenes).
3. Video service log: `POST /api/v2/segment-concat` answers `202 Accepted`, not 422.
4. Node log: no `segment stitching failed ... falling back`, and no `clip-stitching-with-lyrics` call for that render; the concat job finishes and the render completes.

## Thread
2026-11-11T14:01:34+05:30 aquib N: created ticket, status: - -> open
2026-11-11T14:04:32+05:30 aquib N: Checked against the code and the 08:22:36 logs: confirmed, 422 extra_forbidden on body.callback_requested. Fix is smaller than the plan: add callback_requested to SegmentConcatRequest and pass it into ClipStitchingRequest in both concat routes (v1 segments.py, v2 stitching.py). The finish callback needs no new code: _report_outcome already posts it for attempt-scoped jobs whose state has callback_requested. deferred.py is not involved. Plus one test, plus a line in contracts/video-segments.md.
2026-11-11T14:05:12+05:30 aquib N: status: open -> approved
2026-11-11T14:06:10+05:30 aquib N: status: approved -> in_progress
2026-11-11T14:06:10+05:30 aquib N: status: in_progress -> review — ready: see Test steps
