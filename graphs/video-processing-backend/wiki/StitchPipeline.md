# StitchPipeline

> God node · 35 connections · `app/pipeline/stitch_pipeline.py`

**Community:** [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md)

## Connections by Relation

### calls
- process_video_job() `EXTRACTED`
- main() `EXTRACTED`
- test_explicit_auto_language_is_not_replaced_by_environment() `EXTRACTED`
- test_omitted_language_still_uses_environment_setting() `EXTRACTED`

### contains
- stitch_pipeline.py `EXTRACTED`

### imports
- video_service.py `EXTRACTED`
- test_pipeline_defaults.py `EXTRACTED`
- run_pipeline.py `EXTRACTED`

### method
- ._run_impl() `EXTRACTED`
- ._progress() `EXTRACTED`
- ._time_phase() `EXTRACTED`
- .render_final() `EXTRACTED`
- .transition() `EXTRACTED`
- .__init__() `EXTRACTED`
- .similarity() `EXTRACTED`
- .render_transitions() `EXTRACTED`
- .extract_lyrics() `EXTRACTED`
- .analyze() `EXTRACTED`
- .process_captions() `EXTRACTED`
- .generate_captions() `EXTRACTED`
- ._log_timing() `EXTRACTED`
- .run() `EXTRACTED`
- .get_ordered_clips() `EXTRACTED`
- .resolve_audio_file() `EXTRACTED`
- .natural_sort_key() `EXTRACTED`
- ._load_whisper_model() `EXTRACTED`

### uses
- [CaptionStyleRenderer](CaptionStyleRenderer.md) `INFERRED`
- [FFmpegEngine](FFmpegEngine.md) `INFERRED`
- [CaptionProcessor](CaptionProcessor.md) `INFERRED`
- [LyricExtractor](LyricExtractor.md) `INFERRED`
- [WorkflowType](WorkflowType.md) `INFERRED`
- CaptionGenerator `INFERRED`
- TransitionEngine `INFERRED`
- SimilarityEngine `INFERRED`
- WhisperModelManager `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*