# Job Schemas and Health Route

> 14 nodes

## Key Concepts

- **lyrics_stitching.py** (30 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **schemas/jobs.py** (30 connections) — `app/schemas/jobs.py`
- **BaseModel** (7 connections)
- **health.py** (5 connections) — `app/api/v1/routes/health.py`
- **HealthResponse** (4 connections) — `app/schemas/jobs.py`
- **CaptionFontOption** (3 connections) — `app/schemas/jobs.py`
- **CaptionStyleOption** (3 connections) — `app/schemas/jobs.py`
- **LyricsDisplay** (3 connections) — `app/schemas/jobs.py`
- **Measurement** (3 connections) — `app/schemas/jobs.py`
- **health()** (3 connections) — `app/api/v1/routes/health.py`
- **Enum** (2 connections)
- **get** (1 connections)
- **str** (1 connections)
- **What a finished job actually consumed — JET-155. This service never prices…** (1 connections) — `app/schemas/jobs.py`

## Relationships

- [Job Routes and Identity](Job_Routes_and_Identity.md) (13 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (8 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (6 shared connections)
- [Workflow Request Schemas](Workflow_Request_Schemas.md) (5 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (4 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (4 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (4 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (3 shared connections)
- [Caption Style and Font Endpoints](Caption_Style_and_Font_Endpoints.md) (2 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (2 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (1 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)

## Source Files

- `app/api/v1/routes/health.py`
- `app/api/v1/routes/lyrics_stitching.py`
- `app/schemas/jobs.py`

## Audit Trail

- EXTRACTED: 74 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*