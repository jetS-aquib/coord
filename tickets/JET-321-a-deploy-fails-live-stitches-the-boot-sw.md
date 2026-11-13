---
id: JET-321
title: A deploy fails live stitches: the boot sweep fails every unfinished job in the shared collection and sends no callback
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:31+05:30
updated: 2026-11-13T15:14:28+05:30
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
2026-11-13T15:14:28+05:30 aquib N: status: open -> approved
2026-11-13T15:24:10+05:30 aquib N: Done, uncommitted. Not quite plan step 2: no instance id. A heartbeat replaces it. Every process refreshes alive_at on its own live jobs every 30s (job_service.keep_jobs_alive, a daemon thread started in main.lifespan). The sweep runs at boot and every 30s, and fails only jobs silent > 180s. Two instances on one Mac would share a hostname, so an owner id could not tell them apart. A killed process's jobs are failed within ~3 min of its last beat, by whichever instance is up. Sweep and pre-worker failures now call _report_outcome. Store updates refuse a job already completed/failed (file + Mongo filter). JobManager._run skips running and skips on_settled when the job was already settled. Caveat: during the ONE deploy that ships this, the old instance does not heartbeat, so its jobs are judged by updated_at; one stuck in a stage > 3 min could be swept. Tests: tests/test_queued_forever.py (3 sweep tests), tests/test_mongo_job_store.py; full suite 698 passed.
