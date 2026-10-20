# Services Lipsync

> 11 nodes

## Key Concepts

- **MuseTalk Lipsync Engine** (5 connections) — `apps/iris/services/lipsync/README.md`
- **Self-Hosted Lipsync Pipeline (name → TTS → worker → mp4)** (4 connections) — `apps/iris/services/lipsync/README.md`
- **Windows + NVIDIA GPU Worker Setup** (3 connections) — `apps/iris/services/lipsync/WINDOWS.md`
- **host/personalize.py Host CLI** (2 connections) — `apps/iris/services/lipsync/README.md`
- **Provider A/B Comparison (selfhost vs Hedra vs Sync)** (2 connections) — `apps/iris/services/lipsync/README.md`
- **Template Talking-Head Asset Requirements** (2 connections) — `apps/iris/services/lipsync/assets/README.md`
- **300–350 px Face Size vs MuseTalk's 256² Mouth Redraw** (1 connections) — `apps/iris/services/lipsync/assets/README.md`
- **No Still-Photo Templates (25 fps real video)** (1 connections) — `apps/iris/services/lipsync/assets/README.md`
- **Lipsync COGS Tradeoff ($0.64 Hedra vs $0.02–0.15 self-host)** (1 connections) — `apps/iris/services/lipsync/README.md`
- **Audio Mux Without Re-Encode (-c:v copy)** (1 connections) — `apps/iris/services/lipsync/WINDOWS.md`
- **mmcv/torch/CUDA Version Pinning** (1 connections) — `apps/iris/services/lipsync/WINDOWS.md`

## Relationships

- [Services Lipsync](Services_Lipsync.md) (2 shared connections)
- [Services Video Processing](Services_Video_Processing.md) (1 shared connections)

## Source Files

- `apps/iris/services/lipsync/README.md`
- `apps/iris/services/lipsync/WINDOWS.md`
- `apps/iris/services/lipsync/assets/README.md`

## Audit Trail

- EXTRACTED: 13 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*