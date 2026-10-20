# Lib Posthog

> 29 nodes

## Key Concepts

- **captureServerEvent()** (23 connections) — `apps/iris/lib/posthog/server.ts`
- **attribution.ts** (22 connections) — `apps/iris/lib/billing/attribution.ts`
- **generation-events.ts** (18 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **ai-events.ts** (11 connections) — `apps/iris/lib/posthog/ai-events.ts`
- **llmRate** (8 connections) — `apps/iris/lib/billing/pricing.ts`
- **UsageSurface** (8 connections) — `apps/iris/lib/db/schema.ts`
- **jobAttribution()** (8 connections) — `apps/iris/lib/billing/attribution.ts`
- **captureGenerationSettled()** (8 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **attribution.test.mts** (7 connections) — `apps/iris/lib/billing/attribution.test.mts`
- **jobProperties()** (6 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **captureMeteredModelCall()** (5 connections) — `apps/iris/lib/posthog/ai-events.ts`
- **captureGenerationSubmitted()** (5 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **posthog.test.mts** (5 connections) — `apps/iris/lib/posthog/posthog.test.mts`
- **ServerEventProperties** (4 connections) — `apps/iris/lib/posthog/server.ts`
- **scriptStageAttribution()** (4 connections) — `apps/iris/lib/billing/attribution.ts`
- **meteredModelCall()** (4 connections) — `apps/iris/lib/posthog/ai-events.ts`
- **captureAudioToolRun()** (4 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **string()** (3 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **reportLimited()** (3 connections) — `apps/iris/lib/rate-limit.ts`
- **UsageEventRow** (2 connections) — `apps/iris/lib/db/schema.ts`
- **isUsageAgent()** (2 connections) — `apps/iris/lib/billing/attribution.ts`
- **isUsageSurface()** (2 connections) — `apps/iris/lib/billing/attribution.ts`
- **msBetween()** (2 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **number()** (2 connections) — `apps/iris/lib/posthog/generation-events.ts`
- **UsageAttribution** (1 connections) — `apps/iris/lib/billing/attribution.ts`
- *... and 4 more nodes in this community*

## Relationships

- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (25 shared connections)
- [Studio Generation Jobs](Studio_Generation_Jobs.md) (15 shared connections)
- [Lib Posthog](Lib_Posthog.md) (6 shared connections)
- [Billing Razorpay](Billing_Razorpay.md) (6 shared connections)
- [Lib Db](Lib_Db.md) (5 shared connections)
- [Lib Rollstock](Lib_Rollstock.md) (4 shared connections)
- [Lib Projects](Lib_Projects.md) (3 shared connections)
- [Remix Render Runs](Remix_Render_Runs.md) (3 shared connections)
- [Agent](Agent.md) (2 shared connections)
- [Atlas Model Catalog](Atlas_Model_Catalog.md) (2 shared connections)
- [Atlas Features And Search](Atlas_Features_And_Search.md) (2 shared connections)
- [Lib Chat](Lib_Chat.md) (1 shared connections)

## Source Files

- `apps/iris/lib/billing/attribution.test.mts`
- `apps/iris/lib/billing/attribution.ts`
- `apps/iris/lib/billing/pricing.ts`
- `apps/iris/lib/db/schema.ts`
- `apps/iris/lib/posthog/ai-events.ts`
- `apps/iris/lib/posthog/generation-events.ts`
- `apps/iris/lib/posthog/posthog.test.mts`
- `apps/iris/lib/posthog/server.ts`
- `apps/iris/lib/rate-limit.ts`

## Audit Trail

- EXTRACTED: 123 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*