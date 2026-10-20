# FFmpeg Filter and ASS Rendering

> 60 nodes

## Key Concepts

- **FFmpegEngine** (40 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._create_glow_ass()** (16 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._create_positioned_classic_ass()** (16 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_final_video()** (14 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_transition_video()** (14 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **Path** (11 connections)
- **VideoFilterBuilder** (9 connections) — `app/processors/ffmpeg/builders/video_filter_builder.py`
- **test_lyric_wave_overlaps_adjacent_cues()** (9 connections) — `tests/test_caption_animation.py`
- **._kinetic_events()** (8 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **scaled_font_size()** (8 connections) — `app/processors/lyrics/caption_layout.py`
- **.__init__()** (7 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_video_with_audio()** (7 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._caption_font_family()** (6 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._parse_srt()** (6 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._probe_duration()** (6 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **_dialogues()** (6 connections) — `tests/test_caption_animation.py`
- **_window()** (6 connections) — `tests/test_caption_animation.py`
- **test_mixed_track_keeps_selected_font_for_latin_cues()** (6 connections) — `tests/test_caption_fonts.py`
- **.build()** (5 connections) — `app/processors/ffmpeg/builders/video_filter_builder.py`
- **._log_timing()** (5 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._lyric_wave_events()** (5 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._plan_caption_anchors()** (5 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **._probe_video_info()** (5 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_direct_final_video()** (5 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **test_ffmpeg_glow_style_spins_sentence()** (5 connections) — `tests/test_caption_animation.py`
- *... and 35 more nodes in this community*

## Relationships

- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (14 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (12 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (8 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (7 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (5 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (4 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (4 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (1 shared connections)
- [Kinetic Word Layer Builder](Kinetic_Word_Layer_Builder.md) (1 shared connections)

## Source Files

- `app/processors/ffmpeg/builders/video_filter_builder.py`
- `app/processors/ffmpeg/ffmpeg_engine.py`
- `app/processors/lyrics/caption_layout.py`
- `tests/test_caption_animation.py`
- `tests/test_caption_fonts.py`

## Audit Trail

- EXTRACTED: 161 (89%)
- INFERRED: 20 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*