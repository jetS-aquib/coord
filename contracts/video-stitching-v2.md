---
owner: video-processing-backend
status: active
---

# /api/v2 stitching

The same four stitch endpoints as `/api/v1`, rendering at the clips' own
resolution instead of scaling them up. Filed as JET-237.

**Everything about the request and the response is unchanged.** Same bodies,
same `202` + `JobResponse`, same errors, same service assertion. Moving is a
URL string per endpoint:

```
POST /api/v1/clip-stitching-with-lyrics   ->  POST /api/v2/clip-stitching-with-lyrics
POST /api/v1/clip-stitching-with-audio    ->  POST /api/v2/clip-stitching-with-audio
POST /api/v1/clip-stitching               ->  POST /api/v2/clip-stitching
POST /api/v1/segment-stitch               ->  POST /api/v2/segment-stitch
POST /api/v1/segment-concat               ->  POST /api/v2/segment-concat
```

So read video-stitching.md and video-segments.md for the shapes; this file
only records what differs.

## Polling does not move

`GET /api/v1/jobs/{job_id}` is how you poll a v2 render, and
`/api/v1/lyric-transcription`, `/api/v1/song-read`, the frame endpoints and
the caption endpoints are all version-independent and stay where they are.
There is one job store and one set of job ids. Two would be two things to
reason about for no behaviour anybody asked for.

The job's state carries `pipeline: "v1" | "v2"`, so a master that came back
the wrong size can be attributed without guessing which endpoint made it.

## The output frame

v1 renders the audio and lyrics workflows at `1920x1080`, or `1080x1920` when
portrait, **whatever the clips are**. For the music video flow that means
720x1280 clips are scaled UP: 2.25x the pixels, about 1.8x the encode, and no
detail that was not already in them. D-005 chose that deliberately, and every
caller on `/api/v1` still gets it.

**v2 renders at the clips' own size.** 720x1280 clips give a 720x1280 master.

Three things about how that size is picked:

- It is the **mode** of the clips' short sides, not the maximum. One stray
  1080p clip among 45 720p ones does not make the whole song a 1080p encode.
  Anything that does not match the chosen frame is still scaled and padded
  into it, exactly as on v1, so a mixed set gives one coherent master.
- There is a **floor of 720**. Native is a saving, not an excuse for a 240p
  master, so clips smaller than that still render at a 720 short side.
- If the clips cannot be measured, v2 falls back to v1's fixed frame rather
  than guessing.

`outputFrame` works exactly as it does on v1 (JET-232): **you still name the
aspect**, and v2 only changes the resolution that aspect is rendered at. So
`"9:16"` is `1080x1920` on v1 and `720x1280` on v2 for 720p clips.

`clip-stitching` is unchanged on v2. It has always been 720p and has never had
resolution selection, so there is nothing to save.

`segment-concat` is unchanged on v2 too, on either pipeline: its inputs were
already rendered and the captions burn onto their pixels, so there is no frame
left to choose.

## What is NOT different yet

v2 still encodes the material three times — once per trimmed clip, once for
the transitions, once to burn the captions. Collapsing those into a single
filter graph is the larger half of the available speedup and is not in the
first release. When it lands, nothing in this file changes: it is faster, not
different.

## Which to call

`/api/v1` is not deprecated and is not going away while anyone is on it. Use
v2 if you want the speed and a master at the clips' resolution; stay on v1 if
anything downstream of you assumes a 1080-wide file.
