---
title: video-processing-backend is in the same Mongo as music-jetkreate-backend
added: 2026-10-27
updated: 2026-10-27
by: aquib N
---

It reads MONGO_URI — the same connection string, the same database server — and keeps its job records in a collection of its own, video_jobs: status, stage, output URL, measurement, and the attempt-to-job mapping that stops a retried dispatch rendering twice. Two indexes: a partial unique index on attempt_id (partial because a segment job has no attempt), and a TTL index on expires_at, JOB_RETENTION_DAYS days.

Nothing on the Node side reads or writes that collection, and it should stay that way — the moment it does, it is a second contract between the two repos instead of one service's implementation detail. Job state is still read over /api/v1/jobs, which video-processing-backend owns.

Unset MONGO_URI and it falls back to JSON files under STORAGE_ROOT, which is what it did before and what the test suite still does. D-025.
