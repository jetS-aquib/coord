---
owner: music-jetkreate-backend
status: stub
---

# /api/ai

**stub: needs review** — generated during onboarding by reading `src/routes/ai.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/ai/gcs-presign`
- `PUT /api/ai/local-upload`
- `POST /api/ai/generate-scene-image`
- `POST /api/ai/generate-character-image`
- `POST /api/ai/auto-generate-cast`
- `POST /api/ai/transcribe`
- `POST /api/ai/generate-voiceover-script`
- `POST /api/ai/generate-audio`
- `POST /api/ai/pipeline/start-for-idea`
- `POST /api/ai/pipeline/start`
- `GET /api/ai/pipeline/:jobId/core`
- `GET /api/ai/pipeline/:jobId/extra`
- `POST /api/ai/generate-visual-prompts`
- `POST /api/ai/enhance-video-prompt`
- `GET /api/ai/quota/:userId`
- `GET /api/ai/usage-pricing/:userId`

## Notes

`PUT /api/ai/local-upload` is public; all other paths need auth + signature.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
