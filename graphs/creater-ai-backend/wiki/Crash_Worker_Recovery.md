# Crash Worker Recovery

> 15 nodes · cohesion 0.14

## Key Concepts

- **dispatchRun()** (17 connections) — `src/workers/billing.worker.ts`
- **billing/crash-worker.cjs** (13 connections) — `test/billing/crash-worker.cjs`
- **settleAttempt()** (9 connections) — `src/workers/billing.worker.ts`
- **closeStalledRuns()** (8 connections) — `src/workers/billing.worker.ts`
- **beginSubmitting()** (6 connections) — `src/modules/billing/service.ts`
- **recordProviderRequestId()** (6 connections) — `src/modules/billing/service.ts`
- **claimOutboxItem()** (5 connections) — `src/workers/billing.worker.ts`
- **outcomeEventKey()** (5 connections) — `src/workers/billing.worker.ts`
- **workerContext()** (4 connections) — `src/workers/billing.worker.ts`
- **pollContextFor()** (3 connections) — `src/workers/billing.worker.ts`
- **{ claimOutboxItem, dispatchRun }** (1 connections) — `test/billing/crash-worker.cjs`
- **{ fakeProviderCalls }** (1 connections) — `test/billing/crash-worker.cjs`
- **mongoose** (1 connections) — `test/billing/crash-worker.cjs`
- **{ setBillingConnection }** (1 connections) — `test/billing/crash-worker.cjs`
- **[uri, isoNow]** (1 connections) — `test/billing/crash-worker.cjs`

## Relationships

- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (11 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (7 shared connections)
- [Payment Expiry](Payment_Expiry.md) (6 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (6 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (5 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (3 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (2 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (2 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (2 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (1 shared connections)
- [Video Synthesis and Capability](Video_Synthesis_and_Capability.md) (1 shared connections)
- [Billing Adapters Contracts](Billing_Adapters_Contracts.md) (1 shared connections)

## Source Files

- `src/modules/billing/service.ts`
- `src/workers/billing.worker.ts`
- `test/billing/crash-worker.cjs`

## Audit Trail

- EXTRACTED: 65 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*