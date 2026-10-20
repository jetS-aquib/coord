# Graph Report - video-processing-backend  (2026-10-19)

## Corpus Check
- 101 files · ~50,018 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .ttf 2)

## Summary
- 950 nodes · 2256 edges · 58 communities (29 shown, 29 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.89)
- Token cost: 74,723 input · 0 output

## Community Hubs (Navigation)
- Caption Positioning and Font Resolution
- Caption Text Processing
- Job Manager and Workflow Types
- FFmpeg Filter and ASS Rendering
- Stitch Pipeline Orchestration
- Caption Preview Service
- Caption Font Catalog and Layout
- API Surface and Deployment Docs
- Module Wiring and Downloads
- Caption Visual Effects
- Service Assertion Tests
- Job Routes and Identity
- Clip Visual Analysis
- Lyric Corrections Dictionary
- Devanagari Transliteration
- Creator Callback Tests
- Settings and App Startup
- Orbit and Cinematic Word Motion
- Caption Generator and Wrapping
- Lyric Wave Animation
- Lyrics Request Validation
- Timing and Quality Logging
- Lyric Text Normalization
- Cylinder Wrap Drum Animation
- Job Schemas and Health Route
- Kinetic Word Timing
- Creator Measurement Callback
- Whisper Model Loading
- ASS Tag Layer Planning
- Workflow Request Schemas
- Kinetic Word Layer Builder
- Hindi ASR Correction
- Whisper Transcription Tuning
- Clip Similarity Scoring
- Assertion Replay Cache
- Caption Style and Font Endpoints
- Project Metadata

## God Nodes (most connected - your core abstractions)
1. `CaptionStyleRenderer` - 68 edges
2. `FFmpegEngine` - 40 edges
3. `StitchPipeline` - 35 edges
4. `CaptionProcessor` - 27 edges
5. `build_lyric_wave_layers()` - 26 edges
6. `LyricExtractor` - 26 edges
7. `build_kinetic_word_layers()` - 25 edges
8. `LyricsStitchingRequest` - 25 edges
9. `WorkflowType` - 23 edges
10. `JobManager` - 23 edges

## Surprising Connections (you probably didn't know these)
- `test_workflow_types()` --uses--> `WorkflowType`  [INFERRED]
  tests/test_workflow_schemas.py → app/core/workflows.py
- `test_auto_language_uses_reliable_detected_hindi_or_marathi()` --uses--> `LyricExtractor`  [INFERRED]
  tests/test_lyric_processing.py → app/processors/lyrics/lyric_extractor.py
- `configured()` --uses--> `JobManager`  [INFERRED]
  tests/test_service_assertion.py → app/infrastructure/jobs/manager.py
- `test_resolve_falls_back_when_script_missing()` --calls--> `resolve_caption_font()`  [EXTRACTED]
  tests/test_caption_fonts.py → app/processors/lyrics/caption_fonts.py
- `test_styles_are_scaled_up()` --calls--> `scaled_font_size()`  [EXTRACTED]
  tests/test_caption_fonts.py → app/processors/lyrics/caption_layout.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caption animation modes sharing kinetic_* timing parameters** — readme_kinetic_animation, readme_cylinder_wrap_animation, readme_lyric_wave_animation, readme_caption_animation, readme_karaoke_vertical_exception [EXTRACTED 1.00]
- **Controls that shape lyric transcription quality** — readme_whisper_configuration, readme_whisper_decode_thresholds, readme_lyric_min_word_probability, readme_lyric_corrections, readme_no_default_initial_prompt, readme_zero_duration_timestamp_retention [EXTRACTED 1.00]
- **golden_script two-font typography and its bundled, licensed fonts** — readme_golden_script_style, readme_great_vibes_font, readme_cormorant_garamond_font, readme_bundled_fonts, app_assets_fonts_licenses_greatvibes_ofl_sil_open_font_license, app_assets_fonts_licenses_cormorantgaramond_ofl_sil_open_font_license [EXTRACTED 1.00]

## Communities (58 total, 29 thin omitted)

### Community 0 - "Caption Positioning and Font Resolution"
Cohesion: 0.05
Nodes (15): resolve_caption_font(), block_alignment(), CaptionAnchor, CaptionPositioner, log_caption_position(), normalize_caption_position(), CaptionStyleRenderer, _grapheme_clusters() (+7 more)

### Community 1 - "Caption Text Processing"
Cohesion: 0.05
Nodes (10): CaptionProcessor, LyricExtractor, test_caption_grouping_preserves_separate_word_data(), test_unspaced_text_is_not_guessed_or_split(), test_whitespace_merged_words_split_inside_parent_interval(), test_chunk_length_configuration(), test_chunk_length_rejects_invalid_values(), test_extractor_passes_chunk_length_and_keeps_repeated_words() (+2 more)

### Community 2 - "Job Manager and Workflow Types"
Cohesion: 0.07
Nodes (8): WorkflowType, JobManager, download_file(), GCSStorage, ClipInput, JobService, test_completed_job_persists_gcs_url(), test_local_output_cannot_complete_job()

### Community 3 - "FFmpeg Filter and ASS Rendering"
Cohesion: 0.07
Nodes (13): VideoFilterBuilder, FFmpegEngine, scaled_font_size(), _dialogues(), _ms(), test_ffmpeg_glow_lyric_wave_keeps_selected_font(), test_ffmpeg_glow_style_spins_sentence(), test_lyric_wave_keeps_selected_caption_style_and_font() (+5 more)

### Community 4 - "Stitch Pipeline Orchestration"
Cohesion: 0.08
Nodes (9): StitchPipeline, SimilarityEngine, Transition, TransitionSelector, TransitionEngine, process_video_job(), main(), test_explicit_auto_language_is_not_replaced_by_environment() (+1 more)

### Community 5 - "Caption Preview Service"
Cohesion: 0.08
Nodes (15): caption_preview(), _cache_preview(), CaptionPreviewRequest, get_cached_caption_preview(), _preview_background(), _preview_key(), render_caption_preview(), test_preview_cache_expiry_and_memory_bound() (+7 more)

### Community 6 - "Caption Font Catalog and Layout"
Cohesion: 0.07
Nodes (33): available_font_options(), CaptionFont, _font(), _key(), normalize_caption_font(), _env_float(), _env_int(), split_caption_lines() (+25 more)

### Community 7 - "API Surface and Deployment Docs"
Cohesion: 0.09
Nodes (25): Cormorant Garamond SIL OFL 1.1 notice, Great Vibes SIL OFL 1.1 notice, Healthcheck on /api/v1/health, STORAGE_ROOT=/tmp/ordered-clip-video-api, video-api compose service, caption_animation option, GET /api/v1/caption-fonts, caption_position fixed placement option (+17 more)

### Community 8 - "Module Wiring and Downloads"
Cohesion: 0.12
Nodes (4): filename_from_url(), _safe_name(), analyze_all_videos(), natural_sort_key()

### Community 9 - "Caption Visual Effects"
Cohesion: 0.14
Nodes (12): CaptionEffect, CaptionEvent, EffectContext, create_effect(), ElectricEffect, FireEffect, InkEffect, LiquidEffect (+4 more)

### Community 10 - "Service Assertion Tests"
Cohesion: 0.16
Nodes (15): assertion(), client(), configured(), submit(), test_a_clip_list_longer_than_the_bound_is_refused(), test_a_different_attempt_is_a_different_job(), test_a_job_request_without_an_assertion_is_refused(), test_an_assertion_is_single_use() (+7 more)

### Community 11 - "Job Routes and Identity"
Cohesion: 0.19
Nodes (9): clip_stitching_with_audio(), get_job(), get_result(), _owned_state(), require_service_assertion(), ServiceContext, _unauthorized(), verify_service_assertion() (+1 more)

### Community 12 - "Clip Visual Analysis"
Cohesion: 0.18
Nodes (9): average_brightness(), get_video_metadata(), motion_score(), analyze_video(), _resize_gray(), boundary_similarity(), _empty_motion(), _estimate_motion() (+1 more)

### Community 13 - "Lyric Corrections Dictionary"
Cohesion: 0.17
Nodes (11): compile_corrections(), _corrections_path(), load_corrections(), LyricCorrector, test_apply_to_captions_counts_changes(), test_empty_corrector_is_noop(), test_keeps_two_line_captions(), test_latin_case_insensitive_and_punctuation() (+3 more)

### Community 14 - "Devanagari Transliteration"
Cohesion: 0.18
Nodes (13): _delete_final_schwa(), _delete_hindi_final_schwa(), _has_final_inherent_vowel(), normalize_roman_spelling(), _romanize_orthography(), _to_common_roman_spelling(), transliterate(), transliterate_hindi() (+5 more)

### Community 15 - "Creator Callback Tests"
Cohesion: 0.14
Nodes (10): clip_stitching(), post(), Response, test_a_refusal_is_not_retried(), test_a_transient_failure_is_retried_and_then_given_up_on(), test_a_transport_error_is_retried_and_can_succeed(), test_it_reports_the_measurement_keyed_by_the_attempt(), fake_post() (+2 more)

### Community 16 - "Settings and App Startup"
Cohesion: 0.17
Nodes (10): _env_bool(), _env_float(), normalize_whisper_language(), _required_env(), Settings, _whisper_env(), _whisper_int(), whisper_language_argument() (+2 more)

### Community 17 - "Orbit and Cinematic Word Motion"
Cohesion: 0.15
Nodes (14): _animates(), clip_at(), _cinematic_word_tags(), entry_frame(), _ease_in_out(), _eased(), _ghost_events(), entry_frame() (+6 more)

### Community 19 - "Lyric Wave Animation"
Cohesion: 0.18
Nodes (11): build_lyric_wave_layers(), glyph_content(), _glyph_content(), _grapheme_clusters(), KineticSettings, _lyric_wave_pose(), plan_trail_timing(), _shift_transform_times() (+3 more)

### Community 20 - "Lyrics Request Validation"
Cohesion: 0.18
Nodes (5): clip_stitching_with_lyrics(), normalize_caption_animation(), LyricsStitchingRequest, test_cylinder_wrap_is_a_supported_choice(), test_lyric_wave_is_a_supported_choice()

### Community 21 - "Timing and Quality Logging"
Cohesion: 0.20
Nodes (4): emit_timing(), log_quality(), log_timing(), timed()

### Community 23 - "Cylinder Wrap Drum Animation"
Cohesion: 0.14
Nodes (9): _drum_events(), clip_at(), _drum_pose(), _drum_timeline(), _LayerPlan, _line_content(), _line_pivot(), _visible_width() (+1 more)

### Community 24 - "Job Schemas and Health Route"
Cohesion: 0.23
Nodes (6): health(), CaptionFontOption, CaptionStyleOption, HealthResponse, LyricsDisplay, Measurement

### Community 25 - "Kinetic Word Timing"
Cohesion: 0.21
Nodes (10): _ass_ms(), _ass_time(), _bounded(), event_window(), _flag(), _Ghost, KineticWord, log_kinetic_words() (+2 more)

### Community 26 - "Creator Measurement Callback"
Cohesion: 0.24
Nodes (3): post_measurement(), report_in_background(), sign_callback_assertion()

### Community 28 - "ASS Tag Layer Planning"
Cohesion: 0.18
Nodes (8): _block_names(), _plan_layer(), _push_block_state(), split_tags(), _state_of_block(), _strip_scale_pop(), _tag_name(), _word_content()

### Community 29 - "Workflow Request Schemas"
Cohesion: 0.19
Nodes (8): AudioStitchingRequest, BaseJobRequest, ClipStitchingRequest, test_api_1_does_not_require_audio(), test_api_2_requires_audio(), test_api_3_defaults_to_requested_lyrics_options(), test_api_3_supports_lyrics_options(), test_workflow_types()

### Community 30 - "Kinetic Word Layer Builder"
Cohesion: 0.21
Nodes (5): build_kinetic_word_layers(), caption_words(), _content_pieces(), _content_word_texts(), _ghost_source()

### Community 32 - "Whisper Transcription Tuning"
Cohesion: 0.31
Nodes (4): LYRIC_MIN_WORD_PROBABILITY confidence filter, Whisper transcription configuration set, Optional vocal separation extra (demucs), faster-whisper dependency

## Knowledge Gaps
- **7 isolated node(s):** `ordered-clip-video-api`, `CAPTION_FONT_SCALE / CAPTION_TWO_LINE_MIN_CHARS layout settings`, `Healthcheck on /api/v1/health`, `Core runtime dependencies (numpy, opencv-headless, Pillow)`, `API server stack (FastAPI, uvicorn, pydantic, dotenv)` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 287 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CaptionStyleRenderer` connect `Caption Positioning and Font Resolution` to `Caption Text Processing`, `Caption Style and Font Endpoints`, `Stitch Pipeline Orchestration`, `Caption Preview Service`, `FFmpeg Filter and ASS Rendering`, `Caption Font Catalog and Layout`, `Module Wiring and Downloads`, `Caption Visual Effects`, `Devanagari Transliteration`, `Lyric Wave Animation`, `Job Schemas and Health Route`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `CaptionStyleRenderer` (e.g. with `list_caption_styles()` and `StitchPipeline`) actually correct?**
  _`CaptionStyleRenderer` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ordered-clip-video-api`, `CAPTION_FONT_SCALE / CAPTION_TWO_LINE_MIN_CHARS layout settings`, `Healthcheck on /api/v1/health` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Caption Positioning and Font Resolution` be split into smaller, more focused modules?**
  _Cohesion score 0.05253077975376197 - nodes in this community are weakly interconnected._
- **Why does `FFmpegEngine` connect `FFmpeg Filter and ASS Rendering` to `Caption Positioning and Font Resolution`, `Stitch Pipeline Orchestration`, `Caption Font Catalog and Layout`, `Module Wiring and Downloads`, `Lyric Wave Animation`, `Timing and Quality Logging`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `FFmpegEngine` (e.g. with `StitchPipeline` and `VideoFilterBuilder`) actually correct?**
  _`FFmpegEngine` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Caption Text Processing` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._