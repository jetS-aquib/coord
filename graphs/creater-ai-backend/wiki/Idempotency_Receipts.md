# Idempotency Receipts

> 29 nodes · cohesion 0.13

## Key Concepts

- **Env** (65 connections) — `src/config/env.ts`
- **integration/idempotency.test.ts** (44 connections) — `test/integration/idempotency.test.ts`
- **idempotency.ts** (29 connections) — `src/shared/middleware/idempotency.ts`
- **receipts.ts** (27 connections) — `src/shared/idempotency/receipts.ts`
- **ref_node_http** (22 connections)
- **middleware/idempotency.test.ts** (18 connections) — `src/shared/middleware/idempotency.test.ts`
- **idempotent()** (13 connections) — `src/shared/middleware/idempotency.ts`
- **scopeLocks** (9 connections) — `src/modules/billing/atomic.ts`
- **claimGenerationCommand()** (8 connections) — `src/shared/idempotency/receipts.ts`
- **jobResponse.ts** (6 connections) — `src/services/jobs/jobResponse.ts`
- **operations.ts** (6 connections) — `src/shared/idempotency/operations.ts`
- **acceptedJobResponse()** (5 connections) — `src/services/jobs/jobResponse.ts`
- **completeGenerationCommand()** (5 connections) — `src/shared/idempotency/receipts.ts`
- **generationPayloadHash()** (4 connections) — `src/shared/middleware/idempotency.ts`
- **CommandReceiptRecord** (3 connections) — `src/models/CommandReceipt.ts`
- **CommandResult** (3 connections) — `src/models/CommandReceipt.ts`
- **createsGenerationJob()** (3 connections) — `src/shared/idempotency/operations.ts`
- **GenerationOperation** (3 connections) — `src/shared/idempotency/operations.ts`
- **isDuplicateKey()** (2 connections) — `src/shared/idempotency/receipts.ts`
- **replay()** (2 connections) — `src/shared/middleware/idempotency.ts`
- **Claim** (1 connections) — `src/shared/idempotency/receipts.ts`
- **PENDING_RECOVERY_MS** (1 connections) — `src/shared/idempotency/receipts.ts`
- **ReceiptScope** (1 connections) — `src/shared/idempotency/receipts.ts`
- **Express** (1 connections) — `src/shared/middleware/idempotency.ts`
- **Request** (1 connections) — `src/shared/middleware/idempotency.ts`
- *... and 4 more nodes in this community*

## Relationships

- [Video Route Tests](Video_Route_Tests.md) (18 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (15 shared connections)
- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (14 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (11 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (10 shared connections)
- [Error Handling Middleware](Error_Handling_Middleware.md) (8 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (7 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (7 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (6 shared connections)
- [Billing Persistence](Billing_Persistence.md) (4 shared connections)
- [Job Transitions](Job_Transitions.md) (4 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (4 shared connections)

## Source Files

- `src/config/env.ts`
- `src/models/CommandReceipt.ts`
- `src/modules/billing/atomic.ts`
- `src/services/jobs/jobResponse.ts`
- `src/shared/idempotency/operations.ts`
- `src/shared/idempotency/receipts.ts`
- `src/shared/middleware/idempotency.test.ts`
- `src/shared/middleware/idempotency.ts`
- `test/integration/idempotency.test.ts`

## Audit Trail

- EXTRACTED: 226 (97%)
- INFERRED: 6 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*