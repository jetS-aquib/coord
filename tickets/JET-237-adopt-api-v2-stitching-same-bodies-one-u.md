---
id: JET-237
title: Adopt /api/v2 stitching: same bodies, one URL change, and a portrait master that is 720x1280 rather than upscaled
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-02T14:31:25+05:30
updated: 2026-11-02T14:32:28+05:30
decisions: 
---

## Request

Point the v1 render orchestrator at /api/v2/clip-stitching-with-lyrics, /api/v2/clip-stitching-with-audio, /api/v2/segment-stitch and /api/v2/segment-concat instead of their /api/v1 equivalents. Request and response bodies are unchanged, and polling stays on GET /api/v1/jobs/{job_id}. NOT YET BUILT — this is filed before the work so you can object to the shape while it is still cheap to change. I will note on this thread when the endpoints are live; do not go looking for them today.

## Understanding

You are the only caller of the stitch endpoints that renders music videos, and the render log you sent showed a 4:16 master taking 6m25s end to end of which 45s was video work. We are building a second pipeline rather than changing the one you use, because several people are editing the stitch path right now and because any change to it is a change to what the creater API and the web client already receive.

ASSUMPTIONS, and say so on this thread if any is wrong:
1. You would rather change a URL than a payload. Both pipelines take the same Pydantic models, so your TypeScript types, your request builders and your job polling are untouched; videoApiService changes a path string per endpoint and nothing else.
2. You can live with a 720x1280 master where you get 1080x1920 today. THIS IS THE ONE REAL BEHAVIOUR CHANGE AND IT IS THE PART I MOST WANT CHECKED. Your clips arrive 720x1280 and we currently scale them UP to 1080x1920, which costs about 1.8x on the encode and invents no detail. v2 renders at the clips own frame. If anything downstream of you assumes a 1080-wide master — the library card still, a player, any compositing, an app store asset — say so and I will make the frame selectable instead of fixed.
3. You want this opt-in per environment rather than switched for you. Nothing about /api/v1 changes, so you can run one render through v2, compare the output, and move when you are satisfied.
4. outputFrame from JET-232 works the same way on v2, so the aspect you already hold still decides the shape; v2 only changes what resolution that shape is rendered at.

Related and deliberately NOT duplicated here: JET-202 (segment stitching) is still waiting on you. v2 will carry segment endpoints too, so if you adopt both at once you get the segmented flow and the faster pipeline in one change rather than two.

## Plan

1. Build /api/v2 routes that take the existing request models and return the existing JobResponse, so nothing you send or parse changes.
2. Render at the clips native frame instead of upscaling.
3. Collapse three encode passes into one: fold per-clip trims into the filter graph inputs rather than re-encoding each trimmed clip first, and burn captions in the same pass as the transitions rather than decoding and re-encoding the finished video.
4. Add /api/v2/segment-stitch and /api/v2/segment-concat on the same pipeline.
5. Write the contracts, and tell you on this thread when it is deployable.
6. /api/v1 keeps working, unchanged, for as long as anyone is on it.

## Reason

Your log: download_clips 251s, gcs_upload_source_audio 75s, all video work 45s, and then the render produced nothing because the ffmpeg on that host had no libass. The I/O half and the crash are fixed under JET-236 and are not what this ticket is about. This is about the video work itself, which currently encodes the same material three times — once per trimmed clip, once for transitions, once to burn captions. One pass is the floor. On a 4 vCPU VM that is roughly 120-135s today against an estimated 45-60s for 31 clips into a 4 minute master, and native resolution is most of the remaining difference.

## Related files

ours: app/api/v2/ (new), app/pipeline/ (new v2 pipeline), .coord/contracts/video-stitching-v2.md (new). yours: src/modules/video/video-api.service.ts, src/services/render/renderOrchestratorV1.ts (stitchPlanV1, stitchTrimmedV1, stitchInSegmentsV1) — URL strings only, no payload changes expected.

## Acceptance criteria

A render sent to /api/v2/clip-stitching-with-lyrics returns the same JobResponse shape, polls on the same /api/v1/jobs/{id}, and produces a 720x1280 master with the same captions, the same transitions and the same audio sync as the /api/v1 render of the same request. Measurably faster on the same hardware. Nothing sent to /api/v1 behaves differently.

## Test steps

—

## Thread
2026-11-02T14:31:25+05:30 aquib N: created ticket, status: - -> open
2026-11-02T14:32:28+05:30 aquib N: status: open -> approved
