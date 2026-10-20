# Lib Capacity

> 40 nodes

## Key Concepts

- **gate.ts** (29 connections) — `apps/iris/lib/capacity/gate.ts`
- **wait.ts** (22 connections) — `apps/iris/lib/capacity/wait.ts`
- **queue-smoke.mts** (18 connections) — `apps/iris/scripts/queue-smoke.mts`
- **resolveLimits()** (13 connections) — `apps/iris/lib/capacity/limits.ts`
- **redisCall()** (13 connections) — `apps/iris/lib/redis.ts`
- **acquireCapacity()** (10 connections) — `apps/iris/lib/capacity/gate.ts`
- **releaseCapacity()** (10 connections) — `apps/iris/lib/capacity/gate.ts`
- **waitForCapacity()** (9 connections) — `apps/iris/lib/capacity/wait.ts`
- **capacitySnapshot** (8 connections) — `apps/iris/lib/capacity/gate.ts`
- **noteProviderError()** (8 connections) — `apps/iris/lib/capacity/wait.ts`
- **model-middleware.ts** (8 connections) — `apps/iris/lib/capacity/model-middleware.ts`
- **redis.ts** (8 connections) — `apps/iris/lib/redis.ts`
- **coolDown()** (7 connections) — `apps/iris/lib/capacity/gate.ts`
- **scopeKey()** (6 connections) — `apps/iris/lib/capacity/gate.ts`
- **renewCapacity()** (5 connections) — `apps/iris/lib/capacity/gate.ts`
- **scopesFor()** (5 connections) — `apps/iris/lib/capacity/gate.ts`
- **CapacityBusyError** (4 connections) — `apps/iris/lib/capacity/wait.ts`
- **capacityMiddleware()** (4 connections) — `apps/iris/lib/capacity/model-middleware.ts`
- **CapacityTarget** (3 connections) — `apps/iris/lib/capacity/gate.ts`
- **windowKeys()** (3 connections) — `apps/iris/lib/capacity/gate.ts`
- **providerBackoffMs()** (3 connections) — `apps/iris/lib/capacity/wait.ts`
- **getRedis()** (3 connections) — `apps/iris/lib/redis.ts`
- **@upstash/redis** (3 connections) — `apps/iris/package.json`
- **limitArg()** (2 connections) — `apps/iris/lib/capacity/gate.ts`
- **windowTtls()** (2 connections) — `apps/iris/lib/capacity/gate.ts`
- *... and 15 more nodes in this community*

## Relationships

- [Studio Generation Jobs](Studio_Generation_Jobs.md) (22 shared connections)
- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (21 shared connections)
- [Lib Db](Lib_Db.md) (8 shared connections)
- [Account And Billing Queries](Account_And_Billing_Queries.md) (4 shared connections)
- [Atlas Features And Search](Atlas_Features_And_Search.md) (4 shared connections)
- [Db Atlas](Db_Atlas.md) (3 shared connections)
- [Atlas Model Catalog](Atlas_Model_Catalog.md) (2 shared connections)
- [Lib Chat](Lib_Chat.md) (2 shared connections)
- [Lib Studio](Lib_Studio.md) (2 shared connections)
- [Lib Voice](Lib_Voice.md) (1 shared connections)
- [Billing Razorpay](Billing_Razorpay.md) (1 shared connections)
- [Scripts](Scripts.md) (1 shared connections)

## Source Files

- `apps/iris/lib/capacity/gate.ts`
- `apps/iris/lib/capacity/limits.ts`
- `apps/iris/lib/capacity/model-middleware.ts`
- `apps/iris/lib/capacity/wait.ts`
- `apps/iris/lib/redis.ts`
- `apps/iris/package.json`
- `apps/iris/scripts/queue-smoke.mts`

## Audit Trail

- EXTRACTED: 148 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*