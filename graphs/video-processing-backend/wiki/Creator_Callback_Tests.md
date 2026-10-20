# Creator Callback Tests

> 20 nodes

## Key Concepts

- **post()** (13 connections) — `tests/test_creator_callback.py`
- **test_creator_callback.py** (13 connections) — `tests/test_creator_callback.py`
- **clip_stitching()** (6 connections) — `app/api/v1/routes/clip_stitching.py`
- **test_a_transient_failure_is_retried_and_then_given_up_on()** (4 connections) — `tests/test_creator_callback.py`
- **test_a_transport_error_is_retried_and_can_succeed()** (4 connections) — `tests/test_creator_callback.py`
- **test_it_stays_silent_when_it_is_not_configured()** (4 connections) — `tests/test_creator_callback.py`
- **Response** (3 connections) — `tests/test_creator_callback.py`
- **test_a_refusal_is_not_retried()** (3 connections) — `tests/test_creator_callback.py`
- **test_it_reports_the_measurement_keyed_by_the_attempt()** (3 connections) — `tests/test_creator_callback.py`
- **fake_post()** (3 connections) — `tests/test_creator_callback.py`
- **test_it_signs_the_callback_so_the_creator_knows_who_called()** (2 connections) — `tests/test_creator_callback.py`
- **.__init__()** (1 connections) — `tests/test_creator_callback.py`
- **fake_post()** (1 connections) — `tests/test_creator_callback.py`
- **fake_post()** (1 connections) — `tests/test_creator_callback.py`
- **fake_post()** (1 connections) — `tests/test_creator_callback.py`
- **refuse()** (1 connections) — `tests/test_creator_callback.py`
- **callbacks/__init__.py** (1 connections) — `app/infrastructure/callbacks/__init__.py`
- **parametrize** (1 connections)
- **JET-155 — reporting a finished job's measurement to the creator API. The…** (1 connections) — `tests/test_creator_callback.py`
- **Calls the reporter with the network and the sleep replaced.** (1 connections) — `tests/test_creator_callback.py`

## Relationships

- [Job Routes and Identity](Job_Routes_and_Identity.md) (4 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (3 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (2 shared connections)
- [Workflow Request Schemas](Workflow_Request_Schemas.md) (1 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (1 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (1 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (1 shared connections)

## Source Files

- `app/api/v1/routes/clip_stitching.py`
- `app/infrastructure/callbacks/__init__.py`
- `tests/test_creator_callback.py`

## Audit Trail

- EXTRACTED: 32 (80%)
- INFERRED: 8 (20%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*