# Processors Lyrics

> 50 nodes

## Key Concepts

- **stitch_pipeline.py** (29 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **pathlib** (24 connections)
- **log_timing()** (19 connections) — `apps/iris/services/video-processing/app/core/timing.py`
- **json** (18 connections)
- **zoap_stitch.py** (16 connections) — `apps/iris/services/video-processing/zoap_stitch.py`
- **lyric_extractor.py** (15 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **caption_processor.py** (14 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **re** (14 connections)
- **timing.py** (12 connections) — `apps/iris/services/video-processing/app/core/timing.py`
- **ffmpeg_engine.py** (11 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **video_service.py** (11 connections) — `apps/iris/services/video-processing/app/services/video_service.py`
- **process_video_job()** (10 connections) — `apps/iris/services/video-processing/app/services/video_service.py`
- **typing** (10 connections)
- **manager.py** (9 connections) — `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- **downloader.py** (9 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/downloader.py`
- **log_quality()** (8 connections) — `apps/iris/services/video-processing/app/core/timing.py`
- **transliterator.py** (8 connections) — `apps/iris/services/video-processing/app/processors/lyrics/transliterator.py`
- **filename_from_url()** (7 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/downloader.py`
- **normalize_roman_spelling()** (7 connections) — `apps/iris/services/video-processing/app/processors/lyrics/transliterator.py`
- **main()** (7 connections) — `apps/iris/services/video-processing/zoap_stitch.py`
- **gcs.py** (7 connections) — `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- **caption_generator.py** (7 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **transliterate_hindi()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/transliterator.py`
- **download_clips()** (6 connections) — `apps/iris/services/video-processing/zoap_stitch.py`
- **transition_engine.py** (6 connections) — `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- *... and 25 more nodes in this community*

## Relationships

- [App Schemas](App_Schemas.md) (28 shared connections)
- [Processors Lyrics](Processors_Lyrics.md) (22 shared connections)
- [Lipsync Host](Lipsync_Host.md) (14 shared connections)
- [App Pipeline](App_Pipeline.md) (12 shared connections)
- [Scripts Brand](Scripts_Brand.md) (12 shared connections)
- [Lyrics Effects](Lyrics_Effects.md) (9 shared connections)
- [Lipsync Worker](Lipsync_Worker.md) (7 shared connections)
- [Processors Ffmpeg](Processors_Ffmpeg.md) (5 shared connections)
- [Infrastructure Callbacks](Infrastructure_Callbacks.md) (5 shared connections)
- [Film Page And Camera](Film_Page_And_Camera.md) (1 shared connections)
- [Infrastructure Jobs](Infrastructure_Jobs.md) (1 shared connections)
- [Infrastructure Storage](Infrastructure_Storage.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/core/timing.py`
- `apps/iris/services/video-processing/app/infrastructure/jobs/manager.py`
- `apps/iris/services/video-processing/app/infrastructure/storage/downloader.py`
- `apps/iris/services/video-processing/app/infrastructure/storage/gcs.py`
- `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- `apps/iris/services/video-processing/app/processors/lyrics/transliterator.py`
- `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- `apps/iris/services/video-processing/app/services/video_service.py`
- `apps/iris/services/video-processing/app/workers/video_worker.py`
- `apps/iris/services/video-processing/zoap_stitch.py`

## Audit Trail

- EXTRACTED: 222 (99%)
- INFERRED: 3 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*