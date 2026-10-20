# AI Routes and Generation Quotas

> 38 nodes

## Key Concepts

- **ai.ts** (61 connections) — `src/routes/ai.ts`
- **gcs.ts** (23 connections) — `src/shared/gcs.ts`
- **generationLimiter.ts** (17 connections) — `src/middleware/generationLimiter.ts`
- **ai.schema.ts** (14 connections) — `src/routes/ai.schema.ts`
- **generationLimit()** (9 connections) — `src/middleware/generationLimiter.ts`
- **getQuotaUsage()** (7 connections) — `src/middleware/generationLimiter.ts`
- **getUserProviderPricing()** (5 connections) — `src/middleware/generationLimiter.ts`
- **getUserQueryConditions()** (5 connections) — `src/middleware/generationLimiter.ts`
- **getUserEffectiveLimits()** (4 connections) — `src/middleware/generationLimiter.ts`
- **thirtyDaysAgoDate()** (4 connections) — `src/middleware/generationLimiter.ts`
- **scan()** (3 connections) — `src/shared/gcs.ts`
- **findGcsUrls()** (2 connections) — `src/shared/gcs.ts`
- **getPresignedUploadUrl()** (2 connections) — `src/shared/gcs.ts`
- **mimeFromPath()** (2 connections) — `src/shared/gcs.ts`
- **router** (2 connections) — `src/routes/ai.ts`
- **autoGenerateCastSchema** (2 connections) — `src/routes/ai.schema.ts`
- **enhanceVideoPromptSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateAudioSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateCharacterImageSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateIdeasSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateSceneImageSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateTagsSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateThumbnailSchema** (2 connections) — `src/routes/ai.schema.ts`
- **generateVoiceoverScriptSchema** (2 connections) — `src/routes/ai.schema.ts`
- **optimizeDescriptionSchema** (2 connections) — `src/routes/ai.schema.ts`
- *... and 13 more nodes in this community*

## Relationships

- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (32 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (8 shared connections)
- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (5 shared connections)
- [Route Registration and Middleware](Route_Registration_and_Middleware.md) (4 shared connections)
- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (3 shared connections)
- [Media Mongoose Models](Media_Mongoose_Models.md) (2 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (2 shared connections)
- [Package Manifest](Package_Manifest.md) (2 shared connections)
- [Element CRUD and GCS](Element_CRUD_and_GCS.md) (2 shared connections)
- [Generation Log Model](Generation_Log_Model.md) (1 shared connections)
- [User Generation Quota Model](User_Generation_Quota_Model.md) (1 shared connections)
- [Asset Management](Asset_Management.md) (1 shared connections)

## Source Files

- `package.json`
- `src/middleware/generationLimiter.ts`
- `src/routes/ai.schema.ts`
- `src/routes/ai.ts`
- `src/shared/gcs.ts`

## Audit Trail

- EXTRACTED: 131 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*