# MagicRoll and App Errors

> 58 nodes · cohesion 0.08

## Key Concepts

- **AppError** (209 connections) — `src/shared/errors/AppError.ts`
- **AppError.ts** (71 connections) — `src/shared/errors/AppError.ts`
- **magicrollExecution.ts** (40 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **magicrollService.ts** (32 connections) — `src/services/magicrollService.ts`
- **UnauthorizedError** (30 connections) — `src/shared/errors/AppError.ts`
- **magicrollExecution.test.ts** (13 connections) — `src/modules/billing/adapters/magicrollExecution.test.ts`
- **ForbiddenError** (12 connections) — `src/shared/errors/AppError.ts`
- **asset.service.ts** (10 connections) — `src/modules/asset/asset.service.ts`
- **submitMagicrollTask()** (10 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **resolveImage()** (10 connections) — `src/shared/utils/imageResolver.ts`
- **magicrollProvider** (9 connections) — `src/services/magicrollService.ts`
- **accountOwner.ts** (9 connections) — `src/shared/middleware/accountOwner.ts`
- **magicrollApiError()** (8 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **generateMagicrollVideoFromImage()** (8 connections) — `src/services/magicrollService.ts`
- **generateMagicrollVideoFromPrompt()** (8 connections) — `src/services/magicrollService.ts`
- **pollMagicrollTask()** (7 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **.generateImageToVideo()** (7 connections) — `src/services/magicrollService.ts`
- **.generateTextToVideo()** (7 connections) — `src/services/magicrollService.ts`
- **normalizeError()** (7 connections) — `src/services/magicrollService.ts`
- **accountOwner()** (7 connections) — `src/shared/middleware/accountOwner.ts`
- **authHeaders()** (6 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **cancelMagicrollTask()** (6 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **endpoint()** (6 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **magicrollBalance()** (6 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- **publicImageUrlFor()** (6 connections) — `src/modules/billing/adapters/magicrollExecution.ts`
- *... and 33 more nodes in this community*

## Relationships

- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (27 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (23 shared connections)
- [Provider Adapters](Provider_Adapters.md) (22 shared connections)
- [Provider Authorization and Images](Provider_Authorization_and_Images.md) (21 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (21 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (18 shared connections)
- [Pricing Adapters and Domain](Pricing_Adapters_and_Domain.md) (16 shared connections)
- [Image Resolution](Image_Resolution.md) (13 shared connections)
- [Video Service Assertions](Video_Service_Assertions.md) (12 shared connections)
- [Google Token Verifier](Google_Token_Verifier.md) (11 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (10 shared connections)
- [Error Handling Middleware](Error_Handling_Middleware.md) (9 shared connections)

## Source Files

- `src/modules/asset/asset.service.ts`
- `src/modules/billing/adapters/magicrollExecution.test.ts`
- `src/modules/billing/adapters/magicrollExecution.ts`
- `src/modules/billing/service.ts`
- `src/services/magicrollService.ts`
- `src/shared/errors/AppError.ts`
- `src/shared/gcs.ts`
- `src/shared/middleware/accountOwner.ts`
- `src/shared/utils/imageResolver.ts`
- `src/utils/tokenLogger.ts`

## Audit Trail

- EXTRACTED: 496 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*