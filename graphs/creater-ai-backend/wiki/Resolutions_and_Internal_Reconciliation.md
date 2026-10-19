# Resolutions and Internal Reconciliation

> 53 nodes · cohesion 0.09

## Key Concepts

- **internalReconciliationRoutes.ts** (46 connections) — `src/modules/billing/internalReconciliationRoutes.ts`
- **canonicalPayloadHash()** (37 connections) — `src/shared/utils/canonicalJson.ts`
- **registerReconciliationRoutes()** (25 connections) — `src/modules/billing/internalReconciliationRoutes.ts`
- **withBillingTransaction()** (25 connections) — `src/modules/billing/persistence.ts`
- **observe()** (17 connections) — `src/modules/billing/service.ts`
- **chargeHeldRun()** (16 connections) — `src/modules/billing/resolutions.ts`
- **writeAudit()** (15 connections) — `src/modules/billing/audit.ts`
- **commitResolution()** (15 connections) — `src/modules/billing/resolutions.ts`
- **assignTier()** (15 connections) — `src/modules/billing/service.ts`
- **closeUncertainAsFailed()** (14 connections) — `src/modules/billing/resolutions.ts`
- **assertReason()** (13 connections) — `src/modules/billing/resolutions.ts`
- **releaseStaleHold()** (13 connections) — `src/modules/billing/resolutions.ts`
- **setWalletStatus()** (13 connections) — `src/modules/billing/resolutions.ts`
- **canonicalJson.ts** (13 connections) — `src/shared/utils/canonicalJson.ts`
- **closeUncertainAsCompleted()** (12 connections) — `src/modules/billing/resolutions.ts`
- **repairConcurrency()** (12 connections) — `src/modules/billing/resolutions.ts`
- **refundHeldRun()** (11 connections) — `src/modules/billing/resolutions.ts`
- **applyCostCorrections()** (10 connections) — `src/modules/billing/providerCosts.ts`
- **releaseQuarantine()** (10 connections) — `src/modules/billing/resolutions.ts`
- **escalatePending()** (9 connections) — `src/modules/billing/resolutions.ts`
- **fundOrderResolution()** (9 connections) — `src/modules/billing/resolutions.ts`
- **resubmitRefund()** (9 connections) — `src/modules/billing/resolutions.ts`
- **listFindings()** (7 connections) — `src/modules/billing/reconciliation.ts`
- **stopHeldRun()** (7 connections) — `src/modules/billing/resolutions.ts`
- **canonicalJson()** (7 connections) — `src/shared/utils/canonicalJson.ts`
- *... and 28 more nodes in this community*

## Relationships

- [Billing Resolutions](Billing_Resolutions.md) (34 shared connections)
- [Payment Expiry](Payment_Expiry.md) (24 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (21 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (17 shared connections)
- [Provider Costs and Audit](Provider_Costs_and_Audit.md) (12 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (12 shared connections)
- [Payments Worker](Payments_Worker.md) (10 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (10 shared connections)
- [Reconciliation Persistence](Reconciliation_Persistence.md) (8 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (8 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (5 shared connections)
- [Reconcile Scripts](Reconcile_Scripts.md) (4 shared connections)

## Source Files

- `src/modules/billing/atomic.ts`
- `src/modules/billing/audit.ts`
- `src/modules/billing/internalReconciliationRoutes.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/providerCosts.ts`
- `src/modules/billing/reconciliation.ts`
- `src/modules/billing/resolutions.ts`
- `src/modules/billing/routing.ts`
- `src/modules/billing/service.ts`
- `src/shared/utils/canonicalJson.test.ts`
- `src/shared/utils/canonicalJson.ts`

## Audit Trail

- EXTRACTED: 341 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*