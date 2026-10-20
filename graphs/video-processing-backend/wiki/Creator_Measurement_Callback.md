# Creator Measurement Callback

> 13 nodes

## Key Concepts

- **creator.py** (14 connections) — `app/infrastructure/callbacks/creator.py`
- **post_measurement()** (7 connections) — `app/infrastructure/callbacks/creator.py`
- **report_in_background()** (7 connections) — `app/infrastructure/callbacks/creator.py`
- **threading** (7 connections)
- **sign_callback_assertion()** (6 connections) — `app/infrastructure/callbacks/creator.py`
- **jwt** (6 connections)
- **httpx** (4 connections)
- **uuid** (4 connections)
- **Any** (2 connections)
- **Reporting a finished job's measurement back to the creator API — JET-155. Two…** (1 connections) — `app/infrastructure/callbacks/creator.py`
- **Fires the callback off the worker thread, so a render never waits on it.** (1 connections) — `app/infrastructure/callbacks/creator.py`
- **Mints the assertion that proves this callback came from this service.** (1 connections) — `app/infrastructure/callbacks/creator.py`
- **Delivers one job's outcome. Returns whether it was accepted. Keyed by…** (1 connections) — `app/infrastructure/callbacks/creator.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (7 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (3 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (3 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (2 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (2 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (2 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (1 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (1 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (1 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (1 shared connections)

## Source Files

- `app/infrastructure/callbacks/creator.py`

## Audit Trail

- EXTRACTED: 41 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*