# Cylinder Wrap Drum Animation

> 16 nodes

## Key Concepts

- **_drum_events()** (14 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_LayerPlan** (7 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_word_pivots()** (7 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_drum_timeline()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_line_content()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_line_pivot()** (4 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_drum_pose()** (3 connections) — `app/processors/lyrics/caption_kinetic.py`
- **clip_at()** (2 connections) — `app/processors/lyrics/caption_kinetic.py`
- **_visible_width()** (2 connections) — `app/processors/lyrics/caption_kinetic.py`
- **frames()** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Timed 6-tuple events drawing one layer of the caption on the spinning drum.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Center of the whole caption block: the drum axis.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Approximate center of every word, used only as the rotation origin. Placement…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **Full caption line, all words visible, with ``kinetic`` re-applied after every…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **``(screen offset from the axis, theta)`` of a word ``arc`` px from the line…** (1 connections) — `app/processors/lyrics/caption_kinetic.py`
- **``(time_ms, spin, curl)`` keyframes for the entry and exit windows.** (1 connections) — `app/processors/lyrics/caption_kinetic.py`

## Relationships

- [Kinetic Word Timing](Kinetic_Word_Timing.md) (10 shared connections)
- [Orbit and Cinematic Word Motion](Orbit_and_Cinematic_Word_Motion.md) (4 shared connections)
- [ASS Tag Layer Planning](ASS_Tag_Layer_Planning.md) (2 shared connections)
- [Kinetic Word Layer Builder](Kinetic_Word_Layer_Builder.md) (2 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (2 shared connections)

## Source Files

- `app/processors/lyrics/caption_kinetic.py`

## Audit Trail

- EXTRACTED: 37 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*