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
- `DELETE /api/users/me` (JET-364) — deletes the signed-in account and everything it owns. Auth + signature, no body.
  The access token must be under 5 minutes old: refresh first (`POST /api/auth/refresh`), then call.
  - `200 { success: true }` — gone; every token for it now gets 401. Sign out locally.
  - `401 { code: 'REAUTH_REQUIRED' }` — token older than 5 minutes; refresh and retry once.
  - `401 { code: 'INVALID_TOKEN' }` — already deleted, or a bad token.

## Notes

Same handlers as `/api/auth/users/*`, mounted twice for backward compat. `POST /api/users` is public registration; the rest need auth + signature.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
