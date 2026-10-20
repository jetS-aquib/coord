# Auth Config and User Persistence

> 82 nodes

## Key Concepts

- **magicrollService.ts** (32 connections) — `src/services/magicrollService.ts`
- **auth.service.ts** (22 connections) — `src/modules/auth/auth.service.ts`
- **AppError** (16 connections) — `src/shared/errors/AppError.ts`
- **env.ts** (14 connections) — `src/config/env.ts`
- **UserRepository** (11 connections) — `src/modules/auth/auth.repository.ts`
- **AuthService** (11 connections) — `src/modules/auth/auth.service.ts`
- **UnauthorizedError** (11 connections) — `src/shared/errors/AppError.ts`
- **ValidationError** (11 connections) — `src/shared/errors/AppError.ts`
- **jwt.ts** (11 connections) — `src/shared/jwt.ts`
- **Env** (10 connections) — `src/config/env.ts`
- **AppError.ts** (10 connections) — `src/shared/errors/AppError.ts`
- **magicrollProvider** (9 connections) — `src/services/magicrollService.ts`
- **.firebaseVerifyToken()** (9 connections) — `src/modules/auth/auth.service.ts`
- **.register()** (9 connections) — `src/modules/auth/auth.service.ts`
- **generateMagicrollVideoFromImage()** (9 connections) — `src/services/magicrollService.ts`
- **handleApiError()** (9 connections) — `src/services/magicrollService.ts`
- **firebaseAdmin.ts** (9 connections) — `src/config/firebaseAdmin.ts`
- **generateMagicrollVideoFromPrompt()** (8 connections) — `src/services/magicrollService.ts`
- **.generateImageToVideo()** (8 connections) — `src/services/magicrollService.ts`
- **.generateTextToVideo()** (8 connections) — `src/services/magicrollService.ts`
- **signAccessToken()** (8 connections) — `src/shared/jwt.ts`
- **signRefreshToken()** (8 connections) — `src/shared/jwt.ts`
- **User.ts** (8 connections) — `src/models/User.ts`
- **.findByEmail()** (7 connections) — `src/modules/auth/auth.repository.ts`
- **.changePassword()** (7 connections) — `src/modules/auth/auth.service.ts`
- *... and 57 more nodes in this community*

## Relationships

- [Job Queue and Media Providers](Job_Queue_and_Media_Providers.md) (12 shared connections)
- [Auth Controller and Schemas](Auth_Controller_and_Schemas.md) (8 shared connections)
- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (8 shared connections)
- [BytePlus Provider and Logging](BytePlus_Provider_and_Logging.md) (6 shared connections)
- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (6 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (6 shared connections)
- [Route Registration and Middleware](Route_Registration_and_Middleware.md) (5 shared connections)
- [YouTube OAuth and Revenue](YouTube_OAuth_and_Revenue.md) (3 shared connections)
- [AI Routes and Generation Quotas](AI_Routes_and_Generation_Quotas.md) (3 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (3 shared connections)
- [Error Handler Middleware](Error_Handler_Middleware.md) (2 shared connections)
- [Package Manifest](Package_Manifest.md) (2 shared connections)

## Source Files

- `package.json`
- `src/config/env.ts`
- `src/config/firebaseAdmin.ts`
- `src/models/User.ts`
- `src/modules/auth/auth.repository.ts`
- `src/modules/auth/auth.service.ts`
- `src/services/magicrollService.ts`
- `src/shared/errors/AppError.ts`
- `src/shared/gcs.ts`
- `src/shared/jwt.ts`
- `src/shared/middleware/requireAuth.ts`
- `src/shared/middleware/validate.ts`
- `src/shared/services/captchaService.ts`
- `src/utils/tokenLogger.ts`

## Audit Trail

- EXTRACTED: 246 (93%)
- INFERRED: 19 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*