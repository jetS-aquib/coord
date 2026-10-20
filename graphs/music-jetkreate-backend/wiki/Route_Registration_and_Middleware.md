# Route Registration and Middleware

> 14 nodes

## Key Concepts

- **routes/index.ts** (41 connections) — `src/routes/index.ts`
- **image.routes.ts** (8 connections) — `src/modules/image/image.routes.ts`
- **requireSignature.ts** (8 connections) — `src/shared/middleware/requireSignature.ts`
- **health.routes.ts** (6 connections) — `src/routes/health.routes.ts`
- **registerRoutes()** (5 connections) — `src/routes/index.ts`
- **requireSignature()** (3 connections) — `src/shared/middleware/requireSignature.ts`
- **userLogMiddleware()** (3 connections) — `src/shared/middleware/userLogMiddleware.ts`
- **userLogMiddleware.ts** (3 connections) — `src/shared/middleware/userLogMiddleware.ts`
- **router** (2 connections) — `src/modules/asset/asset.routes.ts`
- **router** (2 connections) — `src/modules/asset/publicAssets.routes.ts`
- **router** (2 connections) — `src/modules/image/image.routes.ts`
- **router** (2 connections) — `src/modules/podcast/podcast.routes.ts`
- **router** (2 connections) — `src/routes/health.routes.ts`
- **largeBody** (1 connections) — `src/modules/image/image.routes.ts`

## Relationships

- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (11 shared connections)
- [Auth Controller and Schemas](Auth_Controller_and_Schemas.md) (6 shared connections)
- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (5 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (5 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (4 shared connections)
- [AI Routes and Generation Quotas](AI_Routes_and_Generation_Quotas.md) (4 shared connections)
- [Asset Management](Asset_Management.md) (2 shared connections)
- [Image Generation Service](Image_Generation_Service.md) (2 shared connections)
- [Podcast Controller](Podcast_Controller.md) (2 shared connections)
- [Provider Circuit Breaker](Provider_Circuit_Breaker.md) (2 shared connections)
- [Music Video Module](Music_Video_Module.md) (2 shared connections)
- [AI Model Registry and User Settings](AI_Model_Registry_and_User_Settings.md) (2 shared connections)

## Source Files

- `src/modules/asset/asset.routes.ts`
- `src/modules/asset/publicAssets.routes.ts`
- `src/modules/image/image.routes.ts`
- `src/modules/podcast/podcast.routes.ts`
- `src/routes/health.routes.ts`
- `src/routes/index.ts`
- `src/shared/middleware/requireSignature.ts`
- `src/shared/middleware/userLogMiddleware.ts`

## Audit Trail

- EXTRACTED: 68 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*