# Payment Expiry

> 57 nodes · cohesion 0.05

## Key Concepts

- **billingModels()** (316 connections) — `src/modules/billing/persistence.ts`
- **paymentsReconciliation.ts** (57 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **cancel()** (15 connections) — `src/modules/billing/service.ts`
- **payments-settlements.ts** (10 connections) — `scripts/payments-settlements.ts`
- **importSettlementRecon()** (9 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **main()** (4 connections) — `scripts/payments-settlements.ts`
- **askProviderToStop()** (4 connections) — `src/modules/billing/service.ts`
- **subscriptionStateDrift()** (3 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **stopWork()** (3 connections) — `src/modules/billing/service.ts`
- **dateArg()** (2 connections) — `scripts/payments-settlements.ts`
- **asMinor()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **cycleWithoutGrant()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **disputeLostWithoutRevocation()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **disputeRespondBySoon()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **externalRefund()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **grantWithoutCapturedPayment()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **inboxBacklogAged()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **inboxDead()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **orderQuarantined()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **paymentCapturedWithoutGrant()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **paymentWithoutOrder()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **refundFailed()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **refundUnresolved()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **revocationShortfall()** (2 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **runsOf()** (2 connections) — `test/billing/e2e/crash.test.ts`
- *... and 32 more nodes in this community*

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (34 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (26 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (25 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (24 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (22 shared connections)
- [Payments Worker](Payments_Worker.md) (18 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (17 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (15 shared connections)
- [Disputes](Disputes.md) (14 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (12 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (11 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (11 shared connections)

## Source Files

- `scripts/payments-settlements.ts`
- `src/modules/billing/payments/paymentsReconciliation.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`
- `test/billing/e2e/crash.test.ts`
- `test/billing/e2e/delivery.test.ts`
- `test/billing/e2e/lifecycle.test.ts`
- `test/billing/expiry.test.ts`
- `test/billing/payments/plan-changes.test.ts`
- `test/billing/refund.test.ts`
- `test/billing/replay.test.ts`
- `test/billing/reserve-capture.test.ts`
- `test/billing/rollout.test.ts`
- `test/billing/routes/video.test.ts`
- `test/billing/settle.test.ts`
- `test/billing/start.test.ts`

## Audit Trail

- EXTRACTED: 415 (97%)
- INFERRED: 14 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*