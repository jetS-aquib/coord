# FFmpegEngine

> God node · 40 connections · `app/processors/ffmpeg/ffmpeg_engine.py`

**Community:** [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md)

## Connections by Relation

### calls
- ._run_impl() `EXTRACTED`
- .render_final() `EXTRACTED`
- .render_transitions() `EXTRACTED`
- test_ffmpeg_glow_style_spins_sentence() `EXTRACTED`
- test_ffmpeg_glow_lyric_wave_keeps_selected_font() `EXTRACTED`
- test_ffmpeg_engine_accepts_glow_and_font() `EXTRACTED`

### contains
- ffmpeg_engine.py `EXTRACTED`

### imports
- stitch_pipeline.py `EXTRACTED`
- test_caption_fonts.py `EXTRACTED`
- test_caption_animation.py `EXTRACTED`

### method
- ._create_positioned_classic_ass() `EXTRACTED`
- ._create_glow_ass() `EXTRACTED`
- .render_final_video() `EXTRACTED`
- .render_transition_video() `EXTRACTED`
- ._kinetic_events() `EXTRACTED`
- .__init__() `EXTRACTED`
- .render_video_with_audio() `EXTRACTED`
- ._probe_duration() `EXTRACTED`
- ._parse_srt() `EXTRACTED`
- ._caption_font_family() `EXTRACTED`
- ._lyric_wave_events() `EXTRACTED`
- ._log_timing() `EXTRACTED`
- ._probe_video_info() `EXTRACTED`
- .render_direct_final_video() `EXTRACTED`
- ._plan_caption_anchors() `EXTRACTED`
- .execute() `EXTRACTED`
- ._run() `EXTRACTED`
- ._has_audio_stream() `EXTRACTED`
- ._probe_pix_fmt_and_audio() `EXTRACTED`
- ._load_json() `EXTRACTED`
- *…and 3 more `method` connection(s) not listed (lowest-degree first to go)*

### rationale_for
- Two-phase production renderer. PHASE 1 Feed ordered source clips directly into… `EXTRACTED`

### uses
- [StitchPipeline](StitchPipeline.md) `INFERRED`
- KineticSettings `INFERRED`
- CaptionPositioner `INFERRED`
- VideoFilterBuilder `INFERRED`
- test_lyric_wave_overlaps_adjacent_cues() `INFERRED`
- test_mixed_track_keeps_selected_font_for_latin_cues() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*