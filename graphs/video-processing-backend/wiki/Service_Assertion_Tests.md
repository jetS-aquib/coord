# Service Assertion Tests

> 24 nodes

## Key Concepts

- **test_service_assertion.py** (29 connections) — `tests/test_service_assertion.py`
- **assertion()** (11 connections) — `tests/test_service_assertion.py`
- **submit()** (11 connections) — `tests/test_service_assertion.py`
- **configured()** (5 connections) — `tests/test_service_assertion.py`
- **test_an_assertion_that_is_not_for_this_service_is_refused()** (4 connections) — `tests/test_service_assertion.py`
- **client()** (3 connections) — `tests/test_service_assertion.py`
- **test_a_different_attempt_is_a_different_job()** (3 connections) — `tests/test_service_assertion.py`
- **test_an_assertion_is_single_use()** (3 connections) — `tests/test_service_assertion.py`
- **test_an_expired_assertion_is_refused()** (3 connections) — `tests/test_service_assertion.py`
- **test_an_unconfigured_secret_refuses_everything()** (3 connections) — `tests/test_service_assertion.py`
- **test_another_workspace_cannot_read_the_job_and_is_told_it_does_not_exist()** (3 connections) — `tests/test_service_assertion.py`
- **test_the_job_carries_the_attempt_and_owner_from_the_assertion()** (3 connections) — `tests/test_service_assertion.py`
- **test_the_same_attempt_returns_the_same_job()** (3 connections) — `tests/test_service_assertion.py`
- **test_a_clip_list_longer_than_the_bound_is_refused()** (2 connections) — `tests/test_service_assertion.py`
- **test_a_job_request_without_an_assertion_is_refused()** (2 connections) — `tests/test_service_assertion.py`
- **test_the_body_cannot_name_its_own_attempt_or_owner()** (2 connections) — `tests/test_service_assertion.py`
- **fixture** (2 connections)
- **TestClient** (2 connections)
- **_no_pipeline()** (1 connections) — `tests/test_service_assertion.py`
- **test_an_attempt_id_that_is_a_path_is_refused_before_it_names_a_file()** (1 connections) — `tests/test_service_assertion.py`
- **test_health_stays_open()** (1 connections) — `tests/test_service_assertion.py`
- **parametrize** (1 connections)
- **JET-155 — the job endpoints have an identity and an owner. Before this,…** (1 connections) — `tests/test_service_assertion.py`
- **A configured secret, an empty replay cache and no media pipeline.** (1 connections) — `tests/test_service_assertion.py`

## Relationships

- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (2 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (2 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (2 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (1 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (1 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (1 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (1 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (1 shared connections)

## Source Files

- `tests/test_service_assertion.py`

## Audit Trail

- EXTRACTED: 54 (96%)
- INFERRED: 2 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*