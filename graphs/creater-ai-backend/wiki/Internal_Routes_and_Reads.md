# Internal Routes and Reads

> 41 nodes · cohesion 0.08

## Key Concepts

- **internalRoutes.ts** (80 connections) — `src/modules/billing/internalRoutes.ts`
- **internalBillingRoutes()** (39 connections) — `src/modules/billing/internalRoutes.ts`
- **reads.ts** (30 connections) — `src/modules/billing/reads.ts`
- **usage.ts** (15 connections) — `src/modules/billing/usage.ts`
- **amountOf()** (13 connections) — `src/modules/billing/reads.ts`
- **microcreditsToCreditString()** (10 connections) — `src/modules/billing/domain.ts`
- **runStatus()** (9 connections) — `src/modules/billing/reads.ts`
- **statement()** (9 connections) — `src/modules/billing/reads.ts`
- **walletSummary()** (8 connections) — `src/modules/billing/reads.ts`
- **signedAmountOf()** (7 connections) — `src/modules/billing/reads.ts`
- **usageSummary()** (7 connections) — `src/modules/billing/usage.ts`
- **CREDIT_SYSTEM_ID** (5 connections) — `src/modules/billing/domain.ts`
- **bigintsAsStrings()** (4 connections) — `src/modules/billing/internalRoutes.ts`
- **commandContext()** (4 connections) — `src/modules/billing/internalRoutes.ts`
- **decodeCursor()** (4 connections) — `src/modules/billing/reads.ts`
- **findCommandReceipt()** (4 connections) — `src/modules/billing/service.ts`
- **statementQuerySchema** (3 connections) — `src/modules/billing/contracts.ts`
- **encodeCursor()** (3 connections) — `src/modules/billing/reads.ts`
- **daysBetween()** (3 connections) — `src/modules/billing/usage.ts`
- **bookEventsQuerySchema** (2 connections) — `src/modules/billing/contracts.ts`
- **bookSummaryQuerySchema** (2 connections) — `src/modules/billing/contracts.ts`
- **RunStatus** (2 connections) — `src/modules/billing/contracts.ts`
- **StatementEntry** (2 connections) — `src/modules/billing/contracts.ts`
- **StatementPage** (2 connections) — `src/modules/billing/contracts.ts`
- **UsageQuery** (2 connections) — `src/modules/billing/contracts.ts`
- *... and 16 more nodes in this community*

## Relationships

- [Entitlements and Catalog Routes](Entitlements_and_Catalog_Routes.md) (17 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (13 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (12 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (11 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (11 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (9 shared connections)
- [Ledger Book](Ledger_Book.md) (9 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (8 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (8 shared connections)
- [Payment Expiry](Payment_Expiry.md) (8 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (6 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (5 shared connections)

## Source Files

- `src/modules/billing/contracts.ts`
- `src/modules/billing/domain.ts`
- `src/modules/billing/internalRoutes.ts`
- `src/modules/billing/reads.ts`
- `src/modules/billing/service.ts`
- `src/modules/billing/usage.ts`

## Audit Trail

- EXTRACTED: 223 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*