---
id: JET-255
title: One failed poll ('fetch failed') abandons a render that is still running, so a finished 12-minute stitch is thrown away
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-05T13:51:47+05:30
updated: 2026-11-05T13:51:47+05:30
decisions: 
---

## Request

In waitForCompletion, retry a failed getJob (network error, 5xx, timeout) instead of throwing, and keep waiting until the job settles or the 30 minute ceiling.

## Understanding

I read this as: a single failed poll must not fail the render. Assumptions: (1) the video job is authoritative and keeps running independent of the poll, per contracts/video-jobs.md; (2) 'fetch failed' is a transport error from getJob, not a failed job status (the video logs show no error on that job); (3) I cannot see why the request failed (the video-service log window starts at 08:08, after the failure), so this fixes the symptom, not the network cause.

## Plan

1. In waitForCompletion, catch errors from getJob that are transport errors, timeouts or 5xx; count consecutive failures, log each, and continue the loop after the normal poll interval.
2. Give up only after N consecutive failures (suggest 8 at 15s, about 2 minutes) or at the existing 30 minute ceiling; treat 4xx (401/403/404) as real and throw at once.
3. On giving up, throw with the last error so the render still fails loudly.
4. One small test: a getJob that rejects twice then returns completed resolves.

## Reason

Logs 2026-11-05: job 2fe30140... (45 clips, one stitch) was running fine at 07:55:30; at 07:58:23 the music backend logged '[RenderV1] mvr_1793863103951_412b9466 failed: fetch failed' and gave up. The video service kept encoding and finished about 08:03:35 (about 12 minutes), then POSTed its callback, which got 404 because nobody was waiting. The user restarted and re-did the stitch (19 v2 segments). getJob has no retry on a transport error, so one dropped request on a CPU-saturated shared VM loses the whole wait.

## Related files

src/modules/video/video-api.service.ts

## Acceptance criteria

A render survives up to 7 consecutive failed polls; a job that really failed or was cancelled still rejects immediately; a 404/401 on the poll still throws at once.

## Test steps

—

## Thread
2026-11-05T13:51:47+05:30 aquib N: created ticket, status: - -> open
