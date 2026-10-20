# Job Manager and Workflow Types

> 62 nodes

## Key Concepts

- **WorkflowType** (23 connections) — `app/core/workflows.py`
- **JobManager** (23 connections) — `app/infrastructure/jobs/manager.py`
- **JobService** (23 connections) — `app/services/job_service.py`
- **.prepare_and_submit()** (15 connections) — `app/services/job_service.py`
- **GCSStorage** (12 connections) — `app/infrastructure/storage/gcs.py`
- **._run_and_cleanup()** (10 connections) — `app/services/job_service.py`
- **.submit_workflow()** (9 connections) — `app/services/job_service.py`
- **.create_job()** (8 connections) — `app/infrastructure/jobs/manager.py`
- **.create_or_get_job()** (8 connections) — `app/infrastructure/jobs/manager.py`
- **.get()** (8 connections) — `app/infrastructure/jobs/manager.py`
- **.update()** (8 connections) — `app/infrastructure/jobs/manager.py`
- **ClipInput** (7 connections) — `app/schemas/jobs.py`
- **Any** (7 connections)
- **._run()** (6 connections) — `app/infrastructure/jobs/manager.py`
- **download_file()** (6 connections) — `app/infrastructure/storage/downloader.py`
- **.upload_audio()** (6 connections) — `app/infrastructure/storage/gcs.py`
- **._download_clips()** (6 connections) — `app/services/job_service.py`
- **._measure()** (6 connections) — `app/services/job_service.py`
- **._state_path()** (5 connections) — `app/infrastructure/jobs/manager.py`
- **._write()** (5 connections) — `app/infrastructure/jobs/manager.py`
- **.upload_video()** (5 connections) — `app/infrastructure/storage/gcs.py`
- **._download_audio()** (5 connections) — `app/services/job_service.py`
- **._log_timing()** (5 connections) — `app/services/job_service.py`
- **test_completed_job_persists_gcs_url()** (5 connections) — `tests/test_job_manager.py`
- **test_local_output_cannot_complete_job()** (5 connections) — `tests/test_job_manager.py`
- *... and 37 more nodes in this community*

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (17 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (7 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (4 shared connections)
- [Workflow Request Schemas](Workflow_Request_Schemas.md) (4 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (3 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (2 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (2 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (1 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (1 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (1 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)
- [Clip Visual Analysis](Clip_Visual_Analysis.md) (1 shared connections)

## Source Files

- `app/core/workflows.py`
- `app/infrastructure/jobs/manager.py`
- `app/infrastructure/storage/downloader.py`
- `app/infrastructure/storage/gcs.py`
- `app/schemas/jobs.py`
- `app/services/job_service.py`
- `tests/test_job_manager.py`

## Audit Trail

- EXTRACTED: 151 (84%)
- INFERRED: 29 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*