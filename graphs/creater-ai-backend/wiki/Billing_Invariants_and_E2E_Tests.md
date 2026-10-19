# Billing Invariants and E2E Tests

> 102 nodes · cohesion 0.07

## Key Concepts

- **mongoose** (132 connections) — `package.json`
- **vitest** (115 connections) — `package.json`
- **billing/setup.ts** (80 connections) — `test/billing/setup.ts`
- **funding.test.ts** (58 connections) — `test/billing/payments/e2e/funding.test.ts`
- **connectBillingTestDatabase()** (56 connections) — `test/billing/setup.ts`
- **dropBillingTestDatabase()** (54 connections) — `test/billing/setup.ts`
- **resetBillingModels** (51 connections) — `src/modules/billing/persistence.ts`
- **interrupted.test.ts** (38 connections) — `test/billing/invariants/interrupted.test.ts`
- **support.ts** (32 connections) — `test/billing/invariants/support.ts`
- **billing/expiry.test.ts** (30 connections) — `test/billing/expiry.test.ts`
- **invariants/refund.test.ts** (29 connections) — `test/billing/invariants/refund.test.ts`
- **replay.test.ts** (29 connections) — `test/billing/replay.test.ts`
- **invariants/expiry.test.ts** (28 connections) — `test/billing/invariants/expiry.test.ts`
- **transaction.test.ts** (27 connections) — `test/billing/transaction.test.ts`
- **rounding.test.ts** (26 connections) — `test/billing/invariants/rounding.test.ts`
- **capture.test.ts** (25 connections) — `test/billing/invariants/capture.test.ts`
- **crashPoint()** (24 connections) — `src/shared/testing/crashPoints.ts`
- **serialization.test.ts** (24 connections) — `test/billing/invariants/serialization.test.ts`
- **terminal-state.test.ts** (24 connections) — `test/billing/invariants/terminal-state.test.ts`
- **billing/refund.test.ts** (24 connections) — `test/billing/refund.test.ts`
- **reserve-capture.test.ts** (23 connections) — `test/billing/reserve-capture.test.ts`
- **reserve()** (21 connections) — `src/modules/billing/service.ts`
- **concurrency.test.ts** (21 connections) — `test/billing/invariants/concurrency.test.ts`
- **captureAndRelease()** (19 connections) — `src/modules/billing/service.ts`
- **expireLot()** (18 connections) — `src/modules/billing/service.ts`
- *... and 77 more nodes in this community*

## Relationships

- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (71 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (59 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (53 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (53 shared connections)
- [Payment Expiry](Payment_Expiry.md) (34 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (34 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (28 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (26 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (22 shared connections)
- [Billing Persistence](Billing_Persistence.md) (20 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (16 shared connections)
- [Payments Inbox](Payments_Inbox.md) (15 shared connections)

## Source Files

- `package.json`
- `src/modules/billing/atomic.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`
- `src/shared/testing/crashPoints.ts`
- `src/workers/billing.worker.ts`
- `test/billing/bigint.test.ts`
- `test/billing/expiry.test.ts`
- `test/billing/invariants/capture.test.ts`
- `test/billing/invariants/concurrency.test.ts`
- `test/billing/invariants/expiry.test.ts`
- `test/billing/invariants/interrupted.test.ts`
- `test/billing/invariants/refund.test.ts`
- `test/billing/invariants/rounding.test.ts`
- `test/billing/invariants/serialization.test.ts`
- `test/billing/invariants/support.ts`
- `test/billing/invariants/terminal-state.test.ts`
- `test/billing/offers.test.ts`
- `test/billing/payments/e2e/funding.test.ts`
- `test/billing/refund.test.ts`

## Audit Trail

- EXTRACTED: 1002 (99%)
- INFERRED: 8 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*