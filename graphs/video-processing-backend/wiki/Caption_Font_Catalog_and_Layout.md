# Caption Font Catalog and Layout

> 45 nodes

## Key Concepts

- **test_caption_fonts.py** (31 connections) — `tests/test_caption_fonts.py`
- **test_golden_script.py** (24 connections) — `tests/test_golden_script.py`
- **caption_fonts.py** (19 connections) — `app/processors/lyrics/caption_fonts.py`
- **normalize_caption_font()** (14 connections) — `app/processors/lyrics/caption_fonts.py`
- **_render()** (11 connections) — `tests/test_golden_script.py`
- **pytest** (11 connections)
- **split_caption_lines()** (9 connections) — `app/processors/lyrics/caption_layout.py`
- **caption_layout.py** (9 connections) — `app/processors/lyrics/caption_layout.py`
- **available_font_options()** (7 connections) — `app/processors/lyrics/caption_fonts.py`
- **test_rendered_lines_have_small_nonoverlapping_gap()** (6 connections) — `tests/test_golden_script.py`
- **_header()** (5 connections) — `tests/test_caption_fonts.py`
- **test_explicit_position_overrides_alternating_layout()** (4 connections) — `tests/test_golden_script.py`
- **_env_float()** (3 connections) — `app/processors/lyrics/caption_layout.py`
- **test_box_pop_is_no_longer_supported()** (3 connections) — `tests/test_caption_animation.py`
- **_request()** (3 connections) — `tests/test_caption_fonts.py`
- **test_normalize_rejects_unknown_font()** (3 connections) — `tests/test_caption_fonts.py`
- **test_request_accepts_caption_font_aliases()** (3 connections) — `tests/test_caption_fonts.py`
- **test_explicit_request_overrides_are_preserved()** (3 connections) — `tests/test_golden_script.py`
- **test_golden_script_has_two_fonts_colors_sizes_and_alternating_positions()** (3 connections) — `tests/test_golden_script.py`
- **test_long_lines_shrink_without_losing_text()** (3 connections) — `tests/test_golden_script.py`
- **test_null_font_values_keep_the_two_font_style()** (3 connections) — `tests/test_golden_script.py`
- **test_optional_animations_preserve_both_fonts()** (3 connections) — `tests/test_golden_script.py`
- **parametrize** (3 connections)
- **CaptionFont** (2 connections) — `app/processors/lyrics/caption_fonts.py`
- **_font()** (2 connections) — `app/processors/lyrics/caption_fonts.py`
- *... and 20 more nodes in this community*

## Relationships

- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (23 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (11 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (8 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (7 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (6 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (5 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (5 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (3 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (2 shared connections)
- [Caption Style and Font Endpoints](Caption_Style_and_Font_Endpoints.md) (1 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (1 shared connections)
- [Creator Callback Tests](Creator_Callback_Tests.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/caption_fonts.py`
- `app/processors/lyrics/caption_layout.py`
- `tests/test_caption_animation.py`
- `tests/test_caption_fonts.py`
- `tests/test_golden_script.py`

## Audit Trail

- EXTRACTED: 143 (97%)
- INFERRED: 5 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*