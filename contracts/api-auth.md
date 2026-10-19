---
owner: music-jetkreate-backend
status: stub
---

# /api/auth

**stub: needs review** — generated during onboarding by reading `src/modules/auth/auth.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `POST /api/auth/google`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/firebase-verify`
- `GET /api/auth/users/one`
- `POST /api/auth/users`
- `PUT /api/auth/users/:id`

## Notes

Public — these handle their own auth. Also re-exposed at `/api/users/*`.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
