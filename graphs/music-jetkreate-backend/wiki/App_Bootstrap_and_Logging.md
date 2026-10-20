# App Bootstrap and Logging

> 16 nodes

## Key Concepts

- **src/index.ts** (29 connections) — `src/index.ts`
- **logger.ts** (8 connections) — `src/shared/logger.ts`
- **logger** (7 connections) — `src/shared/logger.ts`
- **requestLogger.ts** (5 connections) — `src/shared/middleware/requestLogger.ts`
- **connectMongo()** (4 connections) — `src/index.ts`
- **backfillGenerationLogs()** (2 connections) — `src/index.ts`
- **requestLogger()** (2 connections) — `src/shared/middleware/requestLogger.ts`
- **compression** (2 connections) — `package.json`
- **cors** (2 connections) — `package.json`
- **helmet** (2 connections) — `package.json`
- **pino** (2 connections) — `package.json`
- **shutdown()** (1 connections) — `src/index.ts`
- **ALLOWED_ORIGINS** (1 connections) — `src/index.ts`
- **app** (1 connections) — `src/index.ts`
- **MONGO_OPTS** (1 connections) — `src/index.ts`
- **server** (1 connections) — `src/index.ts`

## Relationships

- [Route Registration and Middleware](Route_Registration_and_Middleware.md) (4 shared connections)
- [Package Manifest](Package_Manifest.md) (4 shared connections)
- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (3 shared connections)
- [Job Queue and Media Providers](Job_Queue_and_Media_Providers.md) (2 shared connections)
- [Error Handler Middleware](Error_Handler_Middleware.md) (2 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (2 shared connections)
- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (2 shared connections)
- [AI Routes and Generation Quotas](AI_Routes_and_Generation_Quotas.md) (2 shared connections)
- [Provider Circuit Breaker](Provider_Circuit_Breaker.md) (2 shared connections)
- [Gemini SDK Debug Scripts](Gemini_SDK_Debug_Scripts.md) (1 shared connections)
- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (1 shared connections)
- [Media Mongoose Models](Media_Mongoose_Models.md) (1 shared connections)

## Source Files

- `package.json`
- `src/index.ts`
- `src/shared/logger.ts`
- `src/shared/middleware/requestLogger.ts`

## Audit Trail

- EXTRACTED: 46 (94%)
- INFERRED: 3 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*