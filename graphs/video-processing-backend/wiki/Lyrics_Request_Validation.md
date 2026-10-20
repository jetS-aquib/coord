# Lyrics Request Validation

> 17 nodes

## Key Concepts

- **LyricsStitchingRequest** (25 connections) — `app/schemas/jobs.py`
- **normalize_caption_animation()** (14 connections) — `app/processors/lyrics/caption_kinetic.py`
- **clip_stitching_with_lyrics()** (7 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **field_validator** (6 connections)
- **.kinetic_options()** (4 connections) — `app/schemas/jobs.py`
- **.validate_kinetic_options()** (4 connections) — `app/schemas/jobs.py`
- **.validate_caption_animation()** (3 connections) — `app/schemas/jobs.py`
- **.validate_caption_font()** (3 connections) — `app/schemas/jobs.py`
- **.validate_caption_position()** (3 connections) — `app/schemas/jobs.py`
- **test_cylinder_wrap_is_a_supported_choice()** (3 connections) — `tests/test_caption_animation.py`
- **test_lyric_wave_is_a_supported_choice()** (3 connections) — `tests/test_caption_animation.py`
- **.normalize_caption_style()** (2 connections) — `app/schemas/jobs.py`
- **.normalize_language()** (2 connections) — `app/schemas/jobs.py`
- **model_validator** (1 connections)
- **Return a validated animation name; unset values mean ``none``.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Kinetic tuning values that were supplied (defaults apply otherwise).** (1 connections) — `app/schemas/jobs.py`
- **Workflow #3: ordered clip URLs + audio + lyrics/captions.** (1 connections) — `app/schemas/jobs.py`

## Relationships

- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (7 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (5 shared connections)
- [Workflow Request Schemas](Workflow_Request_Schemas.md) (5 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (5 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (4 shared connections)
- [Job Routes and Identity](Job_Routes_and_Identity.md) (2 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (2 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (1 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (1 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (1 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (1 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)

## Source Files

- `app/api/v1/routes/lyrics_stitching.py`
- `app/processors/lyrics/caption_kinetic.py`
- `app/schemas/jobs.py`
- `tests/test_caption_animation.py`

## Audit Trail

- EXTRACTED: 52 (88%)
- INFERRED: 7 (12%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*