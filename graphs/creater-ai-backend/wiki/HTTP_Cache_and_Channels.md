# HTTP Cache and Channels

> 51 nodes · cohesion 0.08

## Key Concepts

- **youtube.ts** (34 connections) — `src/routes/youtube.ts`
- **youtubeService.ts** (32 connections) — `src/services/youtubeService.ts`
- **revenueService.ts** (17 connections) — `src/services/revenueService.ts`
- **fullSyncChannelVideos()** (10 connections) — `src/services/youtubeService.ts`
- **getChannelData()** (9 connections) — `src/services/youtubeService.ts`
- **logQuota()** (9 connections) — `src/services/youtubeService.ts`
- **ChannelSync.ts** (7 connections) — `src/models/ChannelSync.ts`
- **incrementalSyncChannelVideos()** (7 connections) — `src/services/youtubeService.ts`
- **youtubeRequest()** (7 connections) — `src/services/youtubeService.ts`
- **Video.ts** (6 connections) — `src/models/Video.ts`
- **getVideoData()** (6 connections) — `src/services/youtubeService.ts`
- **Channel.ts** (5 connections) — `src/models/Channel.ts`
- **getChannelAnalytics()** (5 connections) — `src/services/youtubeService.ts`
- **httpCache.ts** (5 connections) — `src/shared/middleware/httpCache.ts`
- **createOAuth2Client()** (4 connections) — `src/services/revenueService.ts`
- **getYouTubeAuthUrl()** (4 connections) — `src/services/revenueService.ts`
- **fetchAndCacheChannel()** (4 connections) — `src/services/youtubeService.ts`
- **fetchAndCacheVideo()** (4 connections) — `src/services/youtubeService.ts`
- **fetchVideoIdsFromPlaylist()** (4 connections) — `src/services/youtubeService.ts`
- **findChannelByHandle()** (4 connections) — `src/services/youtubeService.ts`
- **getVideoAnalytics()** (4 connections) — `src/services/youtubeService.ts`
- **router** (3 connections) — `src/routes/youtube.ts`
- **exchangeCodeAndSaveTokens()** (3 connections) — `src/services/revenueService.ts`
- **fetchRevenueData()** (3 connections) — `src/services/revenueService.ts`
- **getAuthorizedClient()** (3 connections) — `src/services/revenueService.ts`
- *... and 26 more nodes in this community*

## Relationships

- [Error Handling Middleware](Error_Handling_Middleware.md) (7 shared connections)
- [Assets, Brand Kits and Elements](Assets,_Brand_Kits_and_Elements.md) (4 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (4 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (3 shared connections)
- [Mongoose Models](Mongoose_Models.md) (3 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (3 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (3 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (2 shared connections)
- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (2 shared connections)
- [Package Manifest](Package_Manifest.md) (1 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (1 shared connections)

## Source Files

- `package.json`
- `src/models/Channel.ts`
- `src/models/ChannelSync.ts`
- `src/models/Video.ts`
- `src/routes/youtube.ts`
- `src/services/revenueService.ts`
- `src/services/youtubeService.ts`
- `src/shared/middleware/httpCache.ts`

## Audit Trail

- EXTRACTED: 137 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*