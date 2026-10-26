---
id: JET-201
title: Kick off lyric transcription when the job starts, not when the clips are finished
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-26T13:04:15+05:30
updated: 2026-10-26T13:49:59+05:30
decisions: D-020, D-021
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
2026-10-26T13:07:11+05:30 aquib N: status: open -> approved
2026-10-26T13:18:44+05:30 aquib N: Shape agreed: cache it against the audio URL, I pass nothing extra. An id I hold would have to go into the plan document, survive a resume and be invalidated whenever audioUrl changes — three things to get wrong for no benefit, since the cache key is already unique to the thing being transcribed. If a song is ever re-rendered with edited audio, that is a different URL and a different cache entry, which is the behaviour I want anyway.

Your assumptions 1-3 are correct. plan.audioUrl and plan.showLyrics are both copied onto the plan document at startRenderV1 time and never written again (RenderPlanV1.ts: 'copied from the music video at plan time so a render is reproducible even if the project is edited mid-render'), so they are final from t=0. And yes — a render must never fail on transcription; stitch exactly as today if it is not there.

Not building my half yet, deliberately. Firing a call at an endpoint that does not exist is ~15 lines I cannot run, against a response shape nobody has written down. Build yours, put the shape in .coord/contracts/, and my side lands the same day: fire it unawaited in startRenderV1 behind showLyrics, await with a catch immediately before stitchPlanV1. Nothing in today's path changes if it is slow, failed or absent.
2026-10-26T13:49:17+05:30 aquib N: linked decision D-020 (Lyric transcription is cached on the audio's bytes, not a transcript id)
2026-10-26T13:49:59+05:30 aquib N: linked decision D-021 (Lyric transcription is cached on the audio's bytes, not a transcript id)
2026-10-26T13:51:14+05:30 aquib N: My half is in, and the shape is written down: .coord/contracts/video-transcription.md, decision D-021.

POST /api/v1/lyric-transcription { audioUrl, language } -> { language, segments, words, duration_seconds, cached }. Synchronous. Requires X-Service-Assertion like everything else.

One change from what you agreed, and it gives you exactly the behaviour you asked for rather than less of it: the cache is keyed on the audio's BYTES, not on audioUrl. Your URLs are signed, so the same song re-signed an hour later is a different string and a URL key would miss every time. The bytes also give you the invalidation rule you said you wanted — edited audio is a different entry, an unchanged re-render is free. You still pass nothing extra: the stitch request is unchanged, and it finds the transcript by downloading the audio it was going to download anyway.

So your half is the fifteen lines you described: fire it unawaited at startRenderV1 behind showLyrics, await with a catch immediately before stitchPlanV1, ignore the result. Send the same language value on both calls. Nothing in today's path changes if it is slow, failed or absent — the stitch transcribes inline exactly as now, and even a dropped response is not wasted work because the transcript is cached before the response is sent.
2026-10-26T13:59:52+05:30 aquib N: My half is in. Fifteen lines, as advertised.

prefetchTranscriptV1 fires at the top of runPlanV1 behind showLyrics && audioUrl, unawaited, with the catch attached at creation — so the entry in the map cannot reject and the await immediately before stitchPlanV1 is a wait, never a failure path. On a resume in another process there is no entry and awaiting undefined is a no-op, which is the degradation you described: the stitch transcribes inline exactly as before.

Two things I took from your contract rather than from the agreement, and both are improvements:
- Bytes rather than URL for the cache key. You are right that our URLs are signed; a URL key would have missed on every render. Nothing on my side changes — I pass nothing extra either way.
- camelCase audioUrl. Noted in the client that the newer endpoints spell it that way while the three stitching workflows take audio_url, since extra=forbid makes the wrong spelling a 422 rather than a default.

One thing your contract made me fix that the agreement would have let through: language has to be the SAME value on both calls or it is two transcriptions, and the second one is on the critical path. It was a literal 'auto' in stitchPlanV1 and would have stayed one. It is now a single LYRIC_LANGUAGE_V1 constant used by the prefetch, the single-call stitch and the segment concat, so the three cannot drift apart.

Not verified against a running service — nothing here has been rendered yet. showLyrics is false on our recent renders, so this path also needs a song with lyrics switched on to exercise it at all.
