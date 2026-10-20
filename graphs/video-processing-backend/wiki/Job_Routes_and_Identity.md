# Job Routes and Identity

> 23 nodes

## Key Concepts

- **service_assertion.py** (18 connections) — `app/core/service_assertion.py`
- **ServiceContext** (17 connections) — `app/core/service_assertion.py`
- **JobResponse** (13 connections) — `app/schemas/jobs.py`
- **audio_stitching.py** (12 connections) — `app/api/v1/routes/audio_stitching.py`
- **clip_stitching.py** (12 connections) — `app/api/v1/routes/clip_stitching.py`
- **routes/jobs.py** (12 connections) — `app/api/v1/routes/jobs.py`
- **FastAPI** (9 connections)
- **require_service_assertion()** (8 connections) — `app/core/service_assertion.py`
- **verify_service_assertion()** (8 connections) — `app/core/service_assertion.py`
- **router.py** (7 connections) — `app/api/v1/router.py`
- **clip_stitching_with_audio()** (6 connections) — `app/api/v1/routes/audio_stitching.py`
- **get_job()** (5 connections) — `app/api/v1/routes/jobs.py`
- **_owned_state()** (5 connections) — `app/api/v1/routes/jobs.py`
- **get_result()** (4 connections) — `app/api/v1/routes/jobs.py`
- **_unauthorized()** (3 connections) — `app/core/service_assertion.py`
- **get** (2 connections)
- **HTTPException** (1 connections)
- **The job, if this caller owns it. A job id is guessable, so a job belonging to…** (1 connections) — `app/api/v1/routes/jobs.py`
- **Service identity on the job endpoints — JET-155. The job endpoints had no…** (1 connections) — `app/core/service_assertion.py`
- **Verifies an assertion and returns the work's owner context. Pure apart from the…** (1 connections) — `app/core/service_assertion.py`
- **FastAPI dependency. Every job endpoint depends on it.** (1 connections) — `app/core/service_assertion.py`
- **Who this work belongs to, as the assertion states it.** (1 connections) — `app/core/service_assertion.py`
- **fastapi_responses** (1 connections)

## Relationships

- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (13 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (8 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (7 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (4 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (4 shared connections)
- [Workflow Request Schemas](Workflow_Request_Schemas.md) (3 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (3 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (2 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (2 shared connections)
- [Assertion Replay Cache](Assertion_Replay_Cache.md) (2 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (1 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (1 shared connections)

## Source Files

- `app/api/v1/router.py`
- `app/api/v1/routes/audio_stitching.py`
- `app/api/v1/routes/clip_stitching.py`
- `app/api/v1/routes/jobs.py`
- `app/core/service_assertion.py`
- `app/schemas/jobs.py`

## Audit Trail

- EXTRACTED: 85 (86%)
- INFERRED: 14 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*