# Settings and App Startup

> 20 nodes

## Key Concepts

- **config.py** (25 connections) — `app/core/config.py`
- **os** (15 connections)
- **normalize_whisper_language()** (13 connections) — `app/core/config.py`
- **main.py** (12 connections) — `app/main.py`
- **whisper_language_argument()** (7 connections) — `app/core/config.py`
- **.from_env()** (6 connections) — `app/core/config.py`
- **_whisper_env()** (4 connections) — `app/core/config.py`
- **_env_bool()** (3 connections) — `app/core/config.py`
- **_env_float()** (3 connections) — `app/core/config.py`
- **_whisper_int()** (3 connections) — `app/core/config.py`
- **lifespan()** (3 connections) — `app/main.py`
- **contextlib** (3 connections)
- **Settings** (2 connections) — `app/core/config.py`
- **_required_env()** (2 connections) — `app/core/config.py`
- **root()** (2 connections) — `app/main.py`
- **get** (1 connections)
- **Configured language as a string: a language code, or ``"auto"``.** (1 connections) — `app/core/config.py`
- **Faster-Whisper ``language=`` value: ``None`` means auto-detect.** (1 connections) — `app/core/config.py`
- **dotenv** (1 connections)
- **fastapi_middleware_cors** (1 connections)

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (11 shared connections)
- [Caption Text Processing](Caption_Text_Processing.md) (5 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (4 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (4 shared connections)
- [Devanagari Transliteration](Devanagari_Transliteration.md) (3 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (3 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (3 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (2 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (2 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (2 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (1 shared connections)
- [Service Assertion Tests](Service_Assertion_Tests.md) (1 shared connections)

## Source Files

- `app/core/config.py`
- `app/main.py`

## Audit Trail

- EXTRACTED: 76 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*