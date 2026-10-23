---
id: JET-197
title: Frame extraction and frame comparison as API, so the Node backend runs no ffmpeg
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-10-23T14:51:28+05:30
updated: 2026-10-23T14:51:41+05:30
decisions: D-009
---

## Request

Two endpoints on the video service, so music-jetkreate-backend can stop shelling out to ffmpeg:

1. Extract one frame from a video.
   Input:  a video download URL, and which frame — the first or the last.
   Output: a lossless still (PNG), reachable the way stitching output already is.
   The Node side needs the BYTES of this frame, not just a URL: the frame is sent
   to the video model as the still the next clip must open on. A download URL plus
   a fetch is fine; inline base64 saves us a round trip if that is easy for you.

2. Score how different two images are.
   Input:  two image URLs (an extracted frame and a generated still).
   Output: one number — mean absolute difference over 320x180 greyscale versions
           of both. Measured band: identical 0, a good clip 2.1-3.3, two genuinely
           different stills 10.3. We treat >4.0 as 'the clip ignored its anchor'.
   This is three lines of numpy for you and removes the last image processing from
   Node. If you would rather not own the metric, endpoint 1 alone unblocks us and
   we keep the comparison in Node with sharp.

Shape, auth and the 202+poll-vs-synchronous question are yours to decide — see Plan.

## Understanding

The v1 music-video pipeline renders every clip in parallel by pinning each clip between two generated stills. Two things need ffmpeg for that, and both currently run in Node:

  - pulling the first or last frame out of a rendered clip (the still a neighbouring clip opens on, and the frames the seam check measures)
  - nothing else. Stitching, audio and captions are already yours.

Aquib's call: no ffmpeg in music-jetkreate-backend. All of it moves here, and Node consumes it as an API.

Assumptions I am making, please correct any that are wrong:
  - You already have ffmpeg and an image library in the container; neither endpoint needs a new dependency.
  - Input videos are the same HTTP(S)/GCS download URLs the stitching endpoints take, so no new storage path.
  - Extracted frames can live wherever stitching output lives; we do not need them kept long, an hour is plenty.
  - X-Service-Assertion applies here as it does to stitching, and we mint it the same way.
  - 'Lossless' matters and is not fussiness: the extracted frame is BOTH the still we hand back to the video model as a pin AND the yardstick we then measure the model's output against. We had it as lossy WebP and were scoring compression error as model error.

Open question I cannot answer for you: your existing endpoints are 202 + poll on /api/v1/jobs/{id}. A frame extraction is sub-second and we call it ~66 times per song, so job-per-frame would be a lot of ceremony. We would prefer synchronous, but you own the shape — if the job pattern is what fits your infra, say so on the ticket and we will batch our calls instead.

## Plan

Yours to execute; this is the shape I would expect, not a prescription.

1. POST /api/v1/frame-extraction — { video_url, position: 'first'|'last' } -> lossless PNG (url and/or inline base64). Note extra='forbid' means we send exactly the fields you define.
2. POST /api/v1/frame-comparison — { image_url_a, image_url_b } -> { score }. Mean absolute difference, 320x180, greyscale. Skip this one if you would rather not own the metric.
3. Document both in .coord/contracts/ — you own those files.
4. Tell us the shapes; we swap our two call sites and delete the local ffmpeg path.

On our side, after you land it: seamCheckV1.ts loses its ffmpeg and sharp code and becomes two HTTP calls, and the orchestrator's carry-forward fallback stops calling extractLastFrameOfVideo. Nothing in v0 changes — thumbnails.ts keeps its own extractor for the existing endpoints.

## Reason

The Node backend currently runs ffmpeg itself, in two places, and that is the wrong house for it. ffmpeg is your dependency, your container already has it, and every frame op we do here is one more reason the Node image needs a binary it should not need.

It is also hot: verifying one 4:08 song is ~66 frame extractions, six concurrently. Today each of those spawns a process inside the API container, next to request handling.

Not urgent in the sense that nothing is broken — the local implementation works and stays put until this lands. It is a placement decision, not a bug.

## Related files

video-processing-backend: app/api/v1/routes/ (new route module), .coord/contracts/ (new contract doc)
music-jetkreate-backend (ours, after you land it): src/services/render/seamCheckV1.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

- Given a clip URL and position 'last', the endpoint returns the final frame of that clip, losslessly, and a second call on the same clip returns a byte-identical image.
- Given two identical images, the comparison endpoint scores 0.0. Given two unrelated stills, it scores above 10. (If you implement it.)
- Six concurrent extractions on one 8-second clip all succeed.
- Both endpoints reject a request without a valid X-Service-Assertion.
- The shapes are written down in .coord/contracts/ so we are not reading your Python to call you.

## Test steps

—

## Thread
2026-10-23T14:51:28+05:30 aquib N: created ticket, status: - -> open
2026-10-23T14:51:41+05:30 aquib N: linked decision D-009 (No ffmpeg in music-jetkreate-backend; frame work moves to video-processing-backend)
