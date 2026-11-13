---
id: JET-321
title: A deploy fails live stitches: the boot sweep fails every unfinished job in the shared collection and sends no callback
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-13T13:07:31+05:30
updated: 2026-11-13T13:07:31+05:30
decisions: 
---

## Request

Only fail jobs that are really dead on boot, and tell the caller when you do.

## Understanding

Job state is in Mongo video_jobs when MONGO_URI is set. I assume adding an owner (instance id) and an updated_at heartbeat to each job is acceptable, and that 'dead' = owned by another instance and not updated for N minutes, or owned by this instance's previous boot.

## Plan

1. Write instance_id on create and on each stage update.
2. Boot sweep: fail only jobs with this instance id, or with no update for 15 minutes.
3. Call _report_outcome for jobs failed by the sweep and for pre-worker failures.
4. Make the terminal update conditional on status not already terminal.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 8. job_service.py:250-281 (called from main.py:119) marks every non-terminal job in video_jobs failed, with no owner check. During an overlapping deploy that includes jobs the old instance is still running; the old process later overwrites failed with completed (store update is unguarded). Neither this sweep nor pre-worker failures (job_service.py:567-595) call _report_outcome, so the music backend only learns by polling. Related: JET-246 (queued jobs never reclaimed).

## Related files

app/services/job_service.py, app/infrastructure/jobs/manager.py, app/infrastructure/jobs/mongo_store.py, app/infrastructure/jobs/store.py

## Acceptance criteria

Restarting one instance does not fail a job another instance is running. Every job that ends failed sends a callback.

## Test steps

1. Start a long stitch on instance A.
2. Start instance B against the same Mongo.
3. The job on A still completes and is not marked failed.
4. Kill A mid-job, restart it: the job is failed and the music backend gets a callback.

## Thread
2026-11-13T13:07:31+05:30 aquib N: created ticket, status: - -> open
