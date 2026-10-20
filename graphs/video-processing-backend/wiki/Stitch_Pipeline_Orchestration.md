# Stitch Pipeline Orchestration

> 51 nodes

## Key Concepts

- **StitchPipeline** (35 connections) — `app/pipeline/stitch_pipeline.py`
- **._run_impl()** (16 connections) — `app/pipeline/stitch_pipeline.py`
- **dataclasses** (12 connections)
- **TransitionEngine** (11 connections) — `app/processors/transitions/transition_engine.py`
- **SimilarityEngine** (10 connections) — `app/processors/similarity/similarity_engine.py`
- **._progress()** (10 connections) — `app/pipeline/stitch_pipeline.py`
- **TransitionSelector** (9 connections) — `app/processors/transitions/selector/transition_selector.py`
- **.render_final()** (9 connections) — `app/pipeline/stitch_pipeline.py`
- **._time_phase()** (9 connections) — `app/pipeline/stitch_pipeline.py`
- **process_video_job()** (9 connections) — `app/services/video_service.py`
- **.transition()** (8 connections) — `app/pipeline/stitch_pipeline.py`
- **test_pipeline_defaults.py** (8 connections) — `tests/test_pipeline_defaults.py`
- **.similarity()** (7 connections) — `app/pipeline/stitch_pipeline.py`
- **.extract_lyrics()** (6 connections) — `app/pipeline/stitch_pipeline.py`
- **.render_transitions()** (6 connections) — `app/pipeline/stitch_pipeline.py`
- **.analyze()** (5 connections) — `app/pipeline/stitch_pipeline.py`
- **.generate_captions()** (5 connections) — `app/pipeline/stitch_pipeline.py`
- **.process_captions()** (5 connections) — `app/pipeline/stitch_pipeline.py`
- **._log_timing()** (4 connections) — `app/pipeline/stitch_pipeline.py`
- **.run()** (4 connections) — `app/pipeline/stitch_pipeline.py`
- **.select()** (4 connections) — `app/processors/transitions/selector/transition_selector.py`
- **main()** (4 connections) — `scripts/run_pipeline.py`
- **.get_ordered_clips()** (3 connections) — `app/pipeline/stitch_pipeline.py`
- **.resolve_audio_file()** (3 connections) — `app/pipeline/stitch_pipeline.py`
- **.run()** (3 connections) — `app/processors/similarity/similarity_engine.py`
- *... and 26 more nodes in this community*

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (15 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (8 shared connections)
- [Caption Text Processing](Caption_Text_Processing.md) (8 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (7 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (4 shared connections)
- [Caption Generator and Wrapping](Caption_Generator_and_Wrapping.md) (3 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (2 shared connections)
- [Clip Similarity Scoring](Clip_Similarity_Scoring.md) (2 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (2 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (2 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (1 shared connections)

## Source Files

- `app/core/__init__.py`
- `app/pipeline/__init__.py`
- `app/pipeline/stitch_pipeline.py`
- `app/processors/similarity/similarity_engine.py`
- `app/processors/transitions/selector/transition_library.py`
- `app/processors/transitions/selector/transition_selector.py`
- `app/processors/transitions/transition_engine.py`
- `app/services/video_service.py`
- `app/workers/video_worker.py`
- `scripts/run_pipeline.py`
- `tests/test_pipeline_defaults.py`

## Audit Trail

- EXTRACTED: 132 (84%)
- INFERRED: 26 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*