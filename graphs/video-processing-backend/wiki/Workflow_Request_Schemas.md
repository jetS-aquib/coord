# Workflow Request Schemas

> 13 nodes

## Key Concepts

- **test_workflow_schemas.py** (11 connections) — `tests/test_workflow_schemas.py`
- **BaseJobRequest** (10 connections) — `app/schemas/jobs.py`
- **AudioStitchingRequest** (7 connections) — `app/schemas/jobs.py`
- **ClipStitchingRequest** (7 connections) — `app/schemas/jobs.py`
- **.validate_quality()** (2 connections) — `app/schemas/jobs.py`
- **test_api_1_does_not_require_audio()** (2 connections) — `tests/test_workflow_schemas.py`
- **test_api_2_requires_audio()** (2 connections) — `tests/test_workflow_schemas.py`
- **test_api_3_defaults_to_requested_lyrics_options()** (2 connections) — `tests/test_workflow_schemas.py`
- **test_api_3_supports_lyrics_options()** (2 connections) — `tests/test_workflow_schemas.py`
- **test_workflow_types()** (2 connections) — `tests/test_workflow_schemas.py`
- **A bounded work spec. `extra="forbid"` is deliberate (JET-155): the attempt and…** (1 connections) — `app/schemas/jobs.py`
- **Workflow #1: ordered clip URLs + transitions.** (1 connections) — `app/schemas/jobs.py`
- **Workflow #2: ordered clip URLs + transitions + master audio URL.** (1 connections) — `app/schemas/jobs.py`

## Relationships

- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (5 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (5 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (4 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (3 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (2 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (1 shared connections)

## Source Files

- `app/schemas/jobs.py`
- `tests/test_workflow_schemas.py`

## Audit Trail

- EXTRACTED: 31 (89%)
- INFERRED: 4 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*