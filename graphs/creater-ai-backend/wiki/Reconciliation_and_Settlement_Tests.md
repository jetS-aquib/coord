# Reconciliation and Settlement Tests

> 57 nodes · cohesion 0.04

## Key Concepts

- **reconciliation.test.ts** (82 connections) — `test/billing/reconciliation.test.ts`
- **worker.test.ts** (67 connections) — `test/billing/worker.test.ts`
- **settle.test.ts** (64 connections) — `test/billing/settle.test.ts`
- **crashPoints.ts** (30 connections) — `src/shared/testing/crashPoints.ts`
- **authorizeInvocation()** (12 connections) — `src/modules/billing/service.ts`
- **CRASH_POINTS** (11 connections) — `src/shared/testing/crashPoints.ts`
- **reclaimExpiredLeases()** (9 connections) — `src/workers/billing.worker.ts`
- **accepted()** (6 connections) — `test/billing/reconciliation.test.ts`
- **uncertain()** (6 connections) — `test/billing/reconciliation.test.ts`
- **AttemptNotAuthorizedError** (5 connections) — `src/modules/billing/service.ts`
- **markUncertain()** (5 connections) — `src/modules/billing/service.ts`
- **stuck()** (5 connections) — `test/billing/reconciliation.test.ts`
- **heartbeatOutboxItem()** (4 connections) — `src/workers/billing.worker.ts`
- **publish()** (4 connections) — `test/billing/reconciliation.test.ts`
- **twoChildren()** (4 connections) — `test/billing/settle.test.ts`
- **context()** (3 connections) — `test/billing/reconciliation.test.ts`
- **context()** (3 connections) — `test/billing/settle.test.ts`
- **CrashHandler** (2 connections) — `src/shared/testing/crashPoints.ts`
- **BACKOFF_MS** (2 connections) — `src/workers/billing.worker.ts`
- **MAX_OUTBOX_ATTEMPTS** (2 connections) — `src/workers/billing.worker.ts`
- **backdate()** (2 connections) — `test/billing/reconciliation.test.ts`
- **jobOf()** (2 connections) — `test/billing/reconciliation.test.ts`
- **publishCatalog()** (2 connections) — `test/billing/reconciliation.test.ts`
- **attemptsOf()** (2 connections) — `test/billing/worker.test.ts`
- **context()** (2 connections) — `test/billing/worker.test.ts`
- *... and 32 more nodes in this community*

## Relationships

- [Billing Route Tests](Billing_Route_Tests.md) (38 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (34 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (30 shared connections)
- [Payment Expiry](Payment_Expiry.md) (17 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (12 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (12 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (10 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (10 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (9 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (8 shared connections)
- [Crash Worker Recovery](Crash_Worker_Recovery.md) (6 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (6 shared connections)

## Source Files

- `src/modules/billing/service.ts`
- `src/shared/testing/crashPoints.ts`
- `src/workers/billing.worker.ts`
- `test/billing/reconciliation.test.ts`
- `test/billing/settle.test.ts`
- `test/billing/worker.test.ts`

## Audit Trail

- EXTRACTED: 301 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*