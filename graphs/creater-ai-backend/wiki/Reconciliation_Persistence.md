# Reconciliation Persistence

> 42 nodes · cohesion 0.06

## Key Concepts

- **reconciliation.ts** (103 connections) — `src/modules/billing/reconciliation.ts`
- **detectWalletDriftOnce()** (6 connections) — `src/modules/billing/reconciliation.ts`
- **verifyWalletOnce()** (6 connections) — `src/modules/billing/reconciliation.ts`
- **verifyWithin()** (6 connections) — `src/modules/billing/reconciliation.ts`
- **withWalletLock()** (6 connections) — `src/modules/billing/reconciliation.ts`
- **detectWalletDrift()** (5 connections) — `src/modules/billing/reconciliation.ts`
- **replayWallet()** (5 connections) — `src/modules/billing/reconciliation.ts`
- **isTransient()** (4 connections) — `src/modules/billing/persistence.ts`
- **PAYMENT_DETECTORS** (3 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **DetectorContext** (3 connections) — `src/modules/billing/reconciliation.ts`
- **compare()** (2 connections) — `src/modules/billing/reconciliation.ts`
- **DetectedFinding** (2 connections) — `src/modules/billing/reconciliation.ts`
- **EMPTY_BUCKETS()** (2 connections) — `src/modules/billing/reconciliation.ts`
- **ListedFinding** (2 connections) — `src/modules/billing/reconciliation.ts`
- **ReconciliationFinding** (2 connections) — `src/modules/billing/reconciliation.ts`
- **ReconciliationInterval** (2 connections) — `src/modules/billing/reconciliation.ts`
- **ADMIN_CLOSURE_REASONS** (1 connections) — `src/modules/billing/reconciliation.ts`
- **ageMs()** (1 connections) — `src/modules/billing/reconciliation.ts`
- **attemptWithoutSettlementDetector** (1 connections) — `src/modules/billing/reconciliation.ts`
- **barrierStallDetector** (1 connections) — `src/modules/billing/reconciliation.ts`
- **chargeBoundsDetector** (1 connections) — `src/modules/billing/reconciliation.ts`
- **concurrencyLeakDetector** (1 connections) — `src/modules/billing/reconciliation.ts`
- **costCorrectionDetector** (1 connections) — `src/modules/billing/reconciliation.ts`
- **DETECTORS** (1 connections) — `src/modules/billing/reconciliation.ts`
- **DetectorWatermark** (1 connections) — `src/modules/billing/reconciliation.ts`
- *... and 17 more nodes in this community*

## Relationships

- [Payment Expiry](Payment_Expiry.md) (9 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (8 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (8 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (6 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (5 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (5 shared connections)
- [Billing Reconciliation](Billing_Reconciliation.md) (5 shared connections)
- [Billing Verify Reconciliation](Billing_Verify_Reconciliation.md) (3 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (3 shared connections)
- [Billing Persistence](Billing_Persistence.md) (2 shared connections)
- [Billing Drill](Billing_Drill.md) (2 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (2 shared connections)

## Source Files

- `src/modules/billing/payments/paymentsReconciliation.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/reconciliation.ts`

## Audit Trail

- EXTRACTED: 133 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*