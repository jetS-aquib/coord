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

## Notes

Shapes are not documented yet. The owner fills these in; everyone else reads.

Auth is the inbound half of JET-155: an HS256 assertion minted per request by the
creator API (`iss: jetkreate-creator-api`, `aud: video-service`), signed with
`SERVICE_ASSERTION_SECRET`, `exp - iat` ≤ 60s, `jti` single-use for 10 minutes.
The attempt and owning workspace come from the claims, never from the request body.
