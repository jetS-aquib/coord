# Image Resolution

> 24 nodes · cohesion 0.11

## Key Concepts

- **synthesis.service.ts** (44 connections) — `src/modules/video/synthesis.service.ts`
- **gcs.ts** (32 connections) — `src/shared/gcs.ts`
- **imageResolver.ts** (22 connections) — `src/shared/utils/imageResolver.ts`
- **ref_fs** (11 connections)
- **ref_path** (11 connections)
- **VideoAspectRatio** (7 connections) — `src/config/aiModels.ts`
- **geminiService.ts** (4 connections) — `src/services/geminiService.ts`
- **extractLastFrameToFile()** (4 connections) — `src/shared/utils/imageResolver.ts`
- **ref_child_process** (3 connections)
- **ref_util** (3 connections)
- **gcsEnabled** (3 connections) — `src/shared/gcs.ts`
- **fluent-ffmpeg** (2 connections) — `package.json`
- **@google-cloud/storage** (2 connections) — `package.json`
- **ClipRequest** (2 connections) — `src/modules/video/synthesis.service.ts`
- **getPresignedUploadUrl()** (2 connections) — `src/shared/gcs.ts`
- **execPromise** (2 connections) — `src/shared/utils/imageResolver.ts`
- **resolveImageToBase64()** (2 connections) — `src/shared/utils/imageResolver.ts`
- **fs** (1 connections) — `fs`
- **path** (1 connections) — `path`
- **CLIP_NO_TEXT_INSTRUCTION** (1 connections) — `src/modules/video/synthesis.service.ts`
- **CLIP_VISUAL_CONTINUITY_INSTRUCTION** (1 connections) — `src/modules/video/synthesis.service.ts`
- **EXT_TO_MIME** (1 connections) — `src/shared/gcs.ts`
- **PRIVATE_KEY** (1 connections) — `src/shared/gcs.ts`
- **ResolvedImage** (1 connections) — `src/shared/utils/imageResolver.ts`

## Relationships

- [Provider Adapters](Provider_Adapters.md) (14 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (13 shared connections)
- [AI Idea and Audio Services](AI_Idea_and_Audio_Services.md) (11 shared connections)
- [Video Synthesis and Capability](Video_Synthesis_and_Capability.md) (10 shared connections)
- [AI Videoprompts Videoservice](AI_Videoprompts_Videoservice.md) (7 shared connections)
- [AI Schema and Thumbnails](AI_Schema_and_Thumbnails.md) (6 shared connections)
- [Assets, Brand Kits and Elements](Assets,_Brand_Kits_and_Elements.md) (6 shared connections)
- [Service Assertions](Service_Assertions.md) (4 shared connections)
- [Provider Authorization and Images](Provider_Authorization_and_Images.md) (4 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (3 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (3 shared connections)
- [Ideas and GCS URLs](Ideas_and_GCS_URLs.md) (3 shared connections)

## Source Files

- `fs`
- `package.json`
- `path`
- `src/config/aiModels.ts`
- `src/modules/video/synthesis.service.ts`
- `src/services/geminiService.ts`
- `src/shared/gcs.ts`
- `src/shared/utils/imageResolver.ts`

## Audit Trail

- EXTRACTED: 132 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*