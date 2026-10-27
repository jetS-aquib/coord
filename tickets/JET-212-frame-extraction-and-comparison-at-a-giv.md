---
id: JET-212
title: Frame extraction and comparison at a given second, so a trimmed clip is checked at the frames that survive
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-10-27T16:45:51+05:30
updated: 2026-10-27T16:46:30+05:30
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

—

## Thread
2026-10-27T16:45:51+05:30 aquib N: created ticket, status: - -> open
2026-10-27T16:46:30+05:30 aquib N: linked decision D-031 (Scenes and clip lengths derive from the song's structure, not from the model's maximum duration)
