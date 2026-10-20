# Services Video Processing

> 7 nodes

## Key Concepts

- **video-processing-backend Vendored Snapshot** (3 connections) — `apps/iris/services/video-processing/README.md`
- **Tailscale / LAN Transport Between Mac and GPU Box** (2 connections) — `apps/iris/services/lipsync/WINDOWS.md`
- **zoap_stitch.py — Director Clip-Stitching Entry Point** (2 connections) — `apps/iris/services/video-processing/README.md`
- **Unauthenticated Worker Restricted by Tailnet Firewall Rule** (2 connections) — `apps/iris/services/lipsync/WINDOWS.md`
- **FFmpeg/ffprobe as External System Dependency** (2 connections) — `apps/iris/services/video-processing/requirements.txt`
- **Service Identity HS256 Assertion (JET-155, aud: video-service)** (2 connections) — `apps/iris/services/video-processing/requirements.txt`
- **Copied-Unchanged Vendoring Rule** (1 connections) — `apps/iris/services/video-processing/README.md`

## Relationships

- [Services Lipsync](Services_Lipsync.md) (2 shared connections)

## Source Files

- `apps/iris/services/lipsync/WINDOWS.md`
- `apps/iris/services/video-processing/README.md`
- `apps/iris/services/video-processing/requirements.txt`

## Audit Trail

- EXTRACTED: 5 (62%)
- INFERRED: 3 (38%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*