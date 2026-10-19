# Billing Reconciliation

> 6 nodes · cohesion 0.40

## Key Concepts

- **runReconciliation()** (16 connections) — `src/modules/billing/reconciliation.ts`
- **openFindingKeys()** (4 connections) — `src/modules/billing/reconciliation.ts`
- **dedupKey()** (3 connections) — `src/modules/billing/reconciliation.ts`
- **Detector** (2 connections) — `src/modules/billing/reconciliation.ts`
- **.run()** (2 connections) — `src/modules/billing/reconciliation.ts`
- **reconcile()** (2 connections) — `test/billing/reconciliation.test.ts`

## Relationships

- [Reconciliation Persistence](Reconciliation_Persistence.md) (5 shared connections)
- [Payment Expiry](Payment_Expiry.md) (2 shared connections)
- [Reconcile Scripts](Reconcile_Scripts.md) (2 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (2 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (2 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (1 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (1 shared connections)
- [Metrics Tests](Metrics_Tests.md) (1 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (1 shared connections)

## Source Files

- `src/modules/billing/reconciliation.ts`
- `test/billing/reconciliation.test.ts`

## Audit Trail

- EXTRACTED: 23 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*