# Provider Authorization and Images

> 62 nodes · cohesion 0.06

## Key Concepts

- **providerAuthorization.ts** (40 connections) — `src/modules/billing/providerAuthorization.ts`
- **googleImageExecution.ts** (39 connections) — `src/modules/billing/adapters/googleImageExecution.ts`
- **bytePlusImageExecution.ts** (32 connections) — `src/modules/billing/adapters/bytePlusImageExecution.ts`
- **imageStorage.ts** (31 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **image.service.ts** (31 connections) — `src/modules/image/image.service.ts`
- **requireProviderAuthorization()** (24 connections) — `src/modules/billing/providerAuthorization.ts`
- **providerAuthorization.test.ts** (24 connections) — `src/modules/billing/providerAuthorization.test.ts`
- **googleClient.ts** (14 connections) — `src/modules/billing/adapters/googleClient.ts`
- **getAI** (13 connections) — `src/modules/billing/adapters/googleClient.ts`
- **requireAttempt()** (13 connections) — `src/modules/billing/providerAuthorization.ts`
- **shared.test.ts** (12 connections) — `src/services/ai/shared.test.ts`
- **performBytePlusImageRequest()** (11 connections) — `src/modules/billing/adapters/bytePlusImageExecution.ts`
- **withAttempt()** (11 connections) — `src/modules/billing/providerAuthorization.ts`
- **ProviderCallUnauthorizedError** (10 connections) — `src/modules/billing/providerAuthorization.ts`
- **performGoogleImageRequest()** (9 connections) — `src/modules/billing/adapters/googleImageExecution.ts`
- **performGoogleTextRequest()** (9 connections) — `src/modules/billing/adapters/googleTextExecution.ts`
- **resolveReferences()** (8 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **storeGeneratedImage()** (7 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **performFakeImageRequest()** (5 connections) — `src/modules/billing/adapters/fake.ts`
- **assertGoogleImageDelivered()** (5 connections) — `src/modules/billing/adapters/googleImageExecution.ts`
- **ImageRequestFacts** (5 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **currentProviderAuthorization()** (5 connections) — `src/modules/billing/providerAuthorization.ts`
- **ImageNotUploadedError** (4 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **storeRemoteImage()** (4 connections) — `src/modules/billing/adapters/imageStorage.ts`
- **withLegacyEntryPoint()** (4 connections) — `src/modules/billing/providerAuthorization.ts`
- *... and 37 more nodes in this community*

## Relationships

- [Pricing Adapters and Domain](Pricing_Adapters_and_Domain.md) (33 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (21 shared connections)
- [Video Service Assertions](Video_Service_Assertions.md) (14 shared connections)
- [Billing Adapters Payments](Billing_Adapters_Payments.md) (14 shared connections)
- [AI Schema and Thumbnails](AI_Schema_and_Thumbnails.md) (11 shared connections)
- [Fake Provider and Pricing](Fake_Provider_and_Pricing.md) (11 shared connections)
- [Provider Adapters](Provider_Adapters.md) (11 shared connections)
- [AI Idea and Audio Services](AI_Idea_and_Audio_Services.md) (10 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (9 shared connections)
- [Image AI Imagerequests](Image_AI_Imagerequests.md) (9 shared connections)
- [AI Text and Video Services](AI_Text_and_Video_Services.md) (4 shared connections)
- [Image Resolution](Image_Resolution.md) (4 shared connections)

## Source Files

- `src/modules/billing/adapters/bytePlusImageExecution.ts`
- `src/modules/billing/adapters/fake.ts`
- `src/modules/billing/adapters/googleClient.ts`
- `src/modules/billing/adapters/googleImageExecution.ts`
- `src/modules/billing/adapters/googleTextExecution.ts`
- `src/modules/billing/adapters/imageStorage.ts`
- `src/modules/billing/providerAuthorization.test.ts`
- `src/modules/billing/providerAuthorization.ts`
- `src/modules/image/image.service.ts`
- `src/services/ai/shared.test.ts`

## Audit Trail

- EXTRACTED: 302 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*