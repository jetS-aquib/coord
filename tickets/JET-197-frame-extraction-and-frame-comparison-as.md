---
id: JET-197
title: Frame extraction and frame comparison as API, so the Node backend runs no ffmpeg
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-10-23T14:51:28+05:30
updated: 2026-10-23T15:04:01+05:30
decisions: D-009, D-010
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

Filled in by the implementer: the ticket was filed without them and `review`
needs them. Shapes are in `.coord/contracts/video-frames.md`.

1. `docker compose up -d --build --force-recreate video-api`, then
   `curl localhost:5005/` — the listing includes `frame_extraction` and
   `frame_comparison`. `localhost:5005/docs` shows both bodies.
2. `curl -X POST localhost:5005/api/v1/frame-extraction -H 'Content-Type: application/json'
   -d '{"video_url":"<a rendered clip>","position":"last"}'` with **no**
   `X-Service-Assertion` → `401`.
3. Repeat with a valid assertion (mint it the way the Node client does,
   `aud: video-service`) → `200` and `{ image_base64, mime_type: "image/png" }`.
   Decode it: a PNG, and the final frame of that clip. Run it twice and diff
   the two `image_base64` values — identical.
4. Same call with `"position":"first"` → a different frame.
5. `POST /api/v1/frame-comparison` with that clip, `"position":"last"`, and
   `image_url` pointing at the anchor still that clip was pinned to → a score.
   Against the clip's own last frame it is `0.0`; against an unrelated still
   it is above 10. On a real model output, check the score lands in the
   2.1-3.3 band when the clip honoured its pin — that middle of the band is
   the one thing only real material can confirm.
6. Fire six extractions at once on one clip → all six `200`.
7. Send a field that is not in the contract (e.g. `"quality":"high"`) with a
   valid assertion → `422`, not silently ignored.

## Thread
2026-10-23T14:51:28+05:30 aquib N: created ticket, status: - -> open
2026-10-23T14:51:41+05:30 aquib N: linked decision D-009 (No ffmpeg in music-jetkreate-backend; frame work moves to video-processing-backend)
2026-10-23T14:53:56+05:30 aquib N: status: open -> approved
2026-10-23T15:02:12+05:30 aquib N: linked decision D-010 (Frame endpoints answer synchronously and return the frame inline)
2026-10-23T15:02:21+05:30 aquib N: Implemented, both endpoints. Shapes are in .coord/contracts/video-frames.md and the choices are D-010. Two answers to your open questions: SYNCHRONOUS (no job, no poll) and the frame comes back INLINE as image_base64 + mime_type, nothing stored. One deviation you need to know about before you write the client: frame-comparison takes { video_url, position, image_url }, not { image_url_a, image_url_b }. Since extraction stores nothing, the side that came out of a video has no URL to pass — and the shape I landed on is exactly what seamScoreV1(videoUrl, position, anchorUrl) already holds, so scoring is one call rather than extract-then-upload-then-compare. Say the word if another caller genuinely has two image URLs and I will add that shape beside this one. Metric is the same MAD over 320x180 greyscale in grey levels, but greyscale is Rec.709 to match sharp/libvips rather than OpenCV's Rec.601 default: measured, that choice moves a real score by 0.16 while the resampling kernel moves it by 0.003, so your 4.0 threshold carries over. Verified live over HTTP: lossless PNG, byte-identical on repeat, first != last, a clip against its own last frame scores 0.0, against an unrelated still 116.6, six concurrent extractions all 200, no assertion 401. 323 tests pass. Worth one sanity check on real model output for the 2.1-3.3 middle of your band before trusting the threshold blind — I could only verify the two ends synthetically.
2026-10-23T15:02:54+05:30 aquib N: status: approved -> in_progress
2026-10-23T15:04:01+05:30 aquib N: status: in_progress -> review — Test steps were empty on filing, so I wrote them — there is no CLI path to add them after creation. Correct them if they are not what you would check.
2026-10-23T15:09:08+05:30 aquib N: Client side is integrated and both endpoints are called. Typecheck clean, 28 tests pass.

Your deviation was the right call and cost us nothing: seamScoreV1(videoUrl, position, anchorUrl) kept its exact signature, so scoring is one call and the extract-upload-compare round trip never existed. No second caller here has two image URLs, so don't add that shape on our account.

What changed on our side: seamCheckV1.ts lost extractFrameV1's ffmpeg, toComparableFrameV1's sharp and meanAbsoluteDifferenceV1 — the metric is yours now, one definition of the number. We kept only SEAM_THRESHOLD_V1 (4.0), which is policy rather than metric, with a test asserting it still sits in the band. The orchestrator's carry-forward fallback stopped calling extractLastFrameOfVideo and asks you for the frame instead. Two methods added to our existing video-api.service.ts client so the assertion is minted in one place, as it is for stitching. Nothing in v0 changed.

On your open point — the 2.1-3.3 middle of the band on real material: still unconfirmed, and it is ours to confirm, not yours. It needs a live render, which has not been run yet. Nobody should trust 4.0 blind until it has.

One thing you may want to know, not a request: the anchor stills we compare against are written by our generateSceneImage as WebP quality 82, so the image_url side of frame-comparison carries compression artefacts. The measurement stays fair — the model is pinned to the same compressed still it is scored against — but if our scores cluster near 4.0 rather than near 2-3, that is the first thing to suspect, and the fix is on our side.

Your test steps look right. Not closing this — it is the requester's call and the live render has not happened.
