# Clip Similarity Scoring

> 8 nodes

## Key Concepts

- **similarity_engine.py** (12 connections) — `app/processors/similarity/similarity_engine.py`
- **.compare_pair()** (4 connections) — `app/processors/similarity/similarity_engine.py`
- **brightness_similarity()** (4 connections) — `app/processors/similarity/visual/brightness_similarity.py`
- **motion_similarity()** (4 connections) — `app/processors/similarity/visual/motion_similarity.py`
- **brightness_similarity.py** (2 connections) — `app/processors/similarity/visual/brightness_similarity.py`
- **motion_similarity.py** (2 connections) — `app/processors/similarity/visual/motion_similarity.py`
- **Compare average brightness between two clips. Parameters ---------- brightness1…** (1 connections) — `app/processors/similarity/visual/brightness_similarity.py`
- **Compare motion scores between two clips. Parameters ---------- motion1 : float…** (1 connections) — `app/processors/similarity/visual/motion_similarity.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (4 shared connections)
- [Clip Visual Analysis](Clip_Visual_Analysis.md) (3 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (2 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (1 shared connections)

## Source Files

- `app/processors/similarity/similarity_engine.py`
- `app/processors/similarity/visual/brightness_similarity.py`
- `app/processors/similarity/visual/motion_similarity.py`

## Audit Trail

- EXTRACTED: 20 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*