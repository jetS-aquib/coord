# build_lyric_wave_layers()

> God node · 26 connections · `app/processors/lyrics/caption_kinetic.py`

**Community:** [Lyric Wave Animation](Lyric_Wave_Animation.md)

## Connections by Relation

### calls
- ._render_ass_impl() `EXTRACTED`
- _num() `EXTRACTED`
- caption_words() `EXTRACTED`
- _plan_layer() `EXTRACTED`
- _content_pieces() `EXTRACTED`
- _grapheme_clusters() `EXTRACTED`
- test_lyric_wave_has_no_visibility_gaps_and_clip_follows_glyph() `EXTRACTED`
- ._lyric_wave_events() `EXTRACTED`
- plan_trail_timing() `EXTRACTED`
- _shift_transform_times() `EXTRACTED`
- test_lyric_wave_keeps_devanagari_graphemes_whole() `EXTRACTED`
- _content_word_texts() `EXTRACTED`
- _line_content() `EXTRACTED`
- test_lyric_wave_entrance_overshoots_and_exit_drifts_down_left() `EXTRACTED`
- _lyric_wave_pose() `EXTRACTED`

### contains
- caption_kinetic.py `EXTRACTED`
- glyph_content() `EXTRACTED`
- clip_at() `EXTRACTED`

### imports
- caption_style_renderer.py `EXTRACTED`
- ffmpeg_engine.py `EXTRACTED`
- test_caption_animation.py `EXTRACTED`

### rationale_for
- Lift graphemes through an overshooting wave, then shrink them down-left. `EXTRACTED`

### references
- KineticSettings `EXTRACTED`
- AssEvent `EXTRACTED`
- Collection `EXTRACTED`
- TimedAssEvent `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*