---
owner: music-jetkreate-backend
status: stub
---

# /api/users

**stub: needs review** — generated during onboarding by reading `src/routes/index.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/users/one`
- `POST /api/users`
- `PUT /api/users/:id`

## Notes

Same handlers as `/api/auth/users/*`, mounted twice for backward compat. `POST /api/users` is public registration; the rest need auth + signature.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
