# Catalog Contracts

> 38 nodes · cohesion 0.10

## Key Concepts

- **catalog.ts** (124 connections) — `src/modules/billing/catalog.ts`
- **getBillingConfigVersionModel()** (27 connections) — `src/modules/billing/persistence.ts`
- **catalog.test.ts** (21 connections) — `test/billing/catalog.test.ts`
- **ConfigValidationError** (16 connections) — `src/modules/billing/contracts.ts`
- **loadPolicy()** (15 connections) — `src/modules/billing/catalog.ts`
- **loadRollout()** (13 connections) — `src/modules/billing/catalog.ts`
- **loadSnapshot()** (12 connections) — `src/modules/billing/catalog.ts`
- **loadTier()** (12 connections) — `src/modules/billing/catalog.ts`
- **ModelNotQuotableError** (8 connections) — `src/modules/billing/catalog.ts`
- **publishedAt()** (8 connections) — `src/modules/billing/catalog.ts`
- **assertOfferPublishable()** (7 connections) — `src/modules/billing/catalog.ts`
- **setAdmission()** (7 connections) — `src/modules/billing/catalog.ts`
- **ConfigImmutableError** (7 connections) — `src/modules/billing/contracts.ts`
- **findVersion()** (6 connections) — `src/modules/billing/catalog.ts`
- **inForceOf()** (6 connections) — `src/modules/billing/catalog.ts`
- **inForceRateCards()** (6 connections) — `src/modules/billing/catalog.ts`
- **republishRollout()** (6 connections) — `src/modules/billing/catalog.ts`
- **ConfigKind** (6 connections) — `src/modules/billing/contracts.ts`
- **frozenRates()** (5 connections) — `src/modules/billing/service.ts`
- **AdmissionPausedError** (4 connections) — `src/modules/billing/catalog.ts`
- **assertNoOverlappingWindow()** (4 connections) — `src/modules/billing/catalog.ts`
- **loadFrozenLimits()** (4 connections) — `src/modules/billing/catalog.ts`
- **publishedTierDocuments()** (4 connections) — `src/modules/billing/catalog.ts`
- **catalogStatus()** (3 connections) — `src/modules/billing/catalog.ts`
- **VersionRef** (3 connections) — `src/modules/billing/catalog.ts`
- *... and 13 more nodes in this community*

## Relationships

- [Entitlements and Catalog Routes](Entitlements_and_Catalog_Routes.md) (30 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (23 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (17 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (13 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (10 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (10 shared connections)
- [Feature Entitlements](Feature_Entitlements.md) (9 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (8 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (8 shared connections)
- [Allowances and Calendar](Allowances_and_Calendar.md) (8 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (8 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (7 shared connections)

## Source Files

- `src/modules/billing/catalog.ts`
- `src/modules/billing/contracts.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`
- `test/billing/catalog.test.ts`

## Audit Trail

- EXTRACTED: 280 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*