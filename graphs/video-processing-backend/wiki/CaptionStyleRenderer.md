# CaptionStyleRenderer

> God node · 68 connections · `app/processors/lyrics/caption_style_renderer.py`

**Community:** [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md)

## Connections by Relation

### calls
- _render() `EXTRACTED`
- .render_final() `EXTRACTED`
- test_caption_grouping_preserves_separate_word_data() `EXTRACTED`
- main() `EXTRACTED`
- test_lyric_wave_keeps_selected_caption_style_and_font() `EXTRACTED`
- test_style_renderer_spins_sentence_on_a_drum() `EXTRACTED`
- _header() `EXTRACTED`
- render() `EXTRACTED`
- test_renderer_writes_two_line_captions() `EXTRACTED`

### contains
- caption_style_renderer.py `EXTRACTED`

### imports
- stitch_pipeline.py `EXTRACTED`
- test_caption_fonts.py `EXTRACTED`
- lyrics_stitching.py `EXTRACTED`
- test_caption_animation.py `EXTRACTED`
- test_lyric_processing.py `EXTRACTED`
- test_golden_script.py `EXTRACTED`
- caption_preview.py `EXTRACTED`

### method
- ._render_ass_impl() `EXTRACTED`
- .animated_text() `EXTRACTED`
- .burn() `EXTRACTED`
- .render_ass() `EXTRACTED`
- ._plan_caption_anchors() `EXTRACTED`
- ._build_kinetic_word_layers() `EXTRACTED`
- .__init__() `EXTRACTED`
- .escape_ass_text() `EXTRACTED`
- ._fire_layers() `EXTRACTED`
- ._spark_typography_layers() `EXTRACTED`
- ._electric_typography_layers() `EXTRACTED`
- ._kinetic_alignment() `EXTRACTED`
- ._inline_font() `EXTRACTED`
- ._drawing_event() `EXTRACTED`
- ._smoke_layers() `EXTRACTED`
- ._particle_layers() `EXTRACTED`
- ._active_word_overlay() `EXTRACTED`
- ._pin_events_to_anchor() `EXTRACTED`
- ._overlay_offset_expressions() `EXTRACTED`
- ._time_to_seconds() `EXTRACTED`
- *…and 16 more `method` connection(s) not listed (lowest-degree first to go)*

### references
- .renderer() `EXTRACTED`

### uses
- [StitchPipeline](StitchPipeline.md) `INFERRED`
- CaptionPreviewRequest `INFERRED`
- KineticSettings `INFERRED`
- CaptionPositioner `INFERRED`
- CaptionAnchor `INFERRED`
- EffectContext `INFERRED`
- CaptionEvent `INFERRED`
- test_lyric_wave_overlaps_adjacent_cues() `INFERRED`
- test_mixed_track_keeps_selected_font_for_latin_cues() `INFERRED`
- test_rendered_lines_have_small_nonoverlapping_gap() `INFERRED`
- list_caption_styles() `INFERRED`
- EffectCompositor `INFERRED`
- test_inline_font_override_uses_selected_font() `INFERRED`
- test_style_is_accepted_by_request_and_registry() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*