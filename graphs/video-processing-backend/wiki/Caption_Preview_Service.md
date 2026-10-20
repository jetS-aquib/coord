# Caption Preview Service

> 45 nodes

## Key Concepts

- **test_api_routes.py** (25 connections) — `tests/test_api_routes.py`
- **CaptionPreviewRequest** (19 connections) — `app/services/caption_preview.py`
- **caption_preview.py** (19 connections) — `app/services/caption_preview.py`
- **render_caption_preview()** (10 connections) — `app/services/caption_preview.py`
- **subprocess** (9 connections)
- **get_cached_caption_preview()** (7 connections) — `app/services/caption_preview.py`
- **test_cors.py** (7 connections) — `tests/test_cors.py`
- **caption_preview()** (6 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **.renderer()** (6 connections) — `app/services/caption_preview.py`
- **parametrize** (6 connections)
- **_cache_preview()** (5 connections) — `app/services/caption_preview.py`
- **test_preview_cache_reuses_results_and_background()** (5 connections) — `tests/test_api_routes.py`
- **_preview_key()** (4 connections) — `app/services/caption_preview.py`
- **test_preview_cache_expiry_and_memory_bound()** (4 connections) — `tests/test_api_routes.py`
- **test_preview_uses_production_renderer_for_every_style()** (4 connections) — `tests/test_api_routes.py`
- **.validate_render_options()** (3 connections) — `app/services/caption_preview.py`
- **_preview_background()** (3 connections) — `app/services/caption_preview.py`
- **test_preview_forwards_every_animation_and_kinetic_control()** (3 connections) — `tests/test_api_routes.py`
- **test_preview_forwards_every_font()** (3 connections) — `tests/test_api_routes.py`
- **test_preview_forwards_every_position()** (3 connections) — `tests/test_api_routes.py`
- **test_preview_rejects_invalid_settings()** (3 connections) — `tests/test_api_routes.py`
- **fastapi_testclient** (3 connections)
- **pydantic** (3 connections)
- **tempfile** (3 connections)
- **test_preview_is_public()** (2 connections) — `tests/test_api_routes.py`
- *... and 20 more nodes in this community*

## Relationships

- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (8 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (8 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (5 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (3 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (2 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (2 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (1 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (1 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (1 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (1 shared connections)
- [Caption Visual Effects](Caption_Visual_Effects.md) (1 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (1 shared connections)

## Source Files

- `app/api/v1/routes/__init__.py`
- `app/api/v1/routes/lyrics_stitching.py`
- `app/services/__init__.py`
- `app/services/caption_preview.py`
- `tests/test_api_routes.py`
- `tests/test_cors.py`

## Audit Trail

- EXTRACTED: 99 (90%)
- INFERRED: 11 (10%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*