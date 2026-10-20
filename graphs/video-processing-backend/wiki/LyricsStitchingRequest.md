# LyricsStitchingRequest

> God node · 25 connections · `app/schemas/jobs.py`

**Community:** [Lyrics Request Validation](Lyrics_Request_Validation.md)

## Connections by Relation

### calls
- test_style_is_accepted_by_request_and_registry() `EXTRACTED`
- test_cylinder_wrap_is_a_supported_choice() `EXTRACTED`
- test_lyric_wave_is_a_supported_choice() `EXTRACTED`
- _request() `EXTRACTED`
- test_explicit_request_overrides_are_preserved() `EXTRACTED`
- test_api_3_defaults_to_requested_lyrics_options() `EXTRACTED`
- test_api_3_supports_lyrics_options() `EXTRACTED`

### contains
- schemas/jobs.py `EXTRACTED`

### imports
- test_caption_fonts.py `EXTRACTED`
- lyrics_stitching.py `EXTRACTED`
- test_caption_animation.py `EXTRACTED`
- test_golden_script.py `EXTRACTED`
- test_workflow_schemas.py `EXTRACTED`

### inherits
- BaseJobRequest `EXTRACTED`

### method
- .validate_kinetic_options() `EXTRACTED`
- .kinetic_options() `EXTRACTED`
- .validate_caption_position() `EXTRACTED`
- .validate_caption_font() `EXTRACTED`
- .validate_caption_animation() `EXTRACTED`
- .normalize_caption_style() `EXTRACTED`
- .normalize_language() `EXTRACTED`

### rationale_for
- Workflow #3: ordered clip URLs + audio + lyrics/captions. `EXTRACTED`

### uses
- KineticSettings `INFERRED`
- clip_stitching_with_lyrics() `INFERRED`
- test_null_font_values_keep_the_two_font_style() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*