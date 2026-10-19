---
owner: music-jetkreate-backend
status: stub
---

# /api/music-videos

**stub: needs review** — generated during onboarding by reading `src/modules/musicVideo/musicVideo.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/music-videos`
- `GET /api/music-videos/:id`
- `POST /api/music-videos`
- `DELETE /api/music-videos/:id`

## Notes

Also mounted at `/api/v1/music-videos`.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
