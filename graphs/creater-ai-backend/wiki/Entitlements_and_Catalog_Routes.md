# Entitlements and Catalog Routes

> 52 nodes · cohesion 0.09

## Key Concepts

- **internalCatalogRoutes.ts** (80 connections) — `src/modules/billing/internalCatalogRoutes.ts`
- **entitlements.ts** (50 connections) — `src/modules/billing/entitlements.ts`
- **registerCatalogRoutes()** (42 connections) — `src/modules/billing/internalCatalogRoutes.ts`
- **estimate()** (14 connections) — `src/modules/billing/pricing.ts`
- **maximum()** (12 connections) — `src/modules/billing/pricing.ts`
- **toRateSnapshot()** (11 connections) — `src/modules/billing/catalog.ts`
- **typicalPrice** (11 connections) — `src/modules/billing/entitlements.ts`
- **draft()** (10 connections) — `src/modules/billing/internalCatalogRoutes.ts`
- **ForbiddenCapabilityError** (10 connections) — `src/shared/serviceAssertion.ts`
- **availability()** (9 connections) — `src/modules/billing/catalog.ts`
- **priceHint()** (9 connections) — `src/modules/billing/catalog.ts`
- **resolveModel()** (9 connections) — `src/modules/billing/entitlements.ts`
- **publish()** (8 connections) — `src/modules/billing/internalCatalogRoutes.ts`
- **requireCapability()** (8 connections) — `src/shared/middleware/requireServiceAssertion.ts`
- **configKey()** (7 connections) — `src/modules/billing/contracts.ts`
- **quotedCredits()** (7 connections) — `src/modules/billing/domain.ts`
- **loadAll()** (7 connections) — `src/modules/billing/entitlements.ts`
- **versionRow()** (7 connections) — `src/modules/billing/internalCatalogRoutes.ts`
- **auditConfigChange()** (6 connections) — `src/modules/billing/catalog.ts`
- **publishedRateCardAt()** (6 connections) — `src/modules/billing/catalog.ts`
- **windowAt()** (6 connections) — `src/modules/billing/catalog.ts`
- **roundToNearestCredit()** (6 connections) — `src/modules/billing/domain.ts`
- **accessConflicts()** (6 connections) — `src/modules/billing/entitlements.ts`
- **priceableOptions** (6 connections) — `src/modules/billing/entitlements.ts`
- **resolveCatalog()** (6 connections) — `src/modules/billing/entitlements.ts`
- *... and 27 more nodes in this community*

## Relationships

- [Catalog Contracts](Catalog_Contracts.md) (30 shared connections)
- [Feature Entitlements](Feature_Entitlements.md) (20 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (17 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (15 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (9 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (8 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (7 shared connections)
- [Billing Adapters Contracts](Billing_Adapters_Contracts.md) (6 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (6 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (5 shared connections)
- [Tier Limits](Tier_Limits.md) (5 shared connections)
- [Seed, Tier and Offer Drafts](Seed,_Tier_and_Offer_Drafts.md) (5 shared connections)

## Source Files

- `src/modules/billing/catalog.ts`
- `src/modules/billing/contracts.ts`
- `src/modules/billing/domain.ts`
- `src/modules/billing/entitlements.ts`
- `src/modules/billing/internalCatalogRoutes.ts`
- `src/modules/billing/payments/subscriptions.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/pricing.ts`
- `src/shared/middleware/requireServiceAssertion.ts`
- `src/shared/serviceAssertion.ts`

## Audit Trail

- EXTRACTED: 300 (99%)
- INFERRED: 2 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*