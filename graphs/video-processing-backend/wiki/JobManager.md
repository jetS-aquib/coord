# JobManager

> God node · 23 connections · `app/infrastructure/jobs/manager.py`

**Community:** [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md)

## Connections by Relation

### calls
- test_completed_job_persists_gcs_url() `EXTRACTED`
- test_local_output_cannot_complete_job() `EXTRACTED`
- .__init__() `EXTRACTED`

### contains
- manager.py `EXTRACTED`

### imports
- job_service.py `EXTRACTED`
- test_service_assertion.py `EXTRACTED`
- test_job_manager.py `EXTRACTED`

### method
- .get() `EXTRACTED`
- .update() `EXTRACTED`
- .create_job() `EXTRACTED`
- .create_or_get_job() `EXTRACTED`
- ._run() `EXTRACTED`
- ._write() `EXTRACTED`
- ._state_path() `EXTRACTED`
- ._attempt_path() `EXTRACTED`
- .job_for_attempt() `EXTRACTED`
- .submit() `EXTRACTED`
- ._now() `EXTRACTED`
- .__init__() `EXTRACTED`
- .shutdown() `EXTRACTED`

### rationale_for
- Persistent job metadata + in-process worker execution. `EXTRACTED`

### uses
- JobService `INFERRED`
- configured() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*