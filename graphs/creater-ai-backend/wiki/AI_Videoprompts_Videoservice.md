# AI Videoprompts Videoservice

> 25 nodes · cohesion 0.18

## Key Concepts

- **videoService.ts** (55 connections) — `src/services/ai/videoService.ts`
- **generateVideoClipFromImage()** (13 connections) — `src/services/ai/videoService.ts`
- **generateVideoClipFromPrompt()** (13 connections) — `src/services/ai/videoService.ts`
- **videoPrompts.ts** (12 connections) — `src/services/ai/videoPrompts.ts`
- **enrichVeoPrompt()** (11 connections) — `src/services/ai/videoPrompts.ts`
- **submitVeoOperation()** (10 connections) — `src/modules/billing/adapters/googleVeoExecution.ts`
- **logTokenUsageDirect()** (10 connections) — `src/utils/tokenLogger.ts`
- **generateVeoVideo()** (8 connections) — `src/services/ai/videoService.ts`
- **downloadVeoOutput()** (6 connections) — `src/modules/billing/adapters/googleVeoExecution.ts`
- **veoClipDuration()** (6 connections) — `src/services/ai/videoPrompts.ts`
- **enhanceVideoPrompt()** (6 connections) — `src/services/ai/videoService.ts`
- **veoVideoUri()** (5 connections) — `src/modules/billing/adapters/googleVeoExecution.ts`
- **sanitizeVideoPrompt()** (5 connections) — `src/services/ai/videoPrompts.ts`
- **waitForVeoOperation()** (5 connections) — `src/services/ai/videoService.ts`
- **lipSyncInstruction()** (3 connections) — `src/services/ai/videoPrompts.ts`
- **parseScriptDialogue()** (3 connections) — `src/services/ai/videoPrompts.ts`
- **autoGenerateCastRequest()** (3 connections) — `src/services/ai/videoService.ts`
- **enhanceVideoPromptRequest()** (3 connections) — `src/services/ai/videoService.ts`
- **visualPromptsRequest()** (3 connections) — `src/services/ai/videoService.ts`
- **consistencyBlock()** (2 connections) — `src/services/ai/videoPrompts.ts`
- **negativePromptBlock()** (2 connections) — `src/services/ai/videoPrompts.ts`
- **styleBlock()** (2 connections) — `src/services/ai/videoPrompts.ts`
- **CastMember** (2 connections) — `src/services/ai/videoService.ts`
- **NO_TEXT_INSTRUCTION** (1 connections) — `src/services/ai/videoPrompts.ts`
- **VEO_IMAGE_CONTINUITY_INSTRUCTION** (1 connections) — `src/services/ai/videoPrompts.ts`

## Relationships

- [AI Idea and Audio Services](AI_Idea_and_Audio_Services.md) (24 shared connections)
- [AI Text and Video Services](AI_Text_and_Video_Services.md) (15 shared connections)
- [Provider Adapters](Provider_Adapters.md) (10 shared connections)
- [Video Synthesis and Capability](Video_Synthesis_and_Capability.md) (9 shared connections)
- [Image Resolution](Image_Resolution.md) (7 shared connections)
- [AI Schema and Thumbnails](AI_Schema_and_Thumbnails.md) (7 shared connections)
- [Video Service Assertions](Video_Service_Assertions.md) (5 shared connections)
- [Provider Authorization and Images](Provider_Authorization_and_Images.md) (3 shared connections)
- [Usage and Token Logging](Usage_and_Token_Logging.md) (3 shared connections)
- [User Settings and Model Config](User_Settings_and_Model_Config.md) (1 shared connections)

## Source Files

- `src/modules/billing/adapters/googleVeoExecution.ts`
- `src/services/ai/videoPrompts.ts`
- `src/services/ai/videoService.ts`
- `src/utils/tokenLogger.ts`

## Audit Trail

- EXTRACTED: 137 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*