# ASS Tag Layer Planning

> 13 nodes

## Key Concepts

- **split_tags()** (8 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_plan_layer()** (6 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_word_content()** (6 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_block_names()** (5 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_push_block_state()** (5 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_strip_scale_pop()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_state_of_block()** (3 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_tag_name()** (2 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Split an override string into tags; ``\\t(...)`` stays one token.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Remove whole-line scale "pop" transforms (``\\t`` containing only…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **(tags set statically, every tag touched incl. inside \\t).** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Record an inline block, dropping earlier blocks whose every tag is statically…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Full caption line in which only ``word_index`` is visible.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`

## Relationships

- [Kinetic Word Timing](Kinetic_Word_Timing.md) (8 shared connections)
- [Kinetic Word Layer Builder](Kinetic_Word_Layer_Builder.md) (2 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (2 shared connections)
- [Cylinder Wrap Drum Animation](Cylinder_Wrap_Drum_Animation.md) (2 shared connections)
- [Orbit and Cinematic Word Motion](Orbit_and_Cinematic_Word_Motion.md) (2 shared connections)

## Source Files

- `app/processors/lyrics/caption_kinetic.py`

## Audit Trail

- EXTRACTED: 30 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*