# Infrastructure Storage

> 14 nodes

## Key Concepts

- **GCSStorage** (12 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **.upload_audio()** (6 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **.upload_video()** (5 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **._audio_content_type()** (3 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **._object_name()** (3 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **.signed_download_url()** (3 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **.__init__()** (3 connections) — `apps/iris/services/video-processing/app/services/job_service.py`
- **Path** (3 connections)
- **.parse_uri()** (2 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **.__init__()** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **Google Cloud Storage adapter for audio inputs and final video artifacts.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **Upload final MP4 to: project_live/video-synthesis/<job_id>/<filename>** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **Generate a temporary signed GET URL for a GCS object.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **Upload downloaded source audio to: project_live/audio/<job_id>/<filename>** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`

## Relationships

- [App Schemas](App_Schemas.md) (5 shared connections)
- [Processors Lyrics](Processors_Lyrics.md) (1 shared connections)
- [Infrastructure Jobs](Infrastructure_Jobs.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- `apps/iris/services/video-processing/app/services/job_service.py`

## Audit Trail

- EXTRACTED: 23 (88%)
- INFERRED: 3 (12%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*