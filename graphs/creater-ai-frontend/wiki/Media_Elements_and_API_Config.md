# Media Elements and API Config

> 32 nodes · cohesion 0.09

## Key Concepts

- **apiClient.ts** (50 connections) — `src/services/apiClient.ts`
- **generationRequests.test.ts** (27 connections) — `test/generationRequests.test.ts`
- **Elements.tsx** (19 connections) — `src/features/media/Elements.tsx`
- **api.ts** (17 connections) — `src/config/api.ts`
- **uploadFile()** (17 connections) — `src/services/uploadService.ts`
- **services/audioService.ts** (14 connections) — `src/services/audioService.ts`
- **imageService.ts** (11 connections) — `src/services/imageService.ts`
- **uploadService.ts** (11 connections) — `src/services/uploadService.ts`
- **Elements()** (6 connections) — `src/features/media/Elements.tsx`
- **postAudioGeneration()** (6 connections) — `src/services/apiClient.ts`
- **generateImage()** (6 connections) — `src/services/imageService.ts`
- **generateAudio()** (5 connections) — `src/services/ai/audioService.ts`
- **storageDB.ts** (5 connections) — `src/services/storageDB.ts`
- **responseError()** (4 connections) — `src/services/apiClient.ts`
- **API_URL** (3 connections) — `src/config/api.ts`
- **GenerationRequestOptions** (3 connections) — `src/services/apiClient.ts`
- **ref_node_crypto** (2 connections)
- **transcribeAudio()** (2 connections) — `src/services/audioService.ts`
- **ElementItem** (1 connections) — `src/features/media/Elements.tsx`
- **ApiRequestOptions** (1 connections) — `src/services/apiClient.ts`
- **AudioVoiceSettings** (1 connections) — `src/services/audioService.ts`
- **GenerateAudioPayload** (1 connections) — `src/services/audioService.ts`
- **GenerateImagePayload** (1 connections) — `src/services/imageService.ts`
- **db** (1 connections) — `src/services/storageDB.ts`
- **{ dispatch, toastError, toastSuccess }** (1 connections) — `test/generationRequests.test.ts`
- *... and 7 more nodes in this community*

## Relationships

- [AI Model Registry and Media](AI_Model_Registry_and_Media.md) (18 shared connections)
- [AI Video and Thumbnail Services](AI_Video_and_Thumbnail_Services.md) (17 shared connections)
- [Shared AI Service Layer](Shared_AI_Service_Layer.md) (15 shared connections)
- [Ideas Workspace and Prompts](Ideas_Workspace_and_Prompts.md) (9 shared connections)
- [Audio Generation](Audio_Generation.md) (8 shared connections)
- [Video Dashboard and Brand Kits](Video_Dashboard_and_Brand_Kits.md) (8 shared connections)
- [Dashboard and Channel Onboarding](Dashboard_and_Channel_Onboarding.md) (7 shared connections)
- [Image Generation](Image_Generation.md) (7 shared connections)
- [Auth, Firebase and Env Config](Auth,_Firebase_and_Env_Config.md) (5 shared connections)
- [Store Wiring and React Entry](Store_Wiring_and_React_Entry.md) (5 shared connections)
- [API and Billing Error Types](API_and_Billing_Error_Types.md) (5 shared connections)
- [Idea to Video Pipeline](Idea_to_Video_Pipeline.md) (4 shared connections)

## Source Files

- `src/config/api.ts`
- `src/features/media/Elements.tsx`
- `src/services/ai/audioService.ts`
- `src/services/apiClient.ts`
- `src/services/audioService.ts`
- `src/services/imageService.ts`
- `src/services/storageDB.ts`
- `src/services/uploadService.ts`
- `test/generationRequests.test.ts`

## Audit Trail

- EXTRACTED: 177 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*