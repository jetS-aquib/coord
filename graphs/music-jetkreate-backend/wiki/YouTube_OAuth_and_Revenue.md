# YouTube OAuth and Revenue

> 12 nodes

## Key Concepts

- **revenueService.ts** (14 connections) — `src/services/revenueService.ts`
- **createOAuth2Client()** (4 connections) — `src/services/revenueService.ts`
- **getAuthorizedClient()** (3 connections) — `src/services/revenueService.ts`
- **exchangeCodeAndSaveTokens()** (2 connections) — `src/services/revenueService.ts`
- **fetchRevenueData()** (2 connections) — `src/services/revenueService.ts`
- **getYouTubeAuthUrl()** (2 connections) — `src/services/revenueService.ts`
- **googleapis** (2 connections) — `package.json`
- **RevenueRow** (1 connections) — `src/services/revenueService.ts`
- **RevenueSummary** (1 connections) — `src/services/revenueService.ts`
- **getOAuthStatus()** (1 connections) — `src/services/revenueService.ts`
- **SCOPES** (1 connections) — `src/services/revenueService.ts`
- **NOTE: yt-analytics-monetary.readonly is required for revenue metrics** (1 connections) — `src/services/revenueService.ts`

## Relationships

- [Auth Config and User Persistence](Auth_Config_and_User_Persistence.md) (3 shared connections)
- [Package Manifest](Package_Manifest.md) (1 shared connections)

## Source Files

- `package.json`
- `src/services/revenueService.ts`

## Audit Trail

- EXTRACTED: 19 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*