---
owner: music-jetkreate-backend
status: stub
---

# /api/jobs

**stub: needs review** — generated during onboarding by reading `src/routes/jobs.routes.ts` and the
mounts in `src/routes/index.ts`. This is a *description*, not a source of truth:
the routes validate with zod schemas that are not yet published as a machine-readable
artifact. Prefer generating one (see contracts/README.md) over growing this file.

## Endpoints

- `POST /api/jobs/video/text-to-video`
- `POST /api/jobs/video/image-to-video`
- `GET /api/jobs/:jobId/status`
- `GET /api/jobs/:jobId/events`
- `POST /api/jobs/:jobId/cancel`
- `GET /api/jobs/user/history`

## Notes

Async generation jobs. Also mounted at `/api/v1/jobs`. `GET /:jobId/events` is an SSE stream.

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
