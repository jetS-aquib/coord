# Graph Report - music-jetkreate-backend  (2026-10-19)

## Corpus Check
- 4 files · ~69,531 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 722 nodes · 1760 edges · 44 communities (27 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Audio Image and Idea Generation
- Auth Config and User Persistence
- Video Synthesis and Stitching
- Job Queue and Media Providers
- AI Routes and Generation Quotas
- Auth Controller and Schemas
- BytePlus Provider and Logging
- AI Model Registry and User Settings
- Runtime Dependencies
- Image Generation Service
- Package Manifest
- Public Assets and Enterprise Routes
- App Bootstrap and Logging
- Provider Circuit Breaker
- Route Registration and Middleware
- Podcast Controller
- YouTube OAuth and Revenue
- Media Mongoose Models
- Video API Client
- TypeScript Build Config
- Dev Dependencies
- Asset Management
- Gemini SDK Debug Scripts
- NPM Scripts
- Podcast Model and Repository
- Element CRUD and GCS
- Podcast Service
- Music Video Module
- Draft Video Storage
- Error Handler Middleware
- HTTP Cache Middleware
- Pagination Helpers
- Audit Log Model
- Brand Kit Model
- Channel Model
- Channel Sync Model
- Generation Log Model
- Idea Model
- Quota Log Model
- User Generation Quota Model
- README Placeholder

## God Nodes (most connected - your core abstractions)
1. `logTokenUsage()` - 39 edges
2. `express` - 38 edges
3. `mongoose` - 25 edges
4. `resolveTextModel()` - 23 edges
5. `resolveVideoModel()` - 22 edges
6. `uploadFileToGCS()` - 22 edges
7. `CommonResponse` - 20 edges
8. `resolveImageModel()` - 18 edges
9. `AppError` - 16 edges
10. `MediaProvider` - 16 edges

## Surprising Connections (you probably didn't know these)
- `magicrollProvider` --implements--> `MediaProvider`  [EXTRACTED]
  src/services/magicrollService.ts → src/services/mediaProvider.ts
- `validate()` --calls--> `ValidationError`  [EXTRACTED]
  src/shared/middleware/validate.ts → src/shared/errors/AppError.ts
- `downloadVideo()` --calls--> `uploadFileToGCS()`  [EXTRACTED]
  src/services/magicrollService.ts → src/shared/gcs.ts
- `generateMagicrollVideoFromImage()` --calls--> `resolveVideoModel()`  [EXTRACTED]
  src/services/magicrollService.ts → src/config/aiModels.ts
- `generateMagicrollVideoFromPrompt()` --calls--> `resolveVideoModel()`  [EXTRACTED]
  src/services/magicrollService.ts → src/config/aiModels.ts

## Import Cycles
- None detected.

## Communities (44 total, 17 thin omitted)

### Community 0 - "Audio Image and Idea Generation"
Cohesion: 0.10
Nodes (70): getImagePlatform(), getVideoModelDurationLimits(), resolveImageModel(), resolveTextModel(), resolveVideoModel(), resolveVisionModel(), execPromise, generateAudio() (+62 more)

### Community 1 - "Auth Config and User Persistence"
Cohesion: 0.06
Nodes (41): bcryptjs, firebase-admin, Env, envSchema, parsed, ensureUserExistsInFirebase(), privateKey, verifyIdToken() (+33 more)

### Community 2 - "Video Synthesis and Stitching"
Cohesion: 0.06
Nodes (30): express-rate-limit, fluent-ffmpeg, jsonwebtoken, execAsync, SynthesisService, ClipInput, VideoJobResponse, VideoRequestContext (+22 more)

### Community 3 - "Job Queue and Media Providers"
Cohesion: 0.08
Nodes (20): getVideoPlatform(), GenerationJobSchema, GenerationJobStatus, GenerationJobType, IGenerationJob, CreateJobInput, JobEventEmitter, jobService (+12 more)

### Community 4 - "AI Routes and Generation Quotas"
Cohesion: 0.09
Nodes (33): @google-cloud/storage, GENERATION_LIMITS, generationLimit(), GenerationType, getQuotaUsage(), getUserEffectiveLimits(), getUserProviderPricing(), getUserQueryConditions() (+25 more)

### Community 5 - "Auth Controller and Schemas"
Cohesion: 0.08
Nodes (28): authService, changePassword, createUser, findOneUser, firebaseVerify, forgotPassword, googleAuth, login (+20 more)

### Community 6 - "BytePlus Provider and Logging"
Cohesion: 0.10
Nodes (29): authHeaders(), BytePlusContentItem, BytePlusTask, downloadVideo(), extractVideoUrl(), generateBytePlusVideoFromImage(), generateBytePlusVideoFromPrompt(), getApiKey() (+21 more)

### Community 7 - "AI Model Registry and User Settings"
Cohesion: 0.17
Nodes (20): AUDIO_MODEL_MAP, AudioModelKey, DEFAULT_AUDIO_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, DEFAULT_VIDEO_MODEL, DEFAULT_VISION_MODEL, IMAGE_MODEL_MAP (+12 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit, firebase-admin (+14 more)

### Community 9 - "Image Generation Service"
Cohesion: 0.17
Nodes (17): ACCEPTED_MODELS, generateImage, AspectRatio, GenerateImageOptions, GenerateImageResult, generateImages(), generateWithNanoBanana(), generateWithNanoBanana2Lite() (+9 more)

### Community 10 - "Package Manifest"
Cohesion: 0.11
Nodes (18): main, name, version, multer, pino-pretty, sharp, ts-node-dev, @types/bcryptjs (+10 more)

### Community 11 - "Public Assets and Enterprise Routes"
Cohesion: 0.19
Nodes (11): express, zod, AuthenticatedRequest, getApprovedPublicAssets, getBalance, router, imageToVideoJobSchema, router (+3 more)

### Community 12 - "App Bootstrap and Logging"
Cohesion: 0.17
Nodes (12): compression, cors, helmet, pino, ALLOWED_ORIGINS, app, backfillGenerationLogs(), connectMongo() (+4 more)

### Community 13 - "Provider Circuit Breaker"
Cohesion: 0.20
Nodes (5): CircuitBreakerError, CircuitBreakerOptions, CircuitState, CircuitStats, providerCircuitBreaker

### Community 14 - "Route Registration and Middleware"
Cohesion: 0.21
Nodes (9): router, router, largeBody, router, router, router, registerRoutes(), requireSignature() (+1 more)

### Community 15 - "Podcast Controller"
Cohesion: 0.27
Nodes (11): AuthenticatedRequest, createPodcast, deletePodcast, expand, generate, generatePodcastAudio, generateScript, getById (+3 more)

### Community 16 - "YouTube OAuth and Revenue"
Cohesion: 0.23
Nodes (9): googleapis, createOAuth2Client(), exchangeCodeAndSaveTokens(), fetchRevenueData(), getAuthorizedClient(), getYouTubeAuthUrl(), RevenueRow, RevenueSummary (+1 more)

### Community 17 - "Media Mongoose Models"
Cohesion: 0.17
Nodes (7): mongoose, AssetSchema, ElementSchema, MusicVideoSchema, IVideo, VideoSchema, router

### Community 19 - "TypeScript Build Config"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 20 - "Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, ts-node-dev, @types/bcryptjs, @types/compression, @types/cors, @types/express, @types/helmet, @types/jsonwebtoken (+3 more)

### Community 21 - "Asset Management"
Cohesion: 0.29
Nodes (8): PublicAssetSchema, AuthenticatedRequest, createAsset, deleteAsset, getAssets, getPublicAssets, toggleAssetPublicStatus, updatePublicAssetStatus

### Community 22 - "Gemini SDK Debug Scripts"
Cohesion: 0.20
Nodes (4): { GoogleGenAI }, { GoogleGenAI }, dotenv, @google/genai

### Community 23 - "NPM Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, start, test, test:load, test:load:flow, test:load:smoke (+2 more)

### Community 24 - "Podcast Model and Repository"
Cohesion: 0.20
Nodes (3): PodcastSchema, podcastRepo, PodcastRepository

### Community 25 - "Element CRUD and GCS"
Cohesion: 0.36
Nodes (7): AuthenticatedRequest, createElement, deleteElement, getElements, updateElement, router, deleteFileFromGCS()

### Community 27 - "Music Video Module"
Cohesion: 0.48
Nodes (5): deleteMusicVideo, getMusicVideo, listMusicVideos, saveMusicVideo, router

### Community 29 - "Error Handler Middleware"
Cohesion: 0.50
Nodes (3): errorHandler(), ZodIssue, ZodLikeError

## Knowledge Gaps
- **14 isolated node(s):** `pino-pretty`, `ts-node-dev`, `@types/bcryptjs`, `@types/compression`, `@types/cors` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 235 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `Public Assets and Enterprise Routes` to `Auth Config and User Persistence`, `Video Synthesis and Stitching`, `AI Routes and Generation Quotas`, `Auth Controller and Schemas`, `AI Model Registry and User Settings`, `Image Generation Service`, `Package Manifest`, `App Bootstrap and Logging`, `Route Registration and Middleware`, `Podcast Controller`, `Media Mongoose Models`, `Asset Management`, `Element CRUD and GCS`, `Music Video Module`, `Error Handler Middleware`, `HTTP Cache Middleware`, `Pagination Helpers`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **What connects `pino-pretty`, `ts-node-dev`, `@types/bcryptjs` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Audio Image and Idea Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.09569633787757284 - nodes in this community are weakly interconnected._
- **Why does `mongoose` connect `Media Mongoose Models` to `Audio Image and Idea Generation`, `Auth Config and User Persistence`, `Job Queue and Media Providers`, `AI Routes and Generation Quotas`, `BytePlus Provider and Logging`, `AI Model Registry and User Settings`, `Package Manifest`, `App Bootstrap and Logging`, `Route Registration and Middleware`, `Asset Management`, `Podcast Model and Repository`, `Draft Video Storage`, `Audit Log Model`, `Brand Kit Model`, `Channel Model`, `Channel Sync Model`, `Generation Log Model`, `Idea Model`, `Quota Log Model`, `User Generation Quota Model`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `Auth Config and User Persistence` be split into smaller, more focused modules?**
  _Cohesion score 0.059319482083709726 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Manifest`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Video Synthesis and Stitching` be split into smaller, more focused modules?**
  _Cohesion score 0.05593220338983051 - nodes in this community are weakly interconnected._