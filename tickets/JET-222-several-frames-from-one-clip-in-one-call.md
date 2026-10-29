---
id: JET-222
title: Several frames from one clip in one call, and an optional size, so a vision check does not move 300MB a song
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-10-29T17:45:40+05:30
updated: 2026-10-29T18:10:49+05:30
decisions: D-042, D-043
---

## Request

Two optional additions to POST /api/v1/frame-extraction, both beside what is there rather than instead of it. First: 'atSeconds' accepting an ARRAY of times as well as a single float, answering with one image per time in the order asked. Second: an optional 'maxWidth' integer that downscales the returned frame, preserving aspect. Request shapes otherwise unchanged, same PNG, same inline base64, same byte-identity guarantee for the same input.

## Understanding

Batch 7B of the render plan put a continuity supervisor in the pipeline. 7B.1 shipped today on our side: a vision model reads every anchor STILL against that shot's stated constraints before a clip is pinned to it. That half needs nothing from you — the stills are images we already hold.

7B.2 and 7B.3 are the clip half, and they are what this is for. 7B.2 samples two or three frames of each FINISHED clip and judges them against the same constraints; 7B.3 compares the person in shot 12 against the person in shot 11. Both are vision calls on frames that only you can extract.

JET-212 already gave us the field that makes this possible — atSeconds — and it is integrated and working. So nothing here is blocked. This is about what it costs at 7B.2's call volume, which is roughly three times what your contract was written for.

THE ARITHMETIC, and please correct it, because two of the three numbers are ours and one is an estimate.
 - Our last renders are 45 clips (46 anchors). Measured, 28 plans in Mongo.
 - 7B.2 wants 2-3 frames per clip, so 90-135 extractions a song, each its own round trip. Your contract says the caller makes 'roughly sixty-six of these per song' — this would take it to about 200.
 - Clips come back at 720p, so a frame is 1280x720. We ESTIMATE a lossless PNG of that at 1-2MB, 1.4-2.7MB once base64'd, which puts a render somewhere around 200-350MB of frame transfer. That estimate is the number we are least sure of and the one that decides whether this is worth your time. If a real 720p frame off your encoder is much smaller, say so and we will drop the maxWidth half.

WHY A SIZE, SEPARATELY FROM THE BATCHING. The lossless PNG exists for a good reason that does not apply here: a frame is the yardstick for your 320x180 greyscale comparison, and a lossy frame would score compression error as model error. A VISION model does not need that. It needs a picture it can see, around 768px on the long edge, and handing it a 1280x720 PNG costs us twice — your bandwidth and ours, then image tokens on every one of 135 calls. The pixel-comparison path would keep sending no maxWidth and keep getting exactly what it gets today.

ASSUMPTIONS, which we would rather be corrected on than have you build around:
 - A single-float atSeconds keeps answering with a single object, exactly as now. Only an array changes the response shape, to an array. We would rather that than a new endpoint or a response shape that changes for everyone.
 - maxWidth absent means today's behaviour byte-for-byte, so the seam check's numbers and the 9.0 threshold measured over 132 clips (D-018) are untouched. This is the part we care about most, same as on JET-212.
 - maxWidth only ever shrinks; a value above the real width returns the real width rather than upscaling.
 - Byte-identity still holds per (clip, time, maxWidth). A re-measurement after a re-render has to mean something.
 - The exactly-one-of position/atSeconds rule is unchanged, and an empty array is a 422.
 - A time past the end inside an ARRAY falls back the way a single one does rather than failing the whole request — one short clip should not cost the other frames.
 - We are NOT asking for frame-comparison to take an array. That path is one frame per call by nature and we have no volume problem there.

WE MAY BE WRONG ABOUT THE PRIORITY. 135 sub-second calls at concurrency 6 is about 25 seconds added to a 10-minute render, which is survivable. If the transfer volume turns out not to bother you, the honest answer may be that we should just make 135 calls and you should spend your time on JET-215 instead, which is worth more to the video than this is. We would rather hear that than have you build this first.

## Plan

1. File this and keep going — 7B.2 is not blocked, only more expensive than it should be.
2. Our next step is a render with 7B.1's gate on, which produces the distribution that tells us how strict the clip check should be. That has to happen before 7B.2 is built either way, so there is no rush on your side.
3. When this lands: clipCheckV1 asks for all of a clip's sample frames in one call with maxWidth 768, and feeds them to the same vision check 7B.1 already uses.
4. If it does not land, clipCheckV1 makes N calls at full size and we accept the cost. Nothing is designed around this.
5. Either way the seam check keeps sending a single time and no maxWidth, so its numbers stay comparable with the 132-clip band we already have.

## Reason

The frame gate catches a hallucinated STILL before the clip is paid for, which is the expensive half. It cannot catch a clip that drifted away from a still that was correct — that is 7B.2, and it is the difference between checking the plan and checking the work. The plan's own line is that we generate 44 shots and nobody looks at any of them; 7B.1 means somebody now looks at the 46 stills, and this is what lets somebody look at the 45 clips.

## Related files

app/api/v1/routes/frames.py (or wherever extraction answers); .coord/contracts/video-frames.md; consumers: music-jetkreate-backend render/clipCheckV1.ts (not written yet), render/frameGateV1.ts, render/seamCheckV1.ts (unchanged)

## Acceptance criteria

An atSeconds array returns one image per time, in the order asked, each byte-identical to what the same time returns on its own today. A single float still returns a single object, unchanged. maxWidth returns a frame no wider than that, aspect preserved, byte-identical across calls for the same triple. No maxWidth returns exactly the bytes it returns today. A request with neither position nor atSeconds, or with both, is still a 422, and an empty array is a 422. One out-of-range time inside an array still answers 200 with the fallback frame for that entry.

## Test steps

1. Your arithmetic, corrected before you spend on it: measured on our encoder at 1280x720, a detailed frame is 1.63 MB of PNG (2.24 MB base64) and a flat one 0.14-1.0 MB. So 135 frames is roughly 100-300 MB a song, not 200-350 — the right order, a little high at the top. At maxWidth 768 the detailed frame drops to 0.57 MB (0.78 MB base64). The size half was worth building; so was the batching.
2. POST /api/v1/frame-extraction with `"atSeconds": [1.0, 3.5, 6.0]` on a finished clip. You get a JSON **array** of three objects in that order, each `{image_base64, mime_type}`.
3. POST each of those three times on its own and compare `image_base64` with the matching entry from step 2. They must be identical strings — batching is a transport change and nothing else.
4. POST `"atSeconds": 5.217` (a single float). You get a single **object**, not an array of one, exactly as today.
5. Add `"maxWidth": 768` to step 2 and check the decoded PNGs are 768 wide with aspect preserved. Repeat the call and confirm the base64 is identical.
6. The one that protects your seam numbers: POST the seam check's exact body (a single time, no maxWidth) and compare the base64 against what you got before this deployed. It must be identical. Then re-run seamCheckV1 over a few clips and confirm the scores land in the same band as the 132-clip set.
7. Send `"maxWidth"` far above the real width — say 4000 on a 1280-wide clip. You get the real 1280 back, and byte-identically to sending no maxWidth at all.
8. Errors: `"atSeconds": []` is a 422; `"atSeconds": [1.0]` with `"position"` is a 422; a negative time inside the list is a 422; `"maxWidth": 0` is a 422. A list or a maxWidth sent to /api/v1/frame-comparison is a 422 — that endpoint is unchanged on purpose.
9. `"atSeconds": [0.5, 99.0]` on a short clip answers 200 with two entries; the second is the fallback frame, the same one `"position": "last"` gives. One short clip does not cost the other frames.
10. Regenerate your client if it is generated from our OpenAPI: the 200 response is now `anyOf` object-or-array.

## Thread
2026-10-29T17:45:40+05:30 aquib N: created ticket, status: - -> open
2026-10-29T17:56:30+05:30 aquib N: status: open -> approved
2026-10-29T18:01:15+05:30 aquib N: status: approved -> in_progress
2026-10-29T18:01:15+05:30 aquib N: linked decision D-042 (A list of times and a maxWidth on extraction only, beside what is there)
2026-10-29T18:01:46+05:30 aquib N: status: in_progress -> review — Built, both halves. Your estimate first, since you asked to be corrected: measured on our encoder a detailed 720p frame is 1.63 MB PNG / 2.24 MB base64 and a flat one 0.14-1.0 MB, so 135 frames is ~100-300 MB a song rather than 200-350 — right order, a little high at the top. At maxWidth 768 the detailed frame is 0.57 MB. Worth building, so I did not take your offer to skip it. Both fields are on extraction only and both are additive: the response shape changes only when atSeconds is a list, so every existing call returns the same bytes. maxWidth is expressed as min(iw,N), which means a width at or above the real one is byte-identical to sending nothing — no upscale branch, no second path for 'already small enough'. Declined the comparison side as you asked, and D-042 says why in case someone proposes it later: both sides are forced to 320x180 there, so a width would only add a resampling step to one side of D-018's metric. The list extracts sequentially — sub-second work on a box that is also encoding, so three at once would finish no sooner. Step 6 of the test steps is the one I would run first.
2026-10-29T18:10:49+05:30 aquib N: linked decision D-043 (The measured check spends first; the clip check gets what is left, and never for a judgement)
