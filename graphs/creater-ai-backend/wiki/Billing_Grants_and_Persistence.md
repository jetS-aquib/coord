# Billing Grants and Persistence

> 89 nodes · cohesion 0.03

## Key Concepts

- **service.ts** (283 connections) — `src/modules/billing/service.ts`
- **grant.test.ts** (31 connections) — `test/billing/grant.test.ts`
- **refund()** (23 connections) — `src/modules/billing/service.ts`
- **release()** (20 connections) — `src/modules/billing/service.ts`
- **withWalletTransaction()** (18 connections) — `src/modules/billing/persistence.ts`
- **captureAndReleaseWithin()** (13 connections) — `src/modules/billing/service.ts`
- **.bumpWallet()** (10 connections) — `src/modules/billing/persistence.ts`
- **reserveWithin()** (10 connections) — `src/modules/billing/service.ts`
- **.nextSequence()** (8 connections) — `src/modules/billing/persistence.ts`
- **RunNotHeldError** (7 connections) — `src/modules/billing/service.ts`
- **IssuanceLimitExceededError** (6 connections) — `src/modules/billing/service.ts`
- **RefundExceedsCaptureError** (6 connections) — `src/modules/billing/service.ts`
- **RequestChangedError** (6 connections) — `src/modules/billing/service.ts`
- **WalletFrozenError** (6 connections) — `src/modules/billing/service.ts`
- **FeatureNotInTierError** (5 connections) — `src/modules/billing/service.ts`
- **GrantSourceNotEnabledError** (5 connections) — `src/modules/billing/service.ts`
- **walletForRun()** (5 connections) — `src/modules/billing/service.ts`
- **assertPerGrantLimit()** (4 connections) — `src/modules/billing/service.ts`
- **assertTierEntitlement()** (4 connections) — `src/modules/billing/service.ts`
- **assertWalletSpendable()** (4 connections) — `src/modules/billing/service.ts`
- **frozenPolicy()** (4 connections) — `src/modules/billing/service.ts`
- **issueLotWithin()** (4 connections) — `src/modules/billing/service.ts`
- **releaseConcurrency()** (4 connections) — `src/modules/billing/service.ts`
- **walletLock()** (3 connections) — `src/modules/billing/persistence.ts`
- **WalletTransactionContext** (3 connections) — `src/modules/billing/persistence.ts`
- *... and 64 more nodes in this community*

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (53 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (29 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (22 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (18 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (17 shared connections)
- [Payment Expiry](Payment_Expiry.md) (15 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (12 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (12 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (11 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (10 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (10 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (8 shared connections)

## Source Files

- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`
- `test/billing/grant.test.ts`

## Audit Trail

- EXTRACTED: 456 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*