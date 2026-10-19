# Usage and Token Logging

> 29 nodes · cohesion 0.10

## Key Concepts

- **tokenLogger.ts** (28 connections) — `src/utils/tokenLogger.ts`
- **dbLogger.ts** (16 connections) — `src/utils/dbLogger.ts`
- **GenerationLog.ts** (13 connections) — `src/models/GenerationLog.ts`
- **logGenerationToDb()** (12 connections) — `src/utils/dbLogger.ts`
- **billedUsage.ts** (8 connections) — `src/services/jobs/billedUsage.ts`
- **calculateCost()** (6 connections) — `src/utils/tokenLogger.ts`
- **logProviderUsage()** (5 connections) — `src/utils/tokenLogger.ts`
- **GenerationUsage** (4 connections) — `src/models/GenerationLog.ts`
- **UsageUnit** (3 connections) — `src/models/GenerationLog.ts`
- **billedUsage.test.ts** (3 connections) — `src/services/jobs/billedUsage.test.ts`
- **DbLogJobType** (2 connections) — `src/utils/dbLogger.ts`
- **DbLogParams** (2 connections) — `src/utils/dbLogger.ts`
- **DbLogProvider** (2 connections) — `src/utils/dbLogger.ts`
- **inferJobType()** (2 connections) — `src/utils/dbLogger.ts`
- **inferProvider()** (2 connections) — `src/utils/dbLogger.ts`
- **todayUTC()** (2 connections) — `src/utils/dbLogger.ts`
- **calculateBytePlusVideoCost()** (2 connections) — `src/utils/tokenLogger.ts`
- **GenerationLogSchema** (1 connections) — `src/models/GenerationLog.ts`
- **IGenerationLog** (1 connections) — `src/models/GenerationLog.ts`
- **METER_UNIT** (1 connections) — `src/services/jobs/billedUsage.ts`
- **UNIT_NOUN** (1 connections) — `src/services/jobs/billedUsage.ts`
- **MODEL_PROVIDER_MAP** (1 connections) — `src/utils/dbLogger.ts`
- **BYTEPLUS_VIDEO_PRICING** (1 connections) — `src/utils/tokenLogger.ts`
- **DEFAULT_PRICING** (1 connections) — `src/utils/tokenLogger.ts`
- **GeminiUsageMeta** (1 connections) — `src/utils/tokenLogger.ts`
- *... and 4 more nodes in this community*

## Relationships

- [Job Transitions](Job_Transitions.md) (5 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (4 shared connections)
- [Provider Adapters](Provider_Adapters.md) (4 shared connections)
- [AI Idea and Audio Services](AI_Idea_and_Audio_Services.md) (4 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (3 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (3 shared connections)
- [AI Videoprompts Videoservice](AI_Videoprompts_Videoservice.md) (3 shared connections)
- [AI Text and Video Services](AI_Text_and_Video_Services.md) (3 shared connections)
- [Job Service and Providers](Job_Service_and_Providers.md) (2 shared connections)
- [Image Resolution](Image_Resolution.md) (2 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (1 shared connections)
- [Mongoose Models](Mongoose_Models.md) (1 shared connections)

## Source Files

- `src/models/GenerationLog.ts`
- `src/services/jobs/billedUsage.test.ts`
- `src/services/jobs/billedUsage.ts`
- `src/utils/dbLogger.ts`
- `src/utils/tokenLogger.ts`

## Audit Trail

- EXTRACTED: 83 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*