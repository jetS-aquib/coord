# Video Route Tests

> 58 nodes · cohesion 0.05

## Key Concepts

- **getCommandReceiptModel()** (73 connections) — `src/models/CommandReceipt.ts`
- **start.test.ts** (71 connections) — `test/billing/start.test.ts`
- **start()** (65 connections) — `src/modules/billing/service.ts`
- **video-service.test.ts** (63 connections) — `test/billing/routes/video-service.test.ts`
- **CommandReceipt.ts** (55 connections) — `src/models/CommandReceipt.ts`
- **getBillingConnection()** (22 connections) — `src/modules/billing/persistence.ts`
- **billing-job-indexes.ts** (11 connections) — `scripts/billing-job-indexes.ts`
- **startObservation()** (9 connections) — `src/modules/billing/service.ts`
- **Ready** (9 connections) — `test/billing/start.test.ts`
- **recover()** (8 connections) — `src/shared/idempotency/receipts.ts`
- **QuoteAlreadyAcceptedError** (6 connections) — `src/modules/billing/service.ts`
- **QuoteExpiredError** (6 connections) — `src/modules/billing/service.ts`
- **RolloutModeNotEnforcedError** (6 connections) — `src/modules/billing/service.ts`
- **main()** (5 connections) — `scripts/billing-job-indexes.ts`
- **admitUsageWindows()** (5 connections) — `src/modules/billing/service.ts`
- **amount()** (5 connections) — `src/modules/billing/service.ts`
- **QuoteModeChangedError** (5 connections) — `src/modules/billing/service.ts`
- **UsageLimitExceededError** (5 connections) — `src/modules/billing/service.ts`
- **actingPrincipal()** (4 connections) — `src/modules/billing/service.ts`
- **startRender()** (4 connections) — `test/billing/routes/video-service.test.ts`
- **counts()** (4 connections) — `test/billing/start.test.ts`
- **fund()** (4 connections) — `test/billing/start.test.ts`
- **makeWorkspace()** (4 connections) — `test/billing/start.test.ts`
- **publish()** (4 connections) — `test/billing/start.test.ts`
- **context()** (3 connections) — `test/billing/start.test.ts`
- *... and 33 more nodes in this community*

## Relationships

- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (38 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (33 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (26 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (22 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (20 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (20 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (18 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (15 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (10 shared connections)
- [Payment Expiry](Payment_Expiry.md) (9 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (8 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (8 shared connections)

## Source Files

- `scripts/billing-job-indexes.ts`
- `src/models/CommandReceipt.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`
- `src/shared/idempotency/receipts.ts`
- `test/billing/routes/video-service.test.ts`
- `test/billing/start.test.ts`

## Audit Trail

- EXTRACTED: 411 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*