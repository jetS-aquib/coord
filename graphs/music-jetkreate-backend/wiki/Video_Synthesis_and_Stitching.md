# Video Synthesis and Stitching

> 60 nodes

## Key Concepts

- **video.controller.ts** (43 connections) — `src/modules/video/video.controller.ts`
- **synthesis.service.ts** (29 connections) — `src/modules/video/synthesis.service.ts`
- **video.routes.ts** (18 connections) — `src/modules/video/video.routes.ts`
- **SynthesisService** (16 connections) — `src/modules/video/synthesis.service.ts`
- **ref_crypto** (9 connections)
- **video-api.service.ts** (8 connections) — `src/modules/video/video-api.service.ts`
- **requestId.ts** (6 connections) — `src/shared/middleware/requestId.ts`
- **.ensureLocalFile()** (5 connections) — `src/modules/video/synthesis.service.ts`
- **.generateVeoClip()** (5 connections) — `src/modules/video/synthesis.service.ts`
- **extractLastFrameOfVideo()** (5 connections) — `src/services/ai/thumbnails.ts`
- **generateVideoFromPrompt** (5 connections) — `src/modules/video/video.controller.ts`
- **.mergeAudioByPath()** (4 connections) — `src/modules/video/synthesis.service.ts`
- **describeStyleOfImage()** (4 connections) — `src/modules/video/video.controller.ts`
- **execAsync** (4 connections) — `src/modules/video/synthesis.service.ts`
- **assembleMusicVideo** (4 connections) — `src/modules/video/video.controller.ts`
- **generateMusicStoryboardController** (4 connections) — `src/modules/video/video.controller.ts`
- **stitchClips** (4 connections) — `src/modules/video/video.controller.ts`
- **geminiService.ts** (4 connections) — `src/services/geminiService.ts`
- **userLogger.ts** (4 connections) — `src/utils/userLogger.ts`
- **.getClipDuration()** (3 connections) — `src/modules/video/synthesis.service.ts`
- **.pcmToWav()** (3 connections) — `src/modules/video/synthesis.service.ts`
- **.saveAudioToTemp()** (3 connections) — `src/modules/video/synthesis.service.ts`
- **.stripAudioFromVideo()** (3 connections) — `src/modules/video/synthesis.service.ts`
- **.synthesize()** (3 connections) — `src/modules/video/synthesis.service.ts`
- **logUserAction()** (3 connections) — `src/utils/userLogger.ts`
- *... and 35 more nodes in this community*

## Relationships

- [Audio Image and Idea Generation](Audio_Image_and_Idea_Generation.md) (17 shared connections)
- [AI Routes and Generation Quotas](AI_Routes_and_Generation_Quotas.md) (8 shared connections)
- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (6 shared connections)
- [Public Assets and Enterprise Routes](Public_Assets_and_Enterprise_Routes.md) (5 shared connections)
- [Route Registration and Middleware](Route_Registration_and_Middleware.md) (5 shared connections)
- [BytePlus Provider and Logging](BytePlus_Provider_and_Logging.md) (4 shared connections)
- [AI Model Registry and User Settings](AI_Model_Registry_and_User_Settings.md) (4 shared connections)
- [Video API Client](Video_API_Client.md) (3 shared connections)
- [Package Manifest](Package_Manifest.md) (3 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (2 shared connections)
- [Job Queue and Media Providers](Job_Queue_and_Media_Providers.md) (2 shared connections)
- [Image Generation Service](Image_Generation_Service.md) (1 shared connections)

## Source Files

- `package.json`
- `src/modules/video/synthesis.service.ts`
- `src/modules/video/video-api.service.ts`
- `src/modules/video/video.controller.ts`
- `src/modules/video/video.routes.ts`
- `src/services/ai/thumbnails.ts`
- `src/services/geminiService.ts`
- `src/shared/middleware/requestId.ts`
- `src/utils/userLogger.ts`

## Audit Trail

- EXTRACTED: 150 (94%)
- INFERRED: 10 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*