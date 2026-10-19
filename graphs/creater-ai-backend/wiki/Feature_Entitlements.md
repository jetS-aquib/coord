# Feature Entitlements

> 20 nodes · cohesion 0.14

## Key Concepts

- **MODEL_REGISTRY** (32 connections) — `src/config/aiModels.ts`
- **entitlements.test.ts** (18 connections) — `src/modules/billing/entitlements.test.ts`
- **contracts.test.ts** (17 connections) — `src/modules/billing/contracts.test.ts`
- **ModelControlsDocument** (12 connections) — `src/modules/billing/contracts.ts`
- **FEATURE_KEYS** (9 connections) — `src/config/aiModels.ts`
- **RateCardDocument** (9 connections) — `src/modules/billing/contracts.ts`
- **ResolvedSnapshot** (8 connections) — `src/modules/billing/catalog.ts`
- **PolicyDocument** (7 connections) — `src/modules/billing/contracts.ts`
- **TierDocument** (6 connections) — `src/modules/billing/contracts.ts`
- **ModelInputs** (4 connections) — `src/modules/billing/entitlements.ts`
- **ResolvedTier** (4 connections) — `src/modules/billing/entitlements.ts`
- **RolloutDocument** (3 connections) — `src/modules/billing/contracts.ts`
- **Loaded** (3 connections) — `src/modules/billing/entitlements.ts`
- **representativeRequest()** (3 connections) — `src/modules/billing/entitlements.ts`
- **card()** (2 connections) — `src/modules/billing/entitlements.test.ts`
- **controls()** (2 connections) — `src/modules/billing/entitlements.test.ts`
- **paths()** (1 connections) — `src/modules/billing/contracts.test.ts`
- **validRateCard** (1 connections) — `src/modules/billing/contracts.test.ts`
- **FLAT** (1 connections) — `src/modules/billing/entitlements.test.ts`
- **tier()** (1 connections) — `src/modules/billing/entitlements.test.ts`

## Relationships

- [Entitlements and Catalog Routes](Entitlements_and_Catalog_Routes.md) (20 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (14 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (9 shared connections)
- [Seed, Tier and Offer Drafts](Seed,_Tier_and_Offer_Drafts.md) (5 shared connections)
- [User Settings and Model Config](User_Settings_and_Model_Config.md) (5 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (5 shared connections)
- [Tier Limits](Tier_Limits.md) (3 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (2 shared connections)
- [Pricing Adapters and Domain](Pricing_Adapters_and_Domain.md) (2 shared connections)
- [Billing Adapters Pricing](Billing_Adapters_Pricing.md) (2 shared connections)
- [Provider Adapters](Provider_Adapters.md) (2 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (2 shared connections)

## Source Files

- `src/config/aiModels.ts`
- `src/modules/billing/catalog.ts`
- `src/modules/billing/contracts.test.ts`
- `src/modules/billing/contracts.ts`
- `src/modules/billing/entitlements.test.ts`
- `src/modules/billing/entitlements.ts`

## Audit Trail

- EXTRACTED: 115 (98%)
- INFERRED: 2 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*