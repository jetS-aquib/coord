---
owner: music-jetkreate-backend
status: stub
---

# /api/image

**stub: needs review** — generated during onboarding by reading `src/modules/image/image.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `POST /api/image/generate`

## Notes

Rate-limited by `generationLimit('image')`.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
