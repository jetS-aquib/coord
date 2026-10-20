# Kinetic Word Layer Builder

> 12 nodes

## Key Concepts

- **build_kinetic_word_layers()** (25 connections) — `app/processors/lyrics/caption_kinetic.py`
- **caption_words()** (8 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_content_pieces()** (6 connections) — `app/processors/lyrics/caption_kinetic.py`
- **AssEvent** (5 connections)
- **_content_word_texts()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_ghost_source()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Collection** (2 connections)
- **add_text()** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Turn one caption's layer stack into per-word kinetic events. ``motion`` is…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **``("block", inner)`` | ``("sep", text, is_line_break)`` | ``("word", text,…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **``(word, line_index)`` for an escaped ASS caption text.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **The readable base layer the ghosts copy: a word layer with a visible fill, no…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`

## Relationships

- [Kinetic Word Timing](Kinetic_Word_Timing.md) (9 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (7 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (5 shared connections)
- [Orbit and Cinematic Word Motion](Orbit_and_Cinematic_Word_Motion.md) (4 shared connections)
- [ASS Tag Layer Planning](ASS_Tag_Layer_Planning.md) (2 shared connections)
- [Cylinder Wrap Drum Animation](Cylinder_Wrap_Drum_Animation.md) (2 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (1 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/caption_kinetic.py`

## Audit Trail

- EXTRACTED: 45 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*