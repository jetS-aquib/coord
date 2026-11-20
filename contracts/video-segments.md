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

**Callback (JET-280).** Send `callback_requested: true` and a settled job is
also posted to the music-video callback, under the `attemptId` of the
assertion the call was made with — for a segment too, so each segment can
wake its own waiter instead of being polled. A segment's callback settles no
attempt; the concat's does. Polling still works and is still the fallback.
`segment-concat` accepts the same `callback_requested` field (JET-306; before
that it answered `422 extra_forbidden`).

**Lanes (JET-280).** Segments run in their own worker pool
(`SEGMENT_WORKERS`, default 2). Everything else — the concat, and the
single-call fallback — runs in the main lane (`MAX_CONCURRENT_JOBS`), so it
never waits behind segments still queued, its own or another render's.

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

`order` is within the segment and starts at 1, as everywhere else here. A clip
here may also carry `inSeconds` / `outSeconds`, exactly as on the single-call
endpoints and meaning exactly the same thing — it is one `clips` shape, so a
segmented render cuts on the beat the same way a single-call one does. See
video-stitching.md for what they are and how they fail (JET-207, D-027).

One thing that is specific to segments: a trim is applied before the transition,
so the crossfade at a segment's internal boundaries overlaps surviving frames.
The **join** between two segments is a hard cut and overlaps nothing, so the
per-boundary overlap noted further down is unchanged by trimming — the final mux
still trims to the master audio.
### Beat cuts: `cutStyle` and per-clip `zoom` (JET-344)

```jsonc
{
  "clips": [ { "url": "https://…/clip7.mp4", "order": 1, "inSeconds": 0,   "outSeconds": 1.3 },
             { "url": "https://…/clip7.mp4", "order": 2, "inSeconds": 1.3, "outSeconds": 2.6, "zoom": 1.25 },
             { "url": "https://…/clip7.mp4", "order": 3, "inSeconds": 2.6, "outSeconds": 4.0, "zoom": 1.5, "zoomAnchor": "upper" } ],
  "segmentIndex": 2,
  "cutStyle": "hard"
}
```

- `cutStyle` (or `cut_style`): `"xfade"` (default, today's dissolves) or
  `"hard"`. Hard joins the clips back to back: no dissolve, and no similarity
  or transition analysis. The segment is exactly the sum of its pieces'
  lengths, so every cut lands where you put it. Anything else is a 422.
- `zoom` on a clip: `1.0`–`1.6`, a punch-in cropped from the clip and scaled
  back to its own frame, in the same encode as its trim. Absent or `1.0`
  leaves the clip untouched. Over `1.6` is a 422.
- `zoomAnchor` (or `zoom_anchor`): `"center"` (default) or `"upper"`, which
  keeps the crop in the top half of the frame, where the faces are.
- **Up to 120 clips** per segment-stitch (50 everywhere else), so one clip can
  go in as several beat-length pieces. The same URL may repeat; each piece is
  its own download.
- `segment-concat` takes no `cutStyle`: the join between segments has always
  been a hard cut.
- None of the three fields sent is today's request, byte for byte.

### Graphic layer: `transitionIn` and `splitPair` (JET-349)

```jsonc
{
  "clips": [ { "url": "…/a.mp4", "order": 1 },
             { "url": "…/b.mp4", "order": 2, "transitionIn": "block_grid" },
             { "url": "…/c.mp4", "order": 3, "transitionIn": "bw_flash" },
             { "url": "…/d.mp4", "order": 4 } ],
  "segmentIndex": 0, "cutStyle": "hard",
  "splitPair": [3, 4]
}
```

- `transitionIn` (or `transition_in`) on a clip: `"block_grid"` (a 4x4 grid
  of black blocks over the clip's first 0.2s, clearing a few per frame) or
  `"bw_flash"` (its first 0.1s in hard black and white). It is drawn on the
  clip's own first frames, so it never moves a cut. Meant for `cutStyle:
  "hard"`; under dissolves it is half hidden.
- `splitPair` (or `split_pair`): two clip `order`s `[i, j]`. Clip i plays with
  clip j beside it (landscape) or below it (portrait), each cropped to fill
  its half, for the **shorter** of the two (after their trims). Clip j does
  not play on its own, so plan the segment's length without it. The two
  orders must differ and exist, and the segment needs a third clip: 422
  otherwise.
- Absent is today's request, byte for byte.

`segmentIndex` is your own numbering: it labels the job so a log, or a
failed segment, can be told from its neighbours. This service never reorders
by it — the finalise call's list is the order.

**Two clips minimum.** A one-clip scene joins the scene next to it; the
result is still cut on a scene boundary, which is the whole point. There is
no single-clip segment and there does not need to be.

Rendered to the same frame a full stitch would use, and `segment-stitch`
takes the same optional `outputFrame` the stitch endpoints do — see
video-stitching.md for the aspects and the pixels each one gives (JET-232).

**Send the same `outputFrame` on every segment of one song.** Segments in two
different frames cannot be joined, and the finalise call refuses them rather
than producing a master whose second half is the wrong shape. The same applies
to the flag when you name no frame: `ENABLE_PORTRAIT_OUTPUT` with a
majority-portrait segment gives `1080x1920@30`, and a segment whose clips
happen to tip the other way gives landscape.

`segment-concat` accepts `outputFrame` too, so you can hold one value and send
it throughout, but there it is **checked, not obeyed**: the segments were
already rendered and the captions burn onto their own pixels. A finalise that
names a frame its segments are not in fails with both shapes in the message,
rather than stretching every lyric the length of the song. Naming nothing takes
the segments as they are, which is what it always did.

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
  "lyricEngine": "whisper",             // optional; absent is "whisper" (D-061)
  "lyricLines": [ { "start": 21.76, "end": 23.4, "text": "…" } ],  // optional; the creator's corrected lines (JET-267)
  "audioStartSeconds": 60, "audioEndSeconds": 90   // optional; render only this part of the song (JET-329)
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

`lyricLines`, `audioStartSeconds` and `audioEndSeconds` work exactly as on the lyrics stitch; see contracts/video-stitching.md.

Refused with `409` if a listed job is not a segment, is not completed, or
has no stored output; with `422` if a segment is listed twice.

### Cold open and film finish: `coldOpen`, `finish` (JET-349, JET-362)

```jsonc
{ "segments": ["…", "…"], "audioUrl": "…", "coldOpen": { "start": 60, "end": 66 }, "finish": "film" }
```

- `coldOpen` (or `cold_open`): `{start, end}` seconds of the master (after
  any `audioStartSeconds` window), at most 15s long. That stretch, picture and
  sound, plays first, then 0.3s of black and silence, then the song from its
  top. The master is `end - start + 0.3` seconds longer, and the captions
  move later by the same amount (none show over the cold open). It must end at
  least 0.3s before the master does, or the job fails (the length is only
  known once the audio is downloaded, so it is not a 422).
- `finish`: `"film"` or absent. One grade over the whole master (soft
  S-curve, blacks lifted ~4%, saturation x0.9), a warm halation glow off the
  highlights, and fine moving luma grain. Applied before the captions, so
  the lyrics stay clean.
- Either one costs one extra near-lossless encode of the joined master
  (crf 16). Neither sent is today's request, byte for byte.

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
