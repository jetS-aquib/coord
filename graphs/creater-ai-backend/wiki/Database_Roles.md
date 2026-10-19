# Database Roles

> 9 nodes · cohesion 0.25

## Key Concepts

- **db-roles.test.ts** (22 connections) — `test/billing/db-roles.test.ts`
- **billingTestRoleUri()** (4 connections) — `test/billing/setup.ts`
- **connectAs()** (2 connections) — `test/billing/db-roles.test.ts`
- **BillingTestRole** (2 connections) — `test/billing/setup.ts`
- **connections** (1 connections) — `test/billing/db-roles.test.ts`
- **DB** (1 connections) — `test/billing/db-roles.test.ts`
- **expectDenied()** (1 connections) — `test/billing/db-roles.test.ts`
- **ledgerEntry()** (1 connections) — `test/billing/db-roles.test.ts`
- **listFromInit()** (1 connections) — `test/billing/db-roles.test.ts`

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (7 shared connections)
- [Atomic Transactions](Atomic_Transactions.md) (2 shared connections)
- [Mongoose Models](Mongoose_Models.md) (2 shared connections)
- [Billing Adapters Payments](Billing_Adapters_Payments.md) (2 shared connections)
- [Payment Expiry](Payment_Expiry.md) (1 shared connections)
- [Transaction Tests](Transaction_Tests.md) (1 shared connections)
- [Billing Persistence](Billing_Persistence.md) (1 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (1 shared connections)

## Source Files

- `test/billing/db-roles.test.ts`
- `test/billing/setup.ts`

## Audit Trail

- EXTRACTED: 26 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*