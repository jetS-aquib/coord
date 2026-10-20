# Job Queue and Media Providers

> 55 nodes

## Key Concepts

- **CommonResponse** (20 connections) — `src/services/mediaProvider.ts`
- **jobService.ts** (19 connections) — `src/services/jobs/jobService.ts`
- **MediaProvider** (16 connections) — `src/services/mediaProvider.ts`
- **jobService** (13 connections) — `src/services/jobs/jobService.ts`
- **byteplusProvider.ts** (13 connections) — `src/services/providers/byteplusProvider.ts`
- **providerFactory.ts** (13 connections) — `src/services/providers/providerFactory.ts`
- **mediaProvider.ts** (11 connections) — `src/services/mediaProvider.ts`
- **VideoGenerationOptions** (10 connections) — `src/services/mediaProvider.ts`
- **googleVeoProvider.ts** (9 connections) — `src/services/providers/googleVeoProvider.ts`
- **magicrollProvider.ts** (8 connections) — `src/services/providers/magicrollProvider.ts`
- **bytePlusProvider** (7 connections) — `src/services/providers/byteplusProvider.ts`
- **magicRollProvider** (7 connections) — `src/services/providers/magicrollProvider.ts`
- **.executeJob()** (7 connections) — `src/services/jobs/jobService.ts`
- **IGenerationJob** (6 connections) — `src/models/GenerationJob.ts`
- **googleVeoProvider** (6 connections) — `src/services/providers/googleVeoProvider.ts`
- **authHeaders()** (6 connections) — `src/services/providers/byteplusProvider.ts`
- **.generateImageToVideo()** (6 connections) — `src/services/providers/byteplusProvider.ts`
- **.generateTextToVideo()** (6 connections) — `src/services/providers/byteplusProvider.ts`
- **GenerationJob.ts** (6 connections) — `src/models/GenerationJob.ts`
- **MediaProviderName** (5 connections) — `src/services/mediaProvider.ts`
- **.generateImageToVideo()** (5 connections) — `src/services/providers/magicrollProvider.ts`
- **.generateTextToVideo()** (5 connections) — `src/services/providers/magicrollProvider.ts`
- **.getProvider()** (5 connections) — `src/services/providers/providerFactory.ts`
- **ProviderFactory** (4 connections) — `src/services/providers/providerFactory.ts`
- **getVideoPlatform()** (4 connections) — `src/config/aiModels.ts`
- *... and 30 more nodes in this community*

## Relationships

- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (12 shared connections)
- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (8 shared connections)
- [BytePlus Provider and Logging](BytePlus_Provider_and_Logging.md) (6 shared connections)
- [AI Model Registry and User Settings](AI_Model_Registry_and_User_Settings.md) (3 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (2 shared connections)
- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (2 shared connections)
- [Video Synthesis and Stitching](Video_Synthesis_and_Stitching.md) (2 shared connections)
- [Media Mongoose Models](Media_Mongoose_Models.md) (1 shared connections)

## Source Files

- `src/config/aiModels.ts`
- `src/models/GenerationJob.ts`
- `src/services/jobs/jobService.ts`
- `src/services/mediaProvider.ts`
- `src/services/providers/byteplusProvider.ts`
- `src/services/providers/googleVeoProvider.ts`
- `src/services/providers/magicrollProvider.ts`
- `src/services/providers/providerFactory.ts`

## Audit Trail

- EXTRACTED: 163 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*