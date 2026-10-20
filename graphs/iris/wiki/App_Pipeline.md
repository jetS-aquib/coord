# App Pipeline

> 40 nodes

## Key Concepts

- **StitchPipeline** (28 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **._run_impl()** (15 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **TransitionEngine** (11 connections) — `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- **SimilarityEngine** (10 connections) — `apps/iris/services/video-processing/app/processors/similarity/similarity_engine.py`
- **._progress()** (10 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **TransitionSelector** (9 connections) — `apps/iris/services/video-processing/app/processors/transitions/selector/transition_selector.py`
- **.render_final()** (8 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.transition()** (7 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **run_pipeline.py** (7 connections) — `apps/iris/services/video-processing/scripts/run_pipeline.py`
- **.similarity()** (6 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.extract_lyrics()** (5 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.generate_captions()** (5 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.process_captions()** (5 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.render_transitions()** (5 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.analyze()** (4 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.run()** (4 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.select()** (4 connections) — `apps/iris/services/video-processing/app/processors/transitions/selector/transition_selector.py`
- **main()** (4 connections) — `apps/iris/services/video-processing/scripts/run_pipeline.py`
- **.get_ordered_clips()** (3 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.resolve_audio_file()** (3 connections) — `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- **.run()** (3 connections) — `apps/iris/services/video-processing/app/processors/similarity/similarity_engine.py`
- **._calculate_duration()** (3 connections) — `apps/iris/services/video-processing/app/processors/transitions/selector/transition_selector.py`
- **.__init__()** (3 connections) — `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- **.run()** (3 connections) — `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- **Path** (3 connections)
- *... and 15 more nodes in this community*

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (26 shared connections)
- [Processors Ffmpeg](Processors_Ffmpeg.md) (7 shared connections)
- [App Schemas](App_Schemas.md) (4 shared connections)
- [Scripts Brand](Scripts_Brand.md) (3 shared connections)
- [Lipsync Host](Lipsync_Host.md) (2 shared connections)
- [Lyrics Effects](Lyrics_Effects.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/pipeline/stitch_pipeline.py`
- `apps/iris/services/video-processing/app/processors/similarity/similarity_engine.py`
- `apps/iris/services/video-processing/app/processors/transitions/selector/transition_library.py`
- `apps/iris/services/video-processing/app/processors/transitions/selector/transition_selector.py`
- `apps/iris/services/video-processing/app/processors/transitions/transition_engine.py`
- `apps/iris/services/video-processing/scripts/run_pipeline.py`

## Audit Trail

- EXTRACTED: 96 (80%)
- INFERRED: 24 (20%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*