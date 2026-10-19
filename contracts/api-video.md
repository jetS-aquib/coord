---
owner: music-jetkreate-backend
status: stub
---

# /api/video

**stub: needs review** — generated during onboarding by reading `src/modules/video/video.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/video/download`
- `POST /api/video/synthesize`
- `POST /api/video/generate-clip`
- `POST /api/video/stitch`
- `POST /api/video/extract-frame`
- `POST /api/video/upload-audio`
- `POST /api/video/merge-audio-ref`
- `POST /api/video/generate-from-prompt`
- `POST /api/video/music-storyboard`
- `POST /api/video/assemble-music-video`
- `POST /api/video/caption-preview`

## Notes

`GET /api/video/download` is public (browser navigations carry no JWT). Everything else needs auth + signature.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
