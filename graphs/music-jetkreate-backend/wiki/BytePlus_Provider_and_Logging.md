# BytePlus Provider and Logging

> 34 nodes

## Key Concepts

- **byteplusService.ts** (31 connections) — `src/services/byteplusService.ts`
- **tokenLogger.ts** (24 connections) — `src/utils/tokenLogger.ts`
- **dbLogger.ts** (13 connections) — `src/utils/dbLogger.ts`
- **logGenerationToDb()** (11 connections) — `src/utils/dbLogger.ts`
- **generateBytePlusVideoFromImage()** (8 connections) — `src/services/byteplusService.ts`
- **generateBytePlusVideoFromPrompt()** (8 connections) — `src/services/byteplusService.ts`
- **logBytePlusVideoCost()** (6 connections) — `src/utils/tokenLogger.ts`
- **authHeaders()** (5 connections) — `src/services/byteplusService.ts`
- **pollTask()** (5 connections) — `src/services/byteplusService.ts`
- **submitTask()** (5 connections) — `src/services/byteplusService.ts`
- **calculateCost()** (5 connections) — `src/utils/tokenLogger.ts`
- **downloadVideo()** (4 connections) — `src/services/byteplusService.ts`
- **parseBytePlusError()** (4 connections) — `src/services/byteplusService.ts`
- **extractVideoUrl()** (3 connections) — `src/services/byteplusService.ts`
- **DbLogJobType** (2 connections) — `src/utils/dbLogger.ts`
- **getApiKey()** (2 connections) — `src/services/byteplusService.ts`
- **inferJobType()** (2 connections) — `src/utils/dbLogger.ts`
- **inferProvider()** (2 connections) — `src/utils/dbLogger.ts`
- **todayUTC()** (2 connections) — `src/utils/dbLogger.ts`
- **calculateBytePlusVideoCost()** (2 connections) — `src/utils/tokenLogger.ts`
- **BytePlusContentItem** (1 connections) — `src/services/byteplusService.ts`
- **BytePlusTask** (1 connections) — `src/services/byteplusService.ts`
- **DbLogParams** (1 connections) — `src/utils/dbLogger.ts`
- **DbLogProvider** (1 connections) — `src/utils/dbLogger.ts`
- **GeminiUsageMeta** (1 connections) — `src/utils/tokenLogger.ts`
- *... and 9 more nodes in this community*

## Relationships

- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (23 shared connections)
- [Job Queue and Media Providers](Job_Queue_and_Media_Providers.md) (6 shared connections)
- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (6 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (4 shared connections)
- [Image Generation Service](Image_Generation_Service.md) (2 shared connections)
- [Package Manifest](Package_Manifest.md) (1 shared connections)
- [AI Model Registry and User Settings](AI_Model_Registry_and_User_Settings.md) (1 shared connections)
- [AI Routes and Generation Quotas](AI_Routes_and_Generation_Quotas.md) (1 shared connections)
- [Media Mongoose Models](Media_Mongoose_Models.md) (1 shared connections)
- [Generation Log Model](Generation_Log_Model.md) (1 shared connections)

## Source Files

- `src/services/byteplusService.ts`
- `src/utils/dbLogger.ts`
- `src/utils/tokenLogger.ts`

## Audit Trail

- EXTRACTED: 102 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*