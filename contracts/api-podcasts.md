---
owner: music-jetkreate-backend
status: stub
---

# /api/podcasts

**stub: needs review** — generated during onboarding by reading `src/modules/podcast/podcast.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/podcasts/user/:userId`
- `GET /api/podcasts/:id`
- `POST /api/podcasts`
- `PUT /api/podcasts/:id`
- `DELETE /api/podcasts/:id`
- `POST /api/podcasts/generate`
- `POST /api/podcasts/expand`
- `POST /api/podcasts/generate-script`
- `POST /api/podcasts/generate-audio`

## Notes

Also mounted at `/api/v1/podcasts`.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
