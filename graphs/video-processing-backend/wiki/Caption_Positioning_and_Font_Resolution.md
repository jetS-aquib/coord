# Caption Positioning and Font Resolution

> 86 nodes

## Key Concepts

- **CaptionStyleRenderer** (68 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **caption_style_renderer.py** (51 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._render_ass_impl()** (22 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **.animated_text()** (17 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **.burn()** (15 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **CaptionPositioner** (14 connections) — `app/processors/lyrics/caption_position.py`
- **caption_position.py** (14 connections) — `app/processors/lyrics/caption_position.py`
- **CaptionAnchor** (12 connections) — `app/processors/lyrics/caption_position.py`
- **normalize_caption_position()** (11 connections) — `app/processors/lyrics/caption_position.py`
- **resolve_caption_font()** (10 connections) — `app/processors/lyrics/caption_fonts.py`
- **.__init__()** (8 connections) — `app/pipeline/stitch_pipeline.py`
- **block_alignment()** (8 connections) — `app/processors/lyrics/caption_position.py`
- **.render_ass()** (8 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **StyleConfig** (7 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **.plan()** (7 connections) — `app/processors/lyrics/caption_position.py`
- **log_caption_position()** (7 connections) — `app/processors/lyrics/caption_position.py`
- **._build_kinetic_word_layers()** (7 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **.escape_ass_text()** (7 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **.__init__()** (7 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._plan_caption_anchors()** (7 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._drawing_event()** (6 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._electric_typography_layers()** (6 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._fire_layers()** (6 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._inline_font()** (6 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **._kinetic_alignment()** (6 connections) — `app/processors/lyrics/caption_style_renderer.py`
- *... and 61 more nodes in this community*

## Relationships

- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (23 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (14 shared connections)
- [Caption Visual Effects](Caption_Visual_Effects.md) (11 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (10 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (10 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (8 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (8 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (7 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (6 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (5 shared connections)
- [Kinetic Word Layer Builder](Kinetic_Word_Layer_Builder.md) (5 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (4 shared connections)

## Source Files

- `app/pipeline/stitch_pipeline.py`
- `app/processors/lyrics/caption_fonts.py`
- `app/processors/lyrics/caption_position.py`
- `app/processors/lyrics/caption_style_renderer.py`
- `app/processors/lyrics/effects/compositor.py`
- `tests/test_caption_fonts.py`
- `tests/test_golden_script.py`

## Audit Trail

- EXTRACTED: 288 (92%)
- INFERRED: 25 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*