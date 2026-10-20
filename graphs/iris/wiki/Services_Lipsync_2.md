# Services Lipsync

> 9 nodes

## Key Concepts

- **lipsync-mock ffmpeg Audio-Replace Engine** (4 connections) — `apps/iris/services/lipsync/README.md`
- **lipsync-musetalk Compose Service (gpus: all)** (3 connections) — `apps/iris/services/lipsync/docker-compose.yml`
- **TaskList Component** (3 connections) — `packages/do-ui/README.md`
- **Only Real State Sources Drive Progress Components** (3 connections) — `packages/do-ui/INTEGRATION.md`
- **lipsync-mock Compose Service** (2 connections) — `apps/iris/services/lipsync/docker-compose.yml`
- **Lipsync Worker FastAPI Stack** (2 connections) — `apps/iris/services/lipsync/worker/requirements.txt`
- **Compose Profile Switch (mock vs gpu, shared port 8088)** (2 connections) — `apps/iris/services/lipsync/docker-compose.yml`
- **Worker Output-Name Validation (1-80 safe chars)** (1 connections) — `apps/iris/services/lipsync/README.md`
- **Task Cursor Stays the Same DOM Node While Sliding** (1 connections) — `packages/do-ui/VERIFICATION.md`

## Relationships

- [Services Lipsync](Services_Lipsync.md) (2 shared connections)
- [Do Ui](Do_Ui.md) (1 shared connections)
- [Services Video Processing](Services_Video_Processing.md) (1 shared connections)
- [Brand Mascot](Brand_Mascot.md) (1 shared connections)

## Source Files

- `apps/iris/services/lipsync/README.md`
- `apps/iris/services/lipsync/docker-compose.yml`
- `apps/iris/services/lipsync/worker/requirements.txt`
- `packages/do-ui/INTEGRATION.md`
- `packages/do-ui/README.md`
- `packages/do-ui/VERIFICATION.md`

## Audit Trail

- EXTRACTED: 9 (69%)
- INFERRED: 4 (31%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*