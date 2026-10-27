---
id: JET-208
title: Warm the transcript when the audio is uploaded, not when the render starts
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-27T13:54:51+05:30
updated: 2026-10-27T14:00:03+05:30
decisions: 
---

## Request

Expose the JET-201 prefetch one step earlier: a small authenticated route that takes an audioUrl and fires POST /api/v1/lyric-transcription unawaited, so the transcript is being made while the user is still on the brief screen. The render keeps its own prefetch; this is a third, earlier trigger, not a replacement.

## Understanding

JET-201 is done and working: prefetchTranscriptV1 fires at startRenderV1 and the stitch awaits whatever is left of it. That took the 99s cold Whisper load off the end of the render. 6.1 of the delivery plan moves the same call earlier again, to the moment the file finishes uploading, which on a real flow is minutes before the render starts — time the user spends choosing a style and reading the brief.

What this looks like in your code, having read it:

- renderOrchestratorV1.ts already has everything. prefetchTranscriptV1(plan) is nine lines wrapped around videoApiService.lyricTranscription, keyed in the  map by jobId. The only thing it needs from the plan is audioUrl and userId. Splitting the body into a helper that takes (audioUrl, userId, key) and exporting a warmTranscriptV1(audioUrl, userId) over it is the whole change — the render path keeps its jobId key, because stitchPlanV1 awaits transcriptions.get(jobId) and that has to keep working unchanged.
- One thing to watch that is not obvious: the render-time entry is deleted at line ~612 when the run ends. An upload-keyed entry has no run to end it, so it needs to drop itself when it settles or the map grows one dead promise per uploaded song for the life of the process. Nothing ever awaits it, so deleting on settle is free.
- musicVideoV1.routes.ts: a POST that is not project-scoped, because at upload there is no project yet. Body { audioUrl }, 202 and nothing else.
- LYRIC_LANGUAGE_V1 is 'auto' and must stay the same value here as at stitch time — the transcript is cached per language, so warming with 'auto' and stitching with 'en' is two transcriptions and the second one is back on the critical path, which is the thing JET-201 removed.

Assumptions:
- The client is trusted to call this or not. Nothing depends on it: if it is never called, the render's own prefetch runs as it does today, and if that fails too the stitch transcribes inline. Three triggers, each only making the next cheaper.
- No rate limiting beyond your existing auth. The call is idempotent on our side — the cache is keyed on the audio's bytes (D-021) and two concurrent callers for the same audio serialise, the second taking the first's result.
- showLyrics is not known at upload time, so this warms unconditionally. On a render that turns out not to want lyrics we have transcribed a song for nothing: one Whisper run against a 24h cache, which we think is the right side of that trade. Say so on the ticket if you would rather gate it.

The mobile half is filed separately against music-jetkreate-mobile and is one line at the upload site; this ticket is only the server end.

## Plan

1. Nothing to do on our side — POST /api/v1/lyric-transcription already does this and is unchanged. contracts/video-transcription.md describes it as it stands.
2. We will watch the transcript-ready log line on the next live render to confirm it reports cached: true by the time the render starts, which is the measurable outcome.
3. If it does, the ~99s cold load is off every lyrics render for good rather than only when the warming process is the rendering process.

## Reason

Measured: Whisper large-v3 is 99s cold and 6.2s warm. A real 31-clip render spent 318s with 224s of it idle waiting on generation, so there is a large window to hide this in — but only if the warming starts before the render does. Moving the trigger to upload widens that window by minutes and costs about fifteen lines.

## Related files

src/services/render/renderOrchestratorV1.ts (prefetchTranscriptV1, the transcriptions map); src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Uploading a track and then starting a render on it logs the transcript as already cached, and the stitch does no transcription. Not calling the new route leaves the render identical to today. Calling it twice for the same audio runs Whisper once.

## Test steps

—

## Thread
2026-10-27T13:54:51+05:30 aquib N: created ticket, status: - -> open
2026-10-27T14:00:03+05:30 aquib N: status: open -> approved
