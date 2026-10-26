---
owner: video-processing-backend
status: active
---

# /api/v1/lyric-transcription

Written for JET-201, so a render can start transcribing when it starts
instead of when its clips are finished. These are the shapes — you should
not have to read the Python to call them.

Whisper needs nothing but the audio, and the audio exists minutes before the
first clip does. Called at `startRenderV1`, this runs inside the generation
window and the `clip-stitching-with-lyrics` call at the end finds the
transcript already made: no 99s model load and no transcription on the
critical path.

**Synchronous**, like the frame endpoints: there is one of these per song
and you fire it without awaiting, so a job id and a poll would be two more
round trips for nothing. It answers when the transcription is done — around
a minute and a half on a cold process, seconds on a warm one.

Requires `X-Service-Assertion`, minted exactly as for stitching
(`iss: jetkreate-creator-api`, `aud: video-service`, HS256, `exp - iat` ≤ 60s,
`jti` single-use for ten minutes). The body is `extra="forbid"`: a field not
listed here is a 422, never ignored.

## `POST /api/v1/lyric-transcription`

```jsonc
// request
{ "audioUrl": "https://…/song.mp3", "language": "auto" }   // or "hi", "en", …

// 200
{
  "language": "hi",          // what Whisper detected
  "segments": 43,
  "words": 318,
  "duration_seconds": 211.4,
  "cached": false            // true when another call had already done it
}
```

`language` must be the same value you will send on the stitch call. A
different language is a different transcript and will be transcribed again.

The transcript itself stays here. You do not render captions — this service
does, on the stitch call that follows — so sending back every word timing
would be a megabyte nobody reads.

## You pass nothing extra to the stitch

There is no transcript id. The cache is keyed on **the audio's bytes**, so
`clip-stitching-with-lyrics` finds the transcript by downloading the same
audio it was going to download anyway. Your stitch request does not change
at all.

Keyed on bytes rather than the URL because your URLs are signed: the same
song re-signed an hour later is a different string and would miss a
URL-keyed cache every time. It also means a re-render of an unchanged song
is free, and a song whose audio was edited is correctly a miss.

The key also carries the whole transcription configuration — every
`WHISPER_*` and `LYRIC_*` setting on the deployment, plus `APP_VERSION` —
read from the settings themselves rather than a list somebody maintains. A
deployment that retunes Whisper, or a release that changes how it works,
therefore cannot be handed a transcript made the old way. Nothing has to be
reconfigured and no caller has to opt in or out.

Entries live 24 hours, and the most recent 64 are kept. Both are far more
than a render needs; nothing in your flow should depend on either.

## Failing is free

If this call fails, times out, or you never make it, the stitch transcribes
inline exactly as it does today. Nothing in the current path changes.

So: fire it unawaited behind `showLyrics`, await it with a catch immediately
before the stitch, and ignore the result. Even a dropped connection costs
nothing — the transcript is written to the cache before the response is
sent, so the work survives the answer being lost.

Two callers asking for the same audio at once is also safe: the second one
waits for the first and takes its result rather than running Whisper twice.

## Notes

The endpoint runs the stitch's own transcription phase, not a second copy of
it. That is deliberate: a cached transcript is handed to the caption burn
exactly as a fresh one would be, so the two could not be allowed to decide
the model, the language handling or the preprocessing separately.
