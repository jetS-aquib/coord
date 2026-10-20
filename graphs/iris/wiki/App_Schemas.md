# App Schemas

> 83 nodes

## Key Concepts

- **job_service.py** (34 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **WorkflowType** (23 connections) — `apps/iris/services/video-processing/app/core/workflows.py`
- **JobService** (20 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **ServiceContext** (17 connections) — `apps/iris/services/video-processing/app/core/service_assertion.py`
- **schemas/jobs.py** (17 connections) — `apps/iris/services/video-processing/app/schemas/jobs.py`
- **service_assertion.py** (16 connections) — `apps/iris/services/video-processing/app/core/service_assertion.py`
- **JobResponse** (13 connections) — `apps/iris/services/video-processing/app/schemas/jobs.py`
- **.prepare_and_submit()** (13 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **audio_stitching.py** (12 connections) — `apps/iris/services/video-processing/app/api/v1/routes/audio_stitching.py`
- **clip_stitching.py** (12 connections) — `apps/iris/services/video-processing/app/api/v1/routes/clip_stitching.py`
- **routes/jobs.py** (12 connections) — `apps/iris/services/video-processing/app/api/v1/routes/jobs.py`
- **lyrics_stitching.py** (12 connections) — `apps/iris/services/video-processing/app/api/v1/routes/lyrics_stitching.py`
- **BaseJobRequest** (10 connections) — `apps/iris/services/video-processing/app/schemas/jobs.py`
- **workflows.py** (10 connections) — `apps/iris/services/video-processing/app/core/workflows.py`
- **FastAPI** (10 connections)
- **._run_and_cleanup()** (9 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **.submit_workflow()** (9 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **require_service_assertion()** (8 connections) — `apps/iris/services/video-processing/app/core/service_assertion.py`
- **verify_service_assertion()** (8 connections) — `apps/iris/services/video-processing/app/core/service_assertion.py`
- **download_file()** (8 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/downloader.py`
- **ClipInput** (7 connections) — `apps/iris/services/video-processing/app/schemas/jobs.py`
- **LyricsStitchingRequest** (7 connections) — `apps/iris/services/video-processing/app/schemas/jobs.py`
- **router.py** (7 connections) — `apps/iris/services/video-processing/app/api/v1/router.py`
- **main.py** (7 connections) — `apps/iris/services/video-processing/app/main.py`
- **clip_stitching_with_audio()** (6 connections) — `apps/iris/services/video-processing/app/api/v1/routes/audio_stitching.py`
- *... and 58 more nodes in this community*

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (29 shared connections)
- [Infrastructure Jobs](Infrastructure_Jobs.md) (8 shared connections)
- [Infrastructure Callbacks](Infrastructure_Callbacks.md) (7 shared connections)
- [Infrastructure Storage](Infrastructure_Storage.md) (5 shared connections)
- [App Pipeline](App_Pipeline.md) (4 shared connections)
- [Lipsync Worker](Lipsync_Worker.md) (3 shared connections)
- [Lipsync Host](Lipsync_Host.md) (3 shared connections)
- [App Core](App_Core.md) (2 shared connections)
- [Scripts Brand](Scripts_Brand.md) (2 shared connections)
- [Film Page And Camera](Film_Page_And_Camera.md) (1 shared connections)
- [Lyrics Effects](Lyrics_Effects.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/api/v1/router.py`
- `apps/iris/services/video-processing/app/api/v1/routes/audio_stitching.py`
- `apps/iris/services/video-processing/app/api/v1/routes/clip_stitching.py`
- `apps/iris/services/video-processing/app/api/v1/routes/health.py`
- `apps/iris/services/video-processing/app/api/v1/routes/jobs.py`
- `apps/iris/services/video-processing/app/api/v1/routes/lyrics_stitching.py`
- `apps/iris/services/video-processing/app/core/service_assertion.py`
- `apps/iris/services/video-processing/app/core/workflows.py`
- `apps/iris/services/video-processing/app/infrastructure/storage/downloader.py`
- `apps/iris/services/video-processing/app/main.py`
- `apps/iris/services/video-processing/app/processors/analysis/metadata.py`
- `apps/iris/services/video-processing/app/schemas/jobs.py`
- `apps/iris/services/video-processing/app/services/job_service.py`

## Audit Trail

- EXTRACTED: 228 (86%)
- INFERRED: 36 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*