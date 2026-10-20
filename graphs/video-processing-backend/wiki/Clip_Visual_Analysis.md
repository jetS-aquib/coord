# Clip Visual Analysis

> 21 nodes

## Key Concepts

- **cv2** (13 connections)
- **numpy** (9 connections)
- **boundary_similarity()** (7 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **_estimate_motion()** (7 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **boundary_similarity.py** (7 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **analyze_video()** (6 connections) — `app/processors/analysis/video_analyzer.py`
- **get_video_metadata()** (4 connections) — `app/processors/analysis/metadata.py`
- **motion_score()** (4 connections) — `app/processors/analysis/motion.py`
- **_resize_gray()** (4 connections) — `app/processors/analysis/video_analyzer.py`
- **_prepare_frame()** (4 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **average_brightness()** (3 connections) — `app/processors/analysis/brightness.py`
- **brightness.py** (3 connections) — `app/processors/analysis/brightness.py`
- **metadata.py** (3 connections) — `app/processors/analysis/metadata.py`
- **motion.py** (3 connections) — `app/processors/analysis/motion.py`
- **_empty_motion()** (2 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **ndarray** (1 connections)
- **Estimate motion using sampled, downscaled frames. sample_step: Analyze every…** (1 connections) — `app/processors/analysis/motion.py`
- **Fast visual analysis in one sequential OpenCV pass.** (1 connections) — `app/processors/analysis/video_analyzer.py`
- **Resize frame for faster processing and convert it to grayscale.** (1 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **Compare camera motion at: end of clip1 ↓ start of clip2 Returns camera…** (1 connections) — `app/processors/similarity/visual/boundary_similarity.py`
- **Estimate camera motion inside a clip segment. Optimizations: - sequential video…** (1 connections) — `app/processors/similarity/visual/boundary_similarity.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (7 shared connections)
- [Clip Similarity Scoring](Clip_Similarity_Scoring.md) (3 shared connections)
- [Job Manager and Workflow Types](Job_Manager_and_Workflow_Types.md) (1 shared connections)

## Source Files

- `app/processors/analysis/brightness.py`
- `app/processors/analysis/metadata.py`
- `app/processors/analysis/motion.py`
- `app/processors/analysis/video_analyzer.py`
- `app/processors/similarity/visual/boundary_similarity.py`

## Audit Trail

- EXTRACTED: 47 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*