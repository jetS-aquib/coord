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

There is no resolution, orientation or aspect field on any of these requests,
and `extra="forbid"` means sending one is rejected rather than ignored. The
frame is decided from the clips you send (JET-196):

- `clip-stitching` — always `1280x720@24`, whatever the clips are.
- `clip-stitching-with-audio` and `clip-stitching-with-lyrics` — `1920x1080@30`.

**Portrait output is opt-in and off by default.** With `ENABLE_PORTRAIT_OUTPUT=true`
on the deployment, those two workflows instead produce `1080x1920@30` when
**more than half** the clips are taller than they are wide; a tie, square clips,
and clips whose dimensions could not be read still give landscape. Off — which
is every deployment until someone sets it — the frame is landscape whatever the
clips are, exactly as it has always been.

It is a deployment flag, not a request field: turn it on once the players and
any downstream compositing on that deployment are known to handle a non-16:9
file.

Clips that do not match the chosen frame are still scaled down and padded into
it, so a stray landscape clip in a portrait set is letterboxed rather than
cropped. Captions follow the frame; nothing about a caption request changes.

## Notes

Shapes are not documented yet. The owner fills these in; everyone else reads.

Auth is the inbound half of JET-155: an HS256 assertion minted per request by the
creator API (`iss: jetkreate-creator-api`, `aud: video-service`), signed with
`SERVICE_ASSERTION_SECRET`, `exp - iat` ≤ 60s, `jti` single-use for 10 minutes.
The attempt and owning workspace come from the claims, never from the request body.
