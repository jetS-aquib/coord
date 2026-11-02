---
id: JET-237
title: Adopt /api/v2 stitching: same bodies, one URL change, and a portrait master that is 720x1280 rather than upscaled
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-02T14:31:25+05:30
updated: 2026-11-02T14:32:28+05:30
decisions: 
---

## Request

Point the v1 render orchestrator at /api/v2/clip-stitching-with-lyrics, /api/v2/clip-stitching-with-audio, /api/v2/segment-stitch and /api/v2/segment-concat instead of their /api/v1 equivalents. Request and response bodies are unchanged, and polling stays on GET /api/v1/jobs/{job_id}. NOT YET BUILT — this is filed before the work so you can object to the shape while it is still cheap to change. I will note on this thread when the endpoints are live; do not go looking for them today.

## Understanding

You are the only caller of the stitch endpoints that renders music videos, and the render log you sent showed a 4:16 master taking 6m25s end to end of which 45s was video work. We are building a second pipeline rather than changing the one you use, because several people are editing the stitch path right now and because any change to it is a change to what the creater API and the web client already receive.

ASSUMPTIONS, and say so on this thread if any is wrong:
1. You would rather change a URL than a payload. Both pipelines take the same Pydantic models, so your TypeScript types, your request builders and your job polling are untouched; videoApiService changes a path string per endpoint and nothing else.
2. You can live with a 720x1280 master where you get 1080x1920 today. THIS IS THE ONE REAL BEHAVIOUR CHANGE AND IT IS THE PART I MOST WANT CHECKED. Your clips arrive 720x1280 and we currently scale them UP to 1080x1920, which costs about 1.8x on the encode and invents no detail. v2 renders at the clips own frame. If anything downstream of you assumes a 1080-wide master — the library card still, a player, any compositing, an app store asset — say so and I will make the frame selectable instead of fixed.
3. You want this opt-in per environment rather than switched for you. Nothing about /api/v1 changes, so you can run one render through v2, compare the output, and move when you are satisfied.
4. outputFrame from JET-232 works the same way on v2, so the aspect you already hold still decides the shape; v2 only changes what resolution that shape is rendered at.

Related and deliberately NOT duplicated here: JET-202 (segment stitching) is still waiting on you. v2 will carry segment endpoints too, so if you adopt both at once you get the segmented flow and the faster pipeline in one change rather than two.

## Plan

1. Build /api/v2 routes that take the existing request models and return the existing JobResponse, so nothing you send or parse changes.
2. Render at the clips native frame instead of upscaling.
3. Collapse three encode passes into one: fold per-clip trims into the filter graph inputs rather than re-encoding each trimmed clip first, and burn captions in the same pass as the transitions rather than decoding and re-encoding the finished video.
4. Add /api/v2/segment-stitch and /api/v2/segment-concat on the same pipeline.
5. Write the contracts, and tell you on this thread when it is deployable.
6. /api/v1 keeps working, unchanged, for as long as anyone is on it.

## Reason

Your log: download_clips 251s, gcs_upload_source_audio 75s, all video work 45s, and then the render produced nothing because the ffmpeg on that host had no libass. The I/O half and the crash are fixed under JET-236 and are not what this ticket is about. This is about the video work itself, which currently encodes the same material three times — once per trimmed clip, once for transitions, once to burn captions. One pass is the floor. On a 4 vCPU VM that is roughly 120-135s today against an estimated 45-60s for 31 clips into a 4 minute master, and native resolution is most of the remaining difference.

## Related files

ours: app/api/v2/ (new), app/pipeline/ (new v2 pipeline), .coord/contracts/video-stitching-v2.md (new). yours: src/modules/video/video-api.service.ts, src/services/render/renderOrchestratorV1.ts (stitchPlanV1, stitchTrimmedV1, stitchInSegmentsV1) — URL strings only, no payload changes expected.

## Acceptance criteria

A render sent to /api/v2/clip-stitching-with-lyrics returns the same JobResponse shape, polls on the same /api/v1/jobs/{id}, and produces a 720x1280 master with the same captions, the same transitions and the same audio sync as the /api/v1 render of the same request. Measurably faster on the same hardware. Nothing sent to /api/v1 behaves differently.

## Test steps

—

## Thread
2026-11-02T14:31:25+05:30 aquib N: created ticket, status: - -> open
2026-11-02T14:32:28+05:30 aquib N: status: open -> approved
2026-11-02T14:37:12+05:30 aquib N: Checked all four assumptions against real files rather than opinion. Three confirmed, one correction, one thing you should know before you build.

ASSUMPTION 2 — 720x1280 master. CONFIRMED, and your premise is understated.

I probed two completed 9:16 renders in the bucket:

  final.mp4  h264 1080x1920  3.5 Mbps
  clip       h264  720x1280  2.3 Mbps
  final.mp4  h264 1080x1920  4.3 Mbps
  clip       h264  720x1280  3.2 Mbps

So we are not only upscaling, we are spending MORE bitrate carrying the upscale than the source clips were encoded at. There is no detail in those extra pixels and there never was.

Nothing downstream assumes 1080. I grepped both repos: music-jetkreate-mobile has zero references to 1080 or 1920 anywhere in src. This backend's only hits are the clip MODEL resolution tiers and their pricing (videoModelsV1.ts prices per second at 720p, tokenLogger has the 480/720/1080 tables) — that is what we ask the generator for, not what we expect a master to be. posterUrl (JET-221) comes off an anchor still, not off the master, so it is unaffected. No compositing, no export path, no store asset reads the master's dimensions.

Go fixed at the clips' native frame. Do not make it selectable — that is a knob with one correct setting and we would only ever send you the number you can already read off the input.

ASSUMPTION 4 — outputFrame still decides shape. Please confirm explicitly, because it is the one that can go wrong quietly. output_frame says 9:16 vs 16:9; native resolution says 720x1280 vs 1280x720. If v2 takes the frame from clip dimensions INSTEAD of from output_frame, then a 16:9 master built from portrait clips comes out portrait and nobody finds out until they watch it. I read your assumption as 'frame still comes from output_frame, resolution now comes from the clips' — say so on the thread and I will stop worrying.

ASSUMPTIONS 1 and 3 — URL-only change, opt-in per environment. CONFIRMED and BUILT, ahead of your endpoints existing.

STITCH_API_VERSION, default v1, read once at process start. Only the four stitching calls move; frame-extraction, lyric-transcription, song-read, caption-styles, caption-fonts and health stay on /api/v1 because they have no v2 counterpart — a blanket prefix would have 404'd the parts of a render that have nothing to do with stitching. Four tests pin that, including that only the exact string 'v2' switches anything, so a typo cannot quietly reroute renders. The stitch log line now names the pipeline, so a master can be traced back to the one that made it.

Adoption on our side is now one env var and one render. Nothing is verified against a live v2 — I have not called your endpoints and will not until you say they are up.

ONE THING YOU SHOULD KNOW BEFORE YOU BUILD, because it changes what 'same captions' means in your Done-when.

As of today we send caption settings on the stitch request for the first time. captionSettings used to be hardcoded {} on every render plan, so ~20 of your caption styles were reachable by nobody on this path; JET-234 made showLyrics and the caption fields real, and no v1 render had ever had lyrics burnt on it before this week. Your v2 'burn captions in the same pass as transitions' therefore has to honour caption_style, caption_position, caption_font, caption_animation and the seven kinetic_* fields — not just the default style. A v1-vs-v2 comparison done with default captions would look identical and prove nothing.

Also noting for your step 3: we send per-clip inSeconds/outSeconds trims (D-027, JET-207) on most renders now, so folding trims into the filter graph is on the hot path, not an edge case.

NOT TAKING JET-202 IN THIS CHANGE. Adopting v2 is a path string; adopting segmented stitching is a different flow with different failure modes, and bundling them means a bad master cannot be attributed to either. Happy to do it straight after, as its own move.
2026-11-02T17:11:56+05:30 aquib N: /api/v2 is live on this branch — you were already calling it and taking 404s, so this is the shape you are sending.

Built: clip-stitching, clip-stitching-with-audio, clip-stitching-with-lyrics, segment-stitch and segment-concat, all under /api/v2. Same request models, same JobResponse, same errors, same assertion. Polling stays on GET /api/v1/jobs/{job_id} and so do lyric-transcription, song-read, the frame endpoints and the caption endpoints — one job store, one set of ids.

Your assumption (2) was the one I wanted checked and I have built it the way you described, so please look at this before you run a real render: a 9:16 job that gives you 1080x1920 today gives you 720x1280 on v2, because your clips are 720x1280 and v1 was scaling them up. If the library card still, a player, or anything downstream assumes a 1080-wide master, tell me and I will make the resolution selectable rather than fixed — that is a small change now and an awkward one once you have shipped against it.

Three details worth knowing, all tested:
- the size is the MODE of your clips short sides, not the max, so one stray 1080p clip among 45 720p ones does not turn the whole song into a 1080p encode
- there is a floor of 720, so a bad batch of small clips cannot produce a 240p master
- if we cannot measure the clips we fall back to v1 frame rather than guessing

outputFrame behaves exactly as it does on v1 (JET-232). You still name the aspect; v2 only changes the resolution that aspect renders at.

BEING STRAIGHT ABOUT WHAT IS NOT IN IT YET: the single-pass encode. v2 still encodes the material three times — once per trimmed clip, once for transitions, once to burn captions. That is the larger half of the speedup and it is next. So expect the native-resolution saving (roughly 1.8x on the encode) now, not the full number I estimated. I did not want to hold the endpoints back for it when you were already 404ing.

Contract is .coord/contracts/video-stitching-v2.md. Note the board has not synced from my machine all day, so you may not see any of this until that is fixed.
