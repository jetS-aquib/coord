# Lipsync Worker

> 30 nodes

## Key Concepts

- **app.py** (17 connections) — `apps/iris/services/lipsync/worker/app.py`
- **lipsync()** (9 connections) — `apps/iris/services/lipsync/worker/app.py`
- **subprocess** (9 connections)
- **test_app.py** (8 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **shutil** (8 connections)
- **LipsyncNameTests** (6 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **_run_musetalk()** (6 connections) — `apps/iris/services/lipsync/worker/app.py`
- **_run_mock()** (5 connections) — `apps/iris/services/lipsync/worker/app.py`
- **_save_upload()** (5 connections) — `apps/iris/services/lipsync/worker/app.py`
- **.request()** (4 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **.test_upload_filenames_cannot_change_internal_paths_or_overwrite_each_other()** (4 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **tempfile** (4 connections)
- **health()** (3 connections) — `apps/iris/services/lipsync/worker/app.py`
- **.test_safe_names_return_an_output_inside_the_job_directory()** (3 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **Path** (3 connections)
- **_upload_suffix()** (2 connections) — `apps/iris/services/lipsync/worker/app.py`
- **write_output()** (2 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **.test_unsafe_names_are_rejected_before_writing_or_running_the_engine()** (2 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **UploadFile** (2 connections)
- **fastapi_responses** (2 connections)
- **.setUp()** (1 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **write_output()** (1 connections) — `apps/iris/services/lipsync/worker/test_app.py`
- **get** (1 connections)
- **post** (1 connections)
- **FileResponse** (1 connections)
- *... and 5 more nodes in this community*

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (7 shared connections)
- [Lipsync Host](Lipsync_Host.md) (4 shared connections)
- [Lyrics Effects](Lyrics_Effects.md) (4 shared connections)
- [App Schemas](App_Schemas.md) (3 shared connections)
- [Infrastructure Callbacks](Infrastructure_Callbacks.md) (2 shared connections)

## Source Files

- `apps/iris/services/lipsync/worker/app.py`
- `apps/iris/services/lipsync/worker/test_app.py`

## Audit Trail

- EXTRACTED: 65 (97%)
- INFERRED: 2 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*