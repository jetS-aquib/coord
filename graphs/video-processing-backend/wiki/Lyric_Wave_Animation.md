# Lyric Wave Animation

> 19 nodes

## Key Concepts

- **test_caption_animation.py** (27 connections) — `tests/test_caption_animation.py`
- **build_lyric_wave_layers()** (26 connections) — `app/processors/lyrics/caption_kinetic.py`
- **KineticSettings** (16 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_grapheme_clusters()** (6 connections) — `app/processors/lyrics/caption_kinetic.py`
- **test_lyric_wave_has_no_visibility_gaps_and_clip_follows_glyph()** (6 connections) — `tests/test_caption_animation.py`
- **_glyph_content()** (5 connections) — `app/processors/lyrics/caption_kinetic.py`
- **plan_trail_timing()** (5 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_shift_transform_times()** (5 connections) — `app/processors/lyrics/caption_kinetic.py`
- **test_lyric_wave_keeps_devanagari_graphemes_whole()** (5 connections) — `tests/test_caption_animation.py`
- **test_lyric_wave_entrance_overshoots_and_exit_drifts_down_left()** (4 connections) — `tests/test_caption_animation.py`
- **glyph_content()** (3 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_lyric_wave_pose()** (3 connections) — `app/processors/lyrics/caption_kinetic.py`
- **TimedAssEvent** (1 connections)
- **Split text without separating combining marks or joined letters.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Keep a single grapheme visible while preserving the full-line layout.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Font-relative displacement and scale for the reference's curved wave.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Lift graphemes through an overshooting wave, then shrink them down-left.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Entry/exit windows, capped to 35% / 25% of the caption so the full lyric always…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Re-base ``\\t(t1,t2,...)`` times on an event starting ``offset_ms`` later.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`

## Relationships

- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (12 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (10 shared connections)
- [Kinetic Word Layer Builder](Kinetic_Word_Layer_Builder.md) (7 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (6 shared connections)
- [Lyrics Request Validation](Lyrics_Request_Validation.md) (5 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (4 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (3 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (3 shared connections)
- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (2 shared connections)
- [ASS Tag Layer Planning](ASS_Tag_Layer_Planning.md) (2 shared connections)
- [Orbit and Cinematic Word Motion](Orbit_and_Cinematic_Word_Motion.md) (2 shared connections)
- [Cylinder Wrap Drum Animation](Cylinder_Wrap_Drum_Animation.md) (2 shared connections)

## Source Files

- `app/processors/lyrics/caption_kinetic.py`
- `tests/test_caption_animation.py`

## Audit Trail

- EXTRACTED: 84 (95%)
- INFERRED: 4 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*