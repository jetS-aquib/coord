# Infrastructure Callbacks

> 16 nodes

## Key Concepts

- **creator.py** (12 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **report_in_background()** (7 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **post_measurement()** (6 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **sign_callback_assertion()** (6 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **threading** (5 connections)
- **uuid** (5 connections)
- **whisper_model_manager.py** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`
- **httpx** (4 connections)
- **jwt** (4 connections)
- **Any** (2 connections)
- **Reporting a finished job's measurement back to the creator API — JET-155. Two…** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **Fires the callback off the worker thread, so a render never waits on it.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **Mints the assertion that proves this callback came from this service.** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **Delivers one job's outcome. Returns whether it was accepted. Keyed by…** (1 connections) — `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- **faster_whisper** (1 connections)
- **logging** (1 connections)

## Relationships

- [App Schemas](App_Schemas.md) (7 shared connections)
- [Processors Lyrics](Processors_Lyrics.md) (6 shared connections)
- [Lipsync Worker](Lipsync_Worker.md) (2 shared connections)
- [Film Page And Camera](Film_Page_And_Camera.md) (1 shared connections)
- [Lipsync Host](Lipsync_Host.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/infrastructure/callbacks/creator.py`
- `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`

## Audit Trail

- EXTRACTED: 38 (97%)
- INFERRED: 1 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*