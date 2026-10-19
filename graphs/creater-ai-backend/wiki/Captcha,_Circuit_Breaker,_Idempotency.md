# Captcha, Circuit Breaker, Idempotency

> 38 nodes · cohesion 0.08

## Key Concepts

- **src/index.ts** (54 connections) — `src/index.ts`
- **logger.ts** (38 connections) — `src/shared/logger.ts`
- **logger** (37 connections) — `src/shared/logger.ts`
- **registerRoutes()** (21 connections) — `src/routes/index.ts`
- **health.routes.ts** (13 connections) — `src/routes/health.routes.ts`
- **connectMongo()** (12 connections) — `src/index.ts`
- **receiptSweep.ts** (11 connections) — `src/shared/idempotency/receiptSweep.ts`
- **ref_crypto** (10 connections)
- **circuitBreaker.ts** (8 connections) — `src/services/providers/circuitBreaker.ts`
- **captchaService.ts** (7 connections) — `src/shared/services/captchaService.ts`
- **requestId.ts** (6 connections) — `src/shared/middleware/requestId.ts`
- **userLogMiddleware.ts** (6 connections) — `src/shared/middleware/userLogMiddleware.ts`
- **requestLogger.ts** (5 connections) — `src/shared/middleware/requestLogger.ts`
- **captchaService** (5 connections) — `src/shared/services/captchaService.ts`
- **startOutboxLoop()** (5 connections) — `src/workers/billing.worker.ts`
- **startReceiptSweep()** (4 connections) — `src/shared/idempotency/receiptSweep.ts`
- **sweepGenerationReceipts()** (4 connections) — `src/shared/idempotency/receiptSweep.ts`
- **userLogMiddleware()** (4 connections) — `src/shared/middleware/userLogMiddleware.ts`
- **stopReceiptSweep()** (3 connections) — `src/index.ts`
- **outboxInlineEnabled()** (3 connections) — `src/workers/billing.worker.ts`
- **backfillGenerationLogs()** (2 connections) — `src/index.ts`
- **shutdown()** (2 connections) — `src/index.ts`
- **generationOperations** (2 connections) — `src/shared/idempotency/operations.ts`
- **requestIdMiddleware()** (2 connections) — `src/shared/middleware/requestId.ts`
- **requestLogger()** (2 connections) — `src/shared/middleware/requestLogger.ts`
- *... and 13 more nodes in this community*

## Relationships

- [Idempotency Receipts](Idempotency_Receipts.md) (11 shared connections)
- [Assets, Brand Kits and Elements](Assets,_Brand_Kits_and_Elements.md) (11 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (9 shared connections)
- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (8 shared connections)
- [Auth Middleware and Signatures](Auth_Middleware_and_Signatures.md) (8 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (7 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (7 shared connections)
- [Error Handling Middleware](Error_Handling_Middleware.md) (5 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (5 shared connections)
- [Job Transitions](Job_Transitions.md) (4 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (4 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (4 shared connections)

## Source Files

- `src/index.ts`
- `src/routes/health.routes.ts`
- `src/routes/index.ts`
- `src/services/providers/circuitBreaker.ts`
- `src/shared/idempotency/operations.ts`
- `src/shared/idempotency/receiptSweep.ts`
- `src/shared/logger.ts`
- `src/shared/middleware/requestId.ts`
- `src/shared/middleware/requestLogger.ts`
- `src/shared/middleware/userLogMiddleware.ts`
- `src/shared/services/captchaService.ts`
- `src/workers/billing.worker.ts`

## Audit Trail

- EXTRACTED: 211 (96%)
- INFERRED: 9 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*