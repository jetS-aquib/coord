---
id: JET-201
title: Kick off lyric transcription when the job starts, not when the clips are finished
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-26T13:04:15+05:30
updated: 2026-10-26T13:04:15+05:30
decisions: 
---

## Request

Call a transcription endpoint on video-processing-backend the moment a render with showLyrics begins, and hand the result to the stitch call at the end. Transcription only needs the audio, and the audio exists minutes before the first clip does.

## Understanding

stitchClipsWithLyrics is called once, at the very end, from stitchPlanV1. Inside this service that single call does: download, analyse, encode the transitioned video, THEN transcribe with Whisper, then build captions, then encode a second time. Transcription is therefore strictly after everything else, on the critical path, at the point where nothing can hide it.

But Whisper needs nothing except plan.audioUrl, which you have at job start. During the roughly 9 minutes of anchors, clips and seam verification, this service is idle (measured: 224 of 318 seconds on the render I profiled). Transcription could run inside that window and cost nothing on the clock.

I can hide part of it on my side alone — overlapping Whisper with the video phases inside the stitch call — but that only buys me the roughly 60s the video work takes. Overlapping it with YOUR generation phases is worth minutes, and that needs the call to start early, which is yours to make.

Assumptions:
1. plan.audioUrl is known and final at startRenderV1 time and does not change during a render. If it can change, this does not work as described.
2. showLyrics is known at start too.
3. You would rather not block a render on transcription failing — it should degrade to transcribing at stitch time, as now.
4. The endpoint does not exist yet. It is mine to build and I have not built it; I want the shape agreed before I do.

## Plan

Mine to build, once you agree the shape:
1. POST /api/v1/lyric-transcription { audio_url, language } -> a transcript with word timings, cached against the audio so the later stitch reuses it instead of redoing it.
2. stitch-with-lyrics accepts an optional transcript id (or just hits the same cache) and skips transcription when it is already there.

Yours:
3. Fire the transcription call at startRenderV1 when showLyrics is set, without awaiting it.
4. Await it just before stitchPlanV1; if it failed or is not ready, call stitch exactly as today and let this service transcribe inline.

Open question for you: a cache keyed on the audio URL is simpler and means you pass nothing extra, but it is implicit. A transcript id you hold and pass back is explicit but is one more thing to thread through the plan. I lean to the cache; tell me if you would rather have the id.

## Reason

Lyrics are not switched on yet, and when they are this is the phase that will hurt: large-v3 on CPU, after a 2.9 GB model load, at the end of the pipeline where nothing overlaps it. Started at t=0 it is free. Started at stitch time it is added to the critical path of every song.

## Related files

src/services/render/renderOrchestratorV1.ts (startRenderV1, runPlanV1, stitchPlanV1), src/modules/video/video-api.service.ts

## Acceptance criteria

A render with showLyrics takes no longer end to end than the same render without them, when transcription finishes inside the generation window. If transcription fails or is slow, the song still completes, with the transcription happening at stitch time as it does today.

## Test steps

1. Render a song with showLyrics and compare total time against the same song with lyrics off; expect them close.
2. Check the service logs show transcription starting during anchoring or clip rendering, not after the transitioned video is encoded.
3. Point the transcription call at a bad URL and confirm the render still completes with captions.

## Thread
2026-10-26T13:04:15+05:30 aquib N: created ticket, status: - -> open
