# WorkflowType

> God node · 23 connections · `app/core/workflows.py`

**Community:** [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md)

## Connections by Relation

### calls
- main() `EXTRACTED`

### contains
- workflows.py `EXTRACTED`

### imports
- stitch_pipeline.py `EXTRACTED`
- job_service.py `EXTRACTED`
- lyrics_stitching.py `EXTRACTED`
- audio_stitching.py `EXTRACTED`
- clip_stitching.py `EXTRACTED`
- video_service.py `EXTRACTED`
- test_workflow_schemas.py `EXTRACTED`
- run_pipeline.py `EXTRACTED`

### inherits
- Enum `EXTRACTED`
- str `EXTRACTED`

### references
- .prepare_and_submit() `EXTRACTED`
- .submit_workflow() `EXTRACTED`
- .__init__() `EXTRACTED`
- .create_job() `EXTRACTED`

### uses
- [StitchPipeline](StitchPipeline.md) `INFERRED`
- JobService `INFERRED`
- process_video_job() `INFERRED`
- clip_stitching_with_lyrics() `INFERRED`
- clip_stitching_with_audio() `INFERRED`
- clip_stitching() `INFERRED`
- test_workflow_types() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*