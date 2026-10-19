---
owner: music-jetkreate-backend
status: stub
---

# /api/user-settings

**stub: needs review** — generated during onboarding by reading `src/routes/user-settings.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `GET /api/user-settings/:userId`
- `PUT /api/user-settings/:userId`

## Notes

Per-user model preferences; reads the registry in `src/config/aiModels.ts`.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
