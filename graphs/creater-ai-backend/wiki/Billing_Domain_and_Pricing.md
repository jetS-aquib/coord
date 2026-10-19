# Billing Domain and Pricing

> 58 nodes · cohesion 0.05

## Key Concepts

- **domain.ts** (128 connections) — `src/modules/billing/domain.ts`
- **domain.test.ts** (30 connections) — `src/modules/billing/domain.test.ts`
- **closeRun()** (21 connections) — `src/modules/billing/service.ts`
- **assertNever()** (8 connections) — `src/modules/billing/domain.ts`
- **chargeWithinHold()** (8 connections) — `src/modules/billing/domain.ts`
- **sumRationals()** (7 connections) — `src/modules/billing/domain.ts`
- **assertInt64()** (6 connections) — `src/modules/billing/domain.ts`
- **.toMicrocredits()** (6 connections) — `src/modules/billing/domain.ts`
- **totalMicrocredits()** (6 connections) — `src/modules/billing/domain.ts`
- **adjustmentFactor()** (5 connections) — `src/modules/billing/pricing.ts`
- **idempotencyKeySchema** (4 connections) — `src/modules/billing/domain.ts`
- **microcreditsFromIntegerString()** (4 connections) — `src/modules/billing/domain.ts`
- **observeSettlementLatency()** (4 connections) — `src/modules/billing/metrics.ts`
- **grantSourceKey()** (3 connections) — `src/modules/billing/domain.ts`
- **issuanceCounterpart()** (3 connections) — `src/modules/billing/domain.ts`
- **ZERO_MICROCREDITS** (3 connections) — `src/modules/billing/domain.ts`
- **latencyFrom()** (3 connections) — `src/modules/billing/metrics.ts`
- **worstCase()** (3 connections) — `src/modules/billing/pricing.ts`
- **addMicrocredits()** (2 connections) — `src/modules/billing/domain.ts`
- **attemptIdSchema** (2 connections) — `src/modules/billing/domain.ts`
- **ceilDiv()** (2 connections) — `src/modules/billing/domain.ts`
- **FinancialState** (2 connections) — `src/modules/billing/domain.ts`
- **floorDiv()** (2 connections) — `src/modules/billing/domain.ts`
- **floorToWholeCredit()** (2 connections) — `src/modules/billing/domain.ts`
- **GrantSource** (2 connections) — `src/modules/billing/domain.ts`
- *... and 33 more nodes in this community*

## Relationships

- [Pricing Properties](Pricing_Properties.md) (16 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (16 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (10 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (9 shared connections)
- [Entitlements and Catalog Routes](Entitlements_and_Catalog_Routes.md) (8 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (8 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (6 shared connections)
- [Pricing Domain](Pricing_Domain.md) (5 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (4 shared connections)
- [Billing Resolutions](Billing_Resolutions.md) (4 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (4 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (4 shared connections)

## Source Files

- `src/modules/billing/domain.test.ts`
- `src/modules/billing/domain.ts`
- `src/modules/billing/metrics.ts`
- `src/modules/billing/pricing.ts`
- `src/modules/billing/service.ts`

## Audit Trail

- EXTRACTED: 221 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*