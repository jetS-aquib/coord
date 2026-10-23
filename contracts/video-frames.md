---
owner: video-processing-backend
status: active
---

# /api/v1/frame-extraction, /api/v1/frame-comparison

Written for JET-197 (D-009), so `music-jetkreate-backend` can delete its own
ffmpeg and image code. These are the shapes — you should not have to read the
Python to call them.

Both are **synchronous**: they answer with the result, not a job id. The work
is sub-second and the caller makes roughly sixty-six of these per song, so a
job and a poll would cost more than the answer. Nothing is stored; there is
no retention policy to care about.

Both require `X-Service-Assertion`, minted exactly as for stitching
(`iss: jetkreate-creator-api`, `aud: video-service`, HS256, `exp - iat` ≤ 60s,
`jti` single-use for ten minutes). A caller without one gets **401 before the
body is looked at**, so an unknown caller is told nothing about the schema.

Both bodies are `extra="forbid"`: a field not listed here is a 422, never
ignored.

## `POST /api/v1/frame-extraction`

```jsonc
// request
{ "video_url": "https://…/clip.mp4", "position": "first" }   // or "last"

// 200
{ "image_base64": "iVBORw0KGgo…", "mime_type": "image/png" }
```

PNG, so lossless by construction — the frame is both the still handed to the
video model as a pin and the yardstick its output is then measured against,
and a lossy frame means scoring compression error as model error.

Returned inline rather than as a URL. Storing it would buy a URL at the cost
of an upload, a second round trip and a retention policy, for an image used
once. `image_base64` + `mime_type` is the `{ data, mimeType }` shape the
caller already passes to the model.

The same clip and position return **byte-identical** bytes every time.

`last` tries `-sseof` at 0.1s, 0.5s, 1.0s and 2.0s and then falls back to the
first available frame, which is the same cascade `extractLastFrameOfVideo`
used: a clip whose audio outruns its video has no frame at 0.1s, and a render
should not fail over that.

## `POST /api/v1/frame-comparison`

```jsonc
// request
{ "video_url": "https://…/clip.mp4", "position": "last",
  "image_url": "https://…/anchor.png" }

// 200
{ "score": 3.392 }
```

**This is not the `{ image_url_a, image_url_b }` JET-197 proposed, and the
difference is deliberate.** Extraction hands the frame back inline and never
stores it, so there is no URL for the side that came out of a video. Passing
the two URLs you already hold costs you one call instead of two plus an
upload, and it is exactly what `seamScoreV1(videoUrl, position, anchorUrl)`
already takes. If you have a second caller that genuinely has two image URLs,
say so on a ticket and that shape can be added beside this one.

`score` is the mean absolute difference over 320x180 greyscale versions of
both images, in grey levels, rounded to three decimals — the same metric and
the same units as the Node implementation, so the measured band carries over:

| | score |
|---|---|
| identical | 0 |
| a clip that honoured its pin | 2.1 – 3.3 |
| two genuinely different stills | 10+ |

Greyscale is **Rec.709** (0.2126/0.7152/0.0722), matching libvips/sharp rather
than OpenCV's Rec.601 default; on a real pair that choice is worth about 0.16,
which is large enough next to a threshold of 4.0 to be worth naming. The
resampling kernel is worth about 0.003, so it is not a risk.

Images of different shapes still compare: both are forced to 320x180 and
aspect is deliberately not preserved.

## Errors

| status | when |
|---|---|
| 401 | no assertion, or an invalid, expired or replayed one |
| 422 | a field that is not defined here, an unknown `position`, a file that is not a readable video or image |
| 502 | the `video_url` or `image_url` could not be fetched |

An image is capped at 64 MB; a video uses the same cap as stitching.
