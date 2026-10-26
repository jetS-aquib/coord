---
owner: video-processing-backend
status: active
---

# /api/v1/segment-stitch, /api/v1/segment-concat

Written for JET-202, so a song can be stitched while it is still being
generated instead of in one call at the end. These are the shapes — you
should not have to read the Python to call them.

`xfade` needs both clips of a boundary, not all of them, so a group of
consecutive clips can be stitched as soon as it is verified. The join at the
end is a stream copy and costs a remux.

**The existing single-call endpoints are untouched.** `clip-stitching`,
`clip-stitching-with-audio` and `clip-stitching-with-lyrics` behave exactly
as they did, and remain the way to render a song in one go. If a segment
fails, fall back to them: that costs the render time, not the render.

Both endpoints are jobs, like the stitch endpoints they are made of: `202`
with a job id, settled by polling `/api/v1/jobs/{job_id}`. Both require
`X-Service-Assertion` and both bodies are `extra="forbid"`.

## `POST /api/v1/segment-stitch`

```jsonc
// request
{
  "clips": [ { "url": "https://…/clip7.mp4", "order": 1 },
             { "url": "https://…/clip8.mp4", "order": 2 } ],
  "segmentIndex": 2,
  "quality": "fast"
}

// 202 — a normal job
{ "job_id": "…", "workflow": "segment_stitch", "status": "queued", … }
```

`order` is within the segment and starts at 1, as everywhere else here.
`segmentIndex` is your own numbering: it labels the job so a log, or a
failed segment, can be told from its neighbours. This service never reorders
by it — the finalise call's list is the order.

**Two clips minimum.** A one-clip scene joins the scene next to it; the
result is still cut on a scene boundary, which is the whole point. There is
no single-clip segment and there does not need to be.

Rendered to the same frame a full stitch would use — `1920x1080@30`, or
`1080x1920@30` on a deployment with `ENABLE_PORTRAIT_OUTPUT=true` and a
majority-portrait segment. Keep the flag the same for every segment of one
song: segments in two different frames cannot be joined, and the finalise
call refuses them rather than producing a master whose second half is the
wrong shape.

### A segment is not an attempt

The stitch endpoints return the same job for a repeated attempt (JET-155),
because a retried dispatch must not render a second video. Segments cannot
work that way — there are several per render — so **segment calls are not
deduplicated and a retry renders again**. They also report nothing to the
creator API and carry no `attempt_id`.

The finalise call is the one that is attempt-scoped, reports the outcome and
carries the measurement. One attempt still settles exactly once, from the
job that produced the customer's video.

## `POST /api/v1/segment-concat`

```jsonc
// request
{
  "segments": ["<segment job id>", "<segment job id>", "…"],   // in play order
  "audioUrl": "https://…/song.mp3",
  "showLyrics": true,
  "captionStyle": "spark", "captionFont": "bebas_neue", …      // as the lyrics stitch
}

// 202 — a normal job, the one that settles the attempt
{ "job_id": "…", "workflow": "segment_concat_lyrics", "status": "queued", … }
```

**Job ids, not URLs.** You already hold them from polling, this service can
check that each belongs to your workspace before it reads it, and a job id
does not expire the way a signed URL does. A segment that is not yours is
**404 and not 403**, for the same reason a job id is.

Everything after `segments` is the lyrics stitch request you send today:
same `audioUrl`, same caption fields, same defaults. `showLyrics: false`
joins and muxes the audio without captions. There is no `quality` — quality
selects the analysis sample step and vocal separation, and a finalise
analyses nothing.

Refused with `409` if a listed job is not a segment, is not completed, or
has no stored output; with `422` if a segment is listed twice.

### What a join looks like

Segments concatenate with `-c copy`: no re-encode, no quality cost, and the
caption burn afterwards is the same single encode a lyrics render already
does.

A segment boundary is a **hard cut** — `xfade` cannot be applied after the
fact. Group segments on scene boundaries, where the storyboard changes shot
anyway and a cut is what a music video does. Every clip carries
`sceneIndex`, and a scene-aligned segment closes when all of its clips are
verified rather than after a fixed count.

One consequence worth knowing: each join keeps the crossfade's overlap that
a single-call render would have spent, so the joined video runs about one
transition longer per boundary. The final mux trims to the master audio, as
it always has, so that time comes off the end of the last clip — a second or
two on a four-boundary song.

## Notes

Segments stay in the bucket as ordinary job outputs. Nothing deletes them
after the finalise; they cost storage, not correctness.
