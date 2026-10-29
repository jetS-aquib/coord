---
owner: video-processing-backend
status: active
---

# /api/v1/frame-extraction, /api/v1/frame-comparison

Written for JET-197 (D-009), so `music-jetkreate-backend` can delete its own
ffmpeg and image code. These are the shapes — you should not have to read the
Python to call them.

Both are **synchronous**: they answer with the result, not a job id. The work
is sub-second and the caller makes a couple of hundred of these per song, so
a job and a poll would cost more than the answer. Nothing is stored; there is
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
{ "video_url": "https://…/clip.mp4", "position": "first" }        // or "last"
{ "video_url": "https://…/clip.mp4", "atSeconds": 5.217 }         // or a time
{ "video_url": "https://…/clip.mp4", "atSeconds": [1.0, 3.5, 6.0],
  "maxWidth": 768 }                                               // or several, shrunk

// 200 — one time, or a position
{ "image_base64": "iVBORw0KGgo…", "mime_type": "image/png" }

// 200 — a list of times, one entry per time, in the order asked
[ { "image_base64": "…", "mime_type": "image/png" },
  { "image_base64": "…", "mime_type": "image/png" },
  { "image_base64": "…", "mime_type": "image/png" } ]
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

## Several frames in one call, and an optional size

Both are JET-222, both optional, both on **extraction only**, and neither
changes anything you send today.

**`atSeconds` also takes a list.** One entry per time, in the order asked,
each byte-identical to what that time returns on its own — batching is a
transport change and nothing else. The clip is downloaded once, which is the
saving: the extraction itself is milliseconds and the clip is not. A single
float still answers with a single object; **only a list changes the response
shape**, so a caller sending one time never has to unwrap a list of one.

An **empty list is a 422**. So is a list alongside `position` — the
exactly-one-of rule is unchanged, a list is still one selector.

**One time past the end of the clip does not cost the other frames.** Each
entry falls back on its own through the same `-sseof` cascade, so a clip that
came back short costs one slightly different frame, not the request.

**`maxWidth` shrinks the frame, aspect preserved.** It only ever shrinks: the
filter is `min(iw, maxWidth)`, so a value at or above the real width returns
the real width and does so **byte-identically to sending nothing** — there is
no upscaling branch to get wrong. Byte-identity holds per
`(clip, frame, maxWidth)`.

**Absent `maxWidth` returns exactly the bytes it returned before JET-222.**
That is the guarantee that matters: the seam check sends no `maxWidth`, so
the band measured over 132 clips and the threshold sitting on it (D-018) are
untouched. Only a caller that asks for a size gets a different picture.

Measured on this encoder, 1280x720, so you can size the saving: a detailed
frame is **1.6 MB** of PNG (2.2 MB base64), a flat one 0.15–1.0 MB. At
`maxWidth: 768` the detailed frame is 0.57 MB (0.78 MB base64) — roughly a
65% cut, and about 100 MB a song at 135 frames rather than 300.

**Comparison takes neither**, deliberately. It is one frame against one still
by nature, and a width there would be worse than useless: both sides are
forced to 320x180 anyway, so pre-shrinking would only add a resampling step
to one of them. A list or a `maxWidth` sent to comparison is a 422.

## `POST /api/v1/frame-comparison`

```jsonc
// request
{ "video_url": "https://…/clip.mp4", "position": "last",
  "image_url": "https://…/anchor.png" }
{ "video_url": "https://…/clip.mp4", "atSeconds": 5.217,
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

## Naming the frame: an end, or a time

Both endpoints take **either** `position` (`first` | `last`) **or**
`atSeconds` — seconds from the clip's own start, as a float, the same
convention as the stitch request's `inSeconds` / `outSeconds`. `at_seconds`
is accepted too. JET-212.

**Exactly one of the two.** Sending both is a **422** rather than a
precedence rule nobody would remember; sending neither is a 422 because there
is no sensible default between them. `position` was required before this and
is now optional, which is the only change to the old shape — every request
that worked yesterday works unchanged and returns the same bytes.

Why a time exists: since JET-207 / D-027 a clip is generated at the model's
length and used at the music's length. A two-bar hold at 92 BPM is 5.217s
inside an 8s clip, so the last 2.8 seconds are never seen by anyone, and
`last` is a frame inside them. A seam check measuring `last` scores a frame
that was cut against an anchor the next clip opens on: a clip can be
re-rendered for a mismatch no viewer will ever see, while a real mismatch at
5.217s goes unmeasured. Naming the time measures the cut that ships.

**A time past the end of the clip does not fail.** It falls back through the
same `-sseof` cascade `last` uses and then to frame zero, so you get the last
available frame. A clip that came back a frame short should cost a slightly
different measurement, never the render.

`-ss` is applied before the input, so ffmpeg decodes to the exact point
rather than the nearest keyframe: two calls naming the same time on the same
clip return **byte-identical** bytes, exactly as two calls naming the same
end do.

**The score scale is unchanged.** `atSeconds` selects which frame is
compared and nothing else — same 320x180 Rec.709 greyscale, same mean
absolute difference, same units. The band in the table above, and the
threshold measured against it, mean what they meant.

## Errors

| status | when |
|---|---|
| 401 | no assertion, or an invalid, expired or replayed one |
| 422 | a field that is not defined here, an unknown `position`, `position` and `atSeconds` together or neither, a negative `atSeconds` (including inside a list), an empty `atSeconds` list, a `maxWidth` of zero or less, a list or `maxWidth` sent to comparison, a file that is not a readable video or image |
| 502 | the `video_url` or `image_url` could not be fetched |

An image is capped at 64 MB; a video uses the same cap as stitching.
