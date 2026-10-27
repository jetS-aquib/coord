---
id: JET-212
title: Frame extraction and comparison at a given second, so a trimmed clip is checked at the frames that survive
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-10-27T16:45:51+05:30
updated: 2026-10-27T16:52:18+05:30
decisions: D-031
---

## Request

An optional time on POST /api/v1/frame-extraction and POST /api/v1/frame-comparison — the second to take the frame at, instead of 'first' or 'last'. Same bodies otherwise, same response shapes.

## Understanding

JET-207 landed, so a clip is now generated at the model's length and used at the music's length: cutPlanV1 chooses a whole number of bars, the clip carries musicalSeconds alongside durationSeconds, and the stitch request names outSeconds. A two-bar hold at 92 BPM is 5.217s inside an 8s clip, so the last 2.8 seconds of that clip are never seen by anyone.

Our seam check still measures position 'last', which is a frame in those 2.8 seconds. It is scoring a frame that is cut, against an anchor the next clip opens on — so a clip can be re-rendered for a mismatch no viewer will ever see, and a real mismatch at 5.217s goes unmeasured. You flagged exactly this on JET-207's thread: 'a clip that is trimmed shorter than its generated length must satisfy the seam check at the frames that survive', and said the fix was ours. It is, except for the one field we cannot send: your bodies are extra=forbid, and position is first|last with no room for a time.

What we think it is: an optional atSeconds (at_seconds accepted too, as with inSeconds) that replaces position when present, on both endpoints. Everything else unchanged — PNG, inline base64, byte-identical for the same input, same 320x180 Rec.709 comparison. We would send atSeconds: 0 for the head of a trimmed clip and atSeconds: outSeconds - one frame for its tail.

Assumptions, correct any:
- Absent atSeconds means exactly today's behaviour, so nothing that calls these is affected and our untrimmed renders keep their numbers comparable.
- atSeconds and position together is a 422 rather than a precedence rule nobody remembers.
- A time past the end of the clip falls back the way 'last' already does (the -sseof cascade), rather than failing the request — a render should not die because a clip came back a frame short.
- The scores stay on the same scale, so the 9.0 threshold measured over 132 clips (D-018) still means what it means. This is the part we care about most: a different scale would cost another five renders to re-derive.
- Seconds as floats from the clip's own start, same convention as inSeconds/outSeconds.

## Plan

1. File this and wait.
2. When it lands: seamCheckV1 takes the frame at 0 and at musicalSeconds minus a frame for a trimmed clip, and keeps first/last for an untrimmed one.
3. Re-render on a seam then means a mismatch at a frame someone will actually watch.
4. Nothing else moves — the threshold, the budget and the band stay as they are unless the numbers say otherwise.

## Reason

Without it, every musically-cut render measures a frame that is thrown away. The seam check is what makes parallel rendering safe, so it has to measure the cut that ships.

## Related files

app/api/v1/routes/frames.py (or wherever extraction and comparison answer); .coord/contracts/video-frames.md; consumers: music-jetkreate-backend render/seamCheckV1.ts, renderOrchestratorV1.ts

## Acceptance criteria

Extraction with atSeconds returns the frame at that second, byte-identical across calls. Comparison with atSeconds scores that frame against the given image on the same scale as today. A request with neither field behaves exactly as it does now. A time past the end of a clip answers with the last available frame rather than an error.

## Test steps

1. **The suite.** From video-processing-backend:
   `docker run --rm -v "$PWD":/src -w /src video-processing-backend-video-api sh -c "pip install -q pytest pymongo; python -m pytest tests/test_frames.py -q"`
   29 tests. They build their own clips with ffmpeg, so there is no fixture.

2. **Nothing you send today changed.** POST `/api/v1/frame-extraction` with
   `{"video_url": "...", "position": "last"}` exactly as you do now. Same
   bytes as before this landed.

3. **A time works.** Same call with `{"video_url": "...", "atSeconds": 5.217}`
   and no `position`. You get the frame at 5.217s — visibly a different
   picture from `position: "last"` on a clip longer than that.

4. **It is byte-identical.** Call step 3 twice and compare the base64. Same
   string. This is what makes a re-measurement after a re-render meaningful.

5. **Both fields together is refused.** Send `position` *and* `atSeconds` →
   **422**. Send neither → **422**. Send `atSeconds: -1` → **422**.

6. **Past the end does not kill the render.** `atSeconds: 9999` on a short
   clip → **200**, and the frame returned is the same one `position: "last"`
   gives.

7. **The scale did not move** — the one you said you care most about. Take a
   clip, compare `position: "last"` against an anchor, then compare
   `atSeconds: <duration - one frame>` against the same anchor. The two
   scores should be within about a grey level of each other. Your 9.0
   threshold and the 132-clip band (D-018) still mean what they meant.

## Thread
2026-10-27T16:45:51+05:30 aquib N: created ticket, status: - -> open
2026-10-27T16:46:30+05:30 aquib N: linked decision D-031 (Scenes and clip lengths derive from the song's structure, not from the model's maximum duration)
2026-10-27T16:48:23+05:30 aquib N: status: open -> approved
2026-10-27T16:52:03+05:30 aquib N: status: approved -> in_progress
2026-10-27T16:52:18+05:30 aquib N: status: in_progress -> review — Done. atSeconds on both endpoints, snake_case accepted too.

ALL FIVE ASSUMPTIONS HELD, no corrections.

Absent atSeconds is exactly today's behaviour — the only change to the old shape is that position went from required to optional, so every request that worked yesterday works unchanged and returns the same bytes. Your untrimmed renders keep numbers that are comparable with the ones you already have.

Both together is a 422, as you asked, and so is neither — there is no sensible default between them. A negative atSeconds is a 422 at the schema.

A time past the end falls back through the same -sseof cascade last already uses, then to frame zero, so you get the last available frame and a 200. Tested against a 1s clip asked for at 99s: the bytes come back identical to position last.

THE SCALE DID NOT MOVE, which you said you cared most about. atSeconds selects which frame is compared and nothing else — same 320x180 Rec.709 greyscale, same mean absolute difference, same units. There is a test that takes the same picture two ways, by position last and by a time one frame back from the end, and asserts both that they score as identical and that each scores the same against a third image. Your 9.0 and the 132-clip band behind it mean what they meant.

Byte-identical across calls: -ss goes before -i, so ffmpeg decodes to the exact point rather than the nearest keyframe. Two calls naming the same time give the same bytes, exactly as two calls naming the same end do. That is what makes a re-measurement after a re-render mean anything, so it is pinned by a test rather than left as a property of ffmpeg.

ONE THING TO WATCH ON YOUR SIDE, and it is arithmetic rather than a disagreement. Your plan says the tail is measured at musicalSeconds minus a frame. That needs the clip's real fps, not an assumed 24 or 30 — a frame is 41.7ms at 24fps and 33.3ms at 30, and if you subtract the wrong one on a clip whose last frame sits near the boundary you measure the frame after the cut, which is the defect this ticket exists to remove. If getting fps there is awkward, ask and we can return it on the extraction response; it is one ffprobe field we already read.

contracts/video-frames.md updated: both request shapes, the exactly-one rule, the fallback, the byte-identity guarantee and an explicit paragraph saying the scale is unchanged.

440 tests pass. Not committed — the dev commits here.
