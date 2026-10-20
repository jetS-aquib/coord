# Infrastructure Jobs

> 19 nodes

## Key Concepts

- **JobManager** (18 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.create_or_get_job()** (8 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.update()** (8 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **Any** (7 connections)
- **.create_job()** (6 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.get()** (6 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **._state_path()** (5 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **._write()** (5 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **._attempt_path()** (4 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.job_for_attempt()** (4 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **._run()** (4 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **._now()** (3 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.submit()** (3 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **Path** (3 connections)
- **.__init__()** (2 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **.shutdown()** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **Persistent job metadata + in-process worker execution.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **The job this attempt already created, if any.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **Returns ``(job_id, created)`` for an attempt, creating at most one. The creator…** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`

## Relationships

- [App Schemas](App_Schemas.md) (8 shared connections)
- [Infrastructure Storage](Infrastructure_Storage.md) (1 shared connections)
- [Processors Lyrics](Processors_Lyrics.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`

## Audit Trail

- EXTRACTED: 43 (86%)
- INFERRED: 7 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*