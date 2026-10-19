---
owner: music-jetkreate-backend
status: stub
---

# /api/elements

**stub: needs review** — generated during onboarding by reading `src/modules/element/element.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `POST /api/elements`
- `GET /api/elements`
- `PUT /api/elements/:id`
- `DELETE /api/elements/:id`

## Notes

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
