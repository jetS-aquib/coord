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
  "text": "pehla line\ndoosra line\n…",   // the lyrics, a line per segment
  "cached": false            // true when another call had already done it
}
```

`language` must be the same value you will send on the stitch call. A
different language is a different transcript and will be transcribed again.

## You get the words. You do not get the word timings.

`text` is the lyrics, one line per transcribed segment, newline separated
(JET-211). It needs no request field — it is always there, because a flag
would be a field every caller sets to the same value forever to guard against
a few kilobytes. A 475-word song is about 3 KB.

It is the **corrected** text, the same string the captions are burnt from, so
what you write a storyboard against and what the viewer reads are the same
words. Empty for an instrumental, or when transcription found nothing — that
is normal and not an error.

The **word timings** still stay here, and for the original reason: you do not
render captions, this service does on the stitch call that follows, so every
word's start and end would be a megabyte nobody reads. If you need timed
lines for cut planning, `POST /api/v1/song-read` already returns them — its
sections carry `lines` with `start`, `end` and `text`, snapped to the bar grid
(JET-206, contracts/video-song-read.md). Ask there rather than here.

A cached call returns `text` exactly as a fresh one does. The summary is
computed from the transcript and the cache holds the transcript, so there is
nothing for a hit to be missing.

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
reconfigured and no caller has to opt in or out. `LYRIC_ENGINE` is one of
those settings, so switching engines cannot serve you a transcript the other
one made either.

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

## Which engine transcribes

Whisper, unless the deployment sets `LYRIC_ENGINE=gemini` (JET-235, D-059).
**Nothing in the response shape depends on this** — the Gemini path produces
the transcript through the same extraction, the same cleaning and the same
Devanagari transliteration, so every field here means what it meant, and
`language` is still a BCP-47-ish code and still `"unknown"` for an
instrumental.

Two things are worth knowing if you are debugging a deployment that has it on:

- It is a network call to a model this service does not host. Any failure —
  no key, a 5xx, a timeout, audio too large — logs and **falls back to
  Whisper** rather than failing. So a slow answer may be a Gemini call that
  timed out and a Whisper transcription behind it.
- `LYRIC_MIN_WORD_PROBABILITY` does nothing on that path, because Gemini
  reports no per-word confidence. Words come back with a null `probability`
  and every one of them is kept.

Why anyone would: measured on a 256s track, the Whisper path is 201.8s
(66.3s Demucs, 6.5s model load — 99s cold — and 135.4s decoding) against
12-45s, and it reads the words considerably better. Whisper hallucinated
`"Thank you."` over an instrumental intro and returned "Ever since I was a
chick" for "Ever since I was a jit"; Gemini returned nothing over the intro
and the real line. Sections are read from these words, so this lands in
`/api/v1/song-read` too.

## The same bytes give the same words

Byte-identical audio transcribes to an identical transcript, cache or no cache
(JET-215, D-035). It did not before. `WHISPER_TEMPERATURE_FALLBACK` used to
default on, which re-decodes a window that fails a confidence or repetition
check at temperature 0.2-1.0 — and every decode above temperature 0 is a
random sample, from a CTranslate2 sampler that is seeded per thread from the
system random device and cannot be re-seeded afterwards. Sung lyrics trip the
repetition check constantly, so the same line came back as different words
between runs. It is off now: beam search only.

Nothing in the response shape changes, and nothing you send changes. What
changes is that a window Whisper decodes badly is kept as decoded rather than
re-rolled, and that a re-render of unchanged audio is the same render. This is
also what makes `/api/v1/song-read`'s sections stable, since they are read
from these words.

**On `LYRIC_ENGINE=gemini` this promise is weaker, and deliberately so.** The
call pins `temperature: 0.0`, which is what makes it reproducible at all —
without it the same bytes came back as 498 words, then 428, then 428, which is
the same failure in a different engine. But the model runs on Google's
machines under an unpinned name, so if they change it the transcript changes
with no `APP_VERSION` and no `read_version` moving to tell you. Within a
deployment and a cache lifetime you still get the same words; across a
silent upstream model update you may not. D-059 records that trade.


## Notes

The endpoint runs the stitch's own transcription phase, not a second copy of
it. That is deliberate: a cached transcript is handed to the caption burn
exactly as a fresh one would be, so the two could not be allowed to decide
the model, the language handling or the preprocessing separately.
