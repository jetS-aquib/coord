# Agent

> 12 nodes

## Key Concepts

- **agent/instrumentation.ts** (12 connections) — `apps/iris/agent/instrumentation.ts`
- **PostHogSpanAttributes** (5 connections) — `apps/iris/agent/instrumentation.ts`
- **.onStart()** (2 connections) — `apps/iris/agent/instrumentation.ts`
- **@opentelemetry/sdk-trace-base** (2 connections) — `apps/iris/package.json`
- **@posthog/ai** (2 connections) — `apps/iris/package.json`
- **@vercel/otel** (2 connections) — `apps/iris/package.json`
- **.forceFlush()** (1 connections) — `apps/iris/agent/instrumentation.ts`
- **.onEnd()** (1 connections) — `apps/iris/agent/instrumentation.ts`
- **.shutdown()** (1 connections) — `apps/iris/agent/instrumentation.ts`
- **host** (1 connections) — `apps/iris/agent/instrumentation.ts`
- **POSTHOG_ATTRIBUTES** (1 connections) — `apps/iris/agent/instrumentation.ts`
- **projectToken** (1 connections) — `apps/iris/agent/instrumentation.ts`

## Relationships

- [Iris](Iris.md) (3 shared connections)
- [Lib Posthog](Lib_Posthog.md) (2 shared connections)
- [Lib Chat](Lib_Chat.md) (2 shared connections)
- [Agent Tools](Agent_Tools.md) (1 shared connections)
- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (1 shared connections)

## Source Files

- `apps/iris/agent/instrumentation.ts`
- `apps/iris/package.json`

## Audit Trail

- EXTRACTED: 20 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*