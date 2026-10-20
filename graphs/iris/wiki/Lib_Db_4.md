# Lib Db

> 31 nodes

## Key Concepts

- **generation-queries.ts** (49 connections) — `apps/iris/lib/db/generation-queries.ts`
- **legacy-extract.ts** (20 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **listGenerationsByUser()** (10 connections) — `apps/iris/lib/db/generation-queries.ts`
- **extractLegacyGenerations()** (10 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **saveGenerations()** (8 connections) — `apps/iris/lib/db/generation-queries.ts`
- **listLatestGenerationsForAgentSession()** (7 connections) — `apps/iris/lib/db/generation-queries.ts`
- **isMissingTableError()** (6 connections) — `apps/iris/lib/db/generation-queries.ts`
- **listGenerationsForChat()** (5 connections) — `apps/iris/lib/db/generation-queries.ts`
- **normalizeKind()** (5 connections) — `apps/iris/lib/db/generation-queries.ts`
- **collectMediaUrls()** (5 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **readDeepString()** (5 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **listToolAudio()** (4 connections) — `apps/iris/lib/db/generation-queries.ts`
- **ChatEvent** (3 connections) — `apps/iris/lib/db/schema.ts`
- **isRecord()** (3 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **mediaKindOf()** (3 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **decodeCursor()** (2 connections) — `apps/iris/lib/db/generation-queries.ts`
- **encodeCursor()** (2 connections) — `apps/iris/lib/db/generation-queries.ts`
- **parseDate()** (2 connections) — `apps/iris/lib/db/generation-queries.ts`
- **resolveOwnedChatId()** (2 connections) — `apps/iris/lib/db/generation-queries.ts`
- **selectGenerationPage()** (2 connections) — `apps/iris/lib/db/generation-queries.ts`
- **hashUrl()** (2 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **isAssetListingTool()** (2 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **normalizeUrl()** (2 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **withVideoPosters()** (2 connections) — `apps/iris/lib/generations/legacy-extract.ts`
- **GenerationPage** (1 connections) — `apps/iris/lib/db/generation-queries.ts`
- *... and 6 more nodes in this community*

## Relationships

- [Core API Routes](Core_API_Routes.md) (7 shared connections)
- [Lib Share](Lib_Share.md) (5 shared connections)
- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (5 shared connections)
- [Lib Db](Lib_Db.md) (4 shared connections)
- [Generation Media Tiles](Generation_Media_Tiles.md) (4 shared connections)
- [Route Loading States](Route_Loading_States.md) (3 shared connections)
- [Lib Projects](Lib_Projects.md) (3 shared connections)
- [Kreate Tool Pages](Kreate_Tool_Pages.md) (3 shared connections)
- [Lib Storage](Lib_Storage.md) (3 shared connections)
- [Atlas Features And Search](Atlas_Features_And_Search.md) (3 shared connections)
- [Lib Generations](Lib_Generations.md) (2 shared connections)
- [Components Generation](Components_Generation.md) (2 shared connections)

## Source Files

- `apps/iris/lib/db/generation-queries.ts`
- `apps/iris/lib/db/schema.ts`
- `apps/iris/lib/generations/legacy-extract.ts`

## Audit Trail

- EXTRACTED: 110 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*