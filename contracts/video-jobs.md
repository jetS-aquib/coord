---
owner: video-processing-backend
status: stub
---

# /api/v1/jobs

**stub: needs review** — generated during onboarding from route scanning
(`app/api/v1/routes/jobs.py`).

Job state is the authoritative record of a render. Callers settle by polling it —
the finish callback is a latency optimisation and is allowed to be lost.

## Endpoints

- `GET /api/v1/jobs/{job_id}` — job state and the measurement stored for it.
- `GET /api/v1/jobs/{job_id}/result` — the finished artifact for a completed job.

## Notes

Shapes are not documented yet. The owner fills these in; everyone else reads.

Both require `X-Service-Assertion` and return only jobs owned by the workspace in
the claims. There is also an outbound notification (`CREATOR_CALLBACK_URL`,
`iss: jetkreate-video-service`, `aud: creator-billing-internal`) that is off unless
configured; no onboarded repo implements the receiving endpoint yet.
