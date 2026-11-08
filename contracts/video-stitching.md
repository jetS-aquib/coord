---
owner: video-processing-backend
status: stub
---

# /api/v1/clip-stitching

**stub: needs review** — generated during onboarding from route scanning
(`app/api/v1/routes/clip_stitching.py`, `audio_stitching.py`, `lyrics_stitching.py`).

The three ordered-video workflows. Each takes remote HTTP(S)/GCS download URLs as
inputs, returns `202` with a job id, and is settled by polling `video-jobs`.
All three require the `X-Service-Assertion` header (see Notes).

## Endpoints

- `POST /api/v1/clip-stitching` — ordered clip URLs → transitioned MP4, no master audio.
- `POST /api/v1/clip-stitching-with-audio` — ordered clip URLs + one `audio_url` → transitioned MP4 with master audio.
- `POST /api/v1/clip-stitching-with-lyrics` — clip URLs + `audio_url` + optional lyrics/caption settings (`caption_style`, `caption_position`, …) → transitioned MP4 with burnt-in captions.

## Which engine transcribes

`clip-stitching-with-lyrics` takes an optional `lyricEngine`, `"whisper"` or
`"gemini"`. **Absent is `"whisper"`**, so a request made the way it has always
been made transcribes the way it always has (D-061, superseding D-059 — there
is no longer a `LYRIC_ENGINE` on the deployment that could change that under
you). Anything else is a 422.

If you also call `/api/v1/lyric-transcription` or `/api/v1/song-read` for the
song, send the same value on all of them — the engine is part of those caches'
keys, so a mismatch transcribes the song twice. See
contracts/video-transcription.md for what Gemini changes and what it does not.

## The creator's corrected lines

`clip-stitching-with-lyrics` and `segment-concat` (v1 and v2) take an optional
`lyricLines` (or `lyric_lines`): `[{ "start": 21.76, "end": 23.4, "text": "teri walk mein taan hai" }]`
(JET-267). Each entry is a line from `/api/v1/song-read` with its `start` and
`end` **sent back unchanged** and its `text` edited by the creator.

- The burn shows that text on that line, instead of the transcript's words.
  Words the creator left alone keep their sung timing; a changed word takes
  the slot between its neighbours, inside the line's span.
- `"text": ""` removes the line from the video.
- Lines you do not send burn as heard. Absent `lyricLines` is the render you
  get today, byte for byte.
- Text is burnt **as given**, never transliterated: send the `roman` spelling
  the song read returns for Hindi songs (contracts/video-song-read.md).
- A line is found by its start and end, within 0.1 s. One that matches no
  transcript line is still burnt, at its own times.
- `end` before `start` is a 422. The transcript cache is not touched: a
  correction applies to this render only.

## Per-clip in and out points

Each entry of `clips` is `{ "url": ..., "order": ... }` and may also carry
`inSeconds` and `outSeconds` (`in_seconds` / `out_seconds` are accepted too).
They name the part of the clip that is used. JET-207, D-027.

```jsonc
{ "clips": [ { "url": "https://…/clip7.mp4", "order": 1, "outSeconds": 5.217 },
             { "url": "https://…/clip8.mp4", "order": 2, "inSeconds": 0.4 } ] }
```

Why they exist: a cut in a music video lands on the downbeat, and pop is built
in 4- and 8-bar phrases. At 92 BPM a two-bar hold is 5.217 seconds and no video
model generates that — they offer a small set of fixed lengths. So generate at
whatever length the model supports and name the musical length here.

- Seconds from **the clip's own start**, as floats. `outSeconds` is exclusive.
- Both optional and independent: `inSeconds` alone trims the head, `outSeconds`
  alone the tail.
- **Absent means the whole clip, untouched.** A clip with no trim is not
  decoded or re-encoded, so a request that names no trim produces exactly the
  output it always has. This is additive; nothing that calls these endpoints
  today is affected.
- The trim is applied **before** analysis and before the transition, so an
  xfade overlaps the frames that survive, captions sit against the trimmed
  timeline, and a trimmed clip satisfies a seam check at its surviving frames
  rather than the ones that were cut.

Refused rather than clamped:

| | |
|---|---|
| `outSeconds` ≤ `inSeconds`, or either negative | **422** on the request |
| an in point at or past the end of the clip | the **job fails**, naming the clip's real duration |
| an out point past the end by more than 0.05s | the **job fails**, naming the clip's real duration |

The last two cannot be a 422: these endpoints answer with a job id before any
clip is fetched, so the clip's duration is not known when the request is
accepted. 0.05s is a little over one frame at 24fps, and exists because the
caller computes its out point from a bar length in floating point.

Clamping was rejected deliberately. A caller passing a bad number is placing a
cut on a downbeat; quietly giving it a different length moves the cut, which
is the off-beat video the whole feature exists to remove.

## Output frame

`outputFrame` (`output_frame`) is optional on every request here. It names an
**aspect**, not pixels — `"16:9"`, `"9:16"` or `"1:1"` — and anything else is a
422 (JET-232, D-026). Send the aspect your render plan already carries; the
size class belongs to the workflow:

| aspect | `clip-stitching` | the audio and lyrics workflows |
|--------|------------------|--------------------------------|
| `16:9` | `1280x720@24`    | `1920x1080@30`                 |
| `9:16` | `720x1280@24`    | `1080x1920@30`                 |
| `1:1`  | `720x720@24`     | `1080x1080@30`                 |

The named side is the short one, so a shape change never changes the
resolution: `clip-stitching` stays 720p whichever way up it is, because it has
never had resolution selection, and the other two stay 1080p.

**Omit the field and nothing changes.** The frame is then decided from the clips
you send, exactly as it was before the field existed (JET-196): landscape for
everything, unless the deployment sets `ENABLE_PORTRAIT_OUTPUT=true`, in which
case the audio and lyrics workflows give `1080x1920@30` when **more than half**
the clips are taller than they are wide — a tie, square clips, and clips whose
dimensions could not be read still give landscape.

A named frame ignores that flag in both states (D-026 supersedes D-017), so
nothing has to be reconfigured to use it and no later flip of the flag undoes
it. The flag is now only the fallback for callers that cannot name a frame; it
is not deprecated and nothing has to migrate.

Clips that do not match the chosen frame are still scaled down and padded into
it, so a stray landscape clip in a portrait set is letterboxed rather than
cropped. Captions follow the frame — the ASS canvas moves with it, so every font
size, margin and kinetic distance keeps the fraction of the frame it has in
landscape, and nothing about a caption request changes.

## Notes

Shapes are not documented yet. The owner fills these in; everyone else reads.

Auth is the inbound half of JET-155: an HS256 assertion minted per request by the
creator API (`iss: jetkreate-creator-api`, `aud: video-service`), signed with
`SERVICE_ASSERTION_SECRET`, `exp - iat` ≤ 60s, `jti` single-use for 10 minutes.
The attempt and owning workspace come from the claims, never from the request body.
