# Module Wiring and Downloads

> 33 nodes

## Key Concepts

- **stitch_pipeline.py** (42 connections) — `app/pipeline/stitch_pipeline.py`
- **job_service.py** (36 connections) — `app/services/job_service.py`
- **re** (28 connections)
- **pathlib** (24 connections)
- **json** (16 connections)
- **typing** (14 connections)
- **lyric_corrections.py** (13 connections) — `app/processors/lyrics/lyric_corrections.py`
- **video_analyzer.py** (12 connections) — `app/processors/analysis/video_analyzer.py`
- **video_service.py** (11 connections) — `app/services/video_service.py`
- **workflows.py** (10 connections) — `app/core/workflows.py`
- **manager.py** (10 connections) — `app/infrastructure/jobs/manager.py`
- **analyze_all_videos()** (8 connections) — `app/processors/analysis/video_analyzer.py`
- **downloader.py** (8 connections) — `app/infrastructure/storage/downloader.py`
- **gcs.py** (7 connections) — `app/infrastructure/storage/gcs.py`
- **run_pipeline.py** (7 connections) — `scripts/run_pipeline.py`
- **transition_engine.py** (6 connections) — `app/processors/transitions/transition_engine.py`
- **concurrent_futures** (6 connections)
- **shutil** (6 connections)
- **filename_from_url()** (5 connections) — `app/infrastructure/storage/downloader.py`
- **hindi_corrector.py** (5 connections) — `app/processors/lyrics/hindi_corrector.py`
- **_safe_name()** (3 connections) — `app/infrastructure/storage/downloader.py`
- **natural_sort_key()** (3 connections) — `app/processors/analysis/video_analyzer.py`
- **video_filter_builder.py** (3 connections) — `app/processors/ffmpeg/builders/video_filter_builder.py`
- **text_normalizer.py** (3 connections) — `app/processors/lyrics/text_normalizer.py`
- **logging** (3 connections)
- *... and 8 more nodes in this community*

## Relationships

- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (22 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (17 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (15 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (11 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (11 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (10 shared connections)
- [Lyric Corrections Dictionary](Lyric_Corrections_Dictionary.md) (9 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (8 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (8 shared connections)
- [Clip Visual Analysis](Clip_Visual_Analysis.md) (7 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (7 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (5 shared connections)

## Source Files

- `app/core/workflows.py`
- `app/infrastructure/jobs/manager.py`
- `app/infrastructure/storage/downloader.py`
- `app/infrastructure/storage/gcs.py`
- `app/pipeline/stitch_pipeline.py`
- `app/processors/analysis/video_analyzer.py`
- `app/processors/ffmpeg/builders/video_filter_builder.py`
- `app/processors/lyrics/hindi_corrector.py`
- `app/processors/lyrics/lyric_corrections.py`
- `app/processors/lyrics/text_normalizer.py`
- `app/processors/transitions/transition_engine.py`
- `app/services/job_service.py`
- `app/services/video_service.py`
- `scripts/run_pipeline.py`

## Audit Trail

- EXTRACTED: 230 (99%)
- INFERRED: 2 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*