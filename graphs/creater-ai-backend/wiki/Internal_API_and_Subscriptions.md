# Internal API and Subscriptions

> 72 nodes · cohesion 0.04

## Key Concepts

- **internal-api.test.ts** (77 connections) — `test/billing/internal-api.test.ts`
- **ref_node_crypto** (72 connections)
- **payments-reconciliation.test.ts** (59 connections) — `test/billing/payments/payments-reconciliation.test.ts`
- **disputes.test.ts** (52 connections) — `test/billing/payments/disputes.test.ts`
- **orders.test.ts** (52 connections) — `test/billing/payments/orders.test.ts`
- **refunds.test.ts** (50 connections) — `test/billing/payments/refunds.test.ts`
- **subscriptions.test.ts** (49 connections) — `test/billing/payments/subscriptions.test.ts`
- **CommandContext** (45 connections) — `src/modules/billing/service.ts`
- **invoices.test.ts** (45 connections) — `test/billing/payments/invoices.test.ts`
- **verifyWallet()** (29 connections) — `src/modules/billing/reconciliation.ts`
- **resetPaymentsRuntime()** (18 connections) — `src/modules/billing/payments/razorpay/runtime.ts`
- **scope-kill-worker.cjs** (17 connections) — `test/billing/scope-kill-worker.cjs`
- **resetFakeRazorpay()** (14 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **payments/fake.test.ts** (10 connections) — `test/unit/payments/fake.test.ts`
- **fakeRazorpayCalls** (7 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **scriptFakeRazorpay()** (4 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **placedOrder()** (4 connections) — `test/billing/payments/orders.test.ts`
- **create()** (4 connections) — `test/billing/payments/subscriptions.test.ts`
- **context()** (3 connections) — `test/billing/payments/disputes.test.ts`
- **context()** (3 connections) — `test/billing/payments/invoices.test.ts`
- **context()** (3 connections) — `test/billing/payments/orders.test.ts`
- **context()** (3 connections) — `test/billing/payments/refunds.test.ts`
- **context()** (3 connections) — `test/billing/payments/subscriptions.test.ts`
- **context()** (2 connections) — `test/billing/internal-api.test.ts`
- **oid()** (2 connections) — `test/billing/payments/disputes.test.ts`
- *... and 47 more nodes in this community*

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (71 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (45 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (29 shared connections)
- [Disputes](Disputes.md) (26 shared connections)
- [Payments Client and Modes](Payments_Client_and_Modes.md) (25 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (24 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (20 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (18 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (17 shared connections)
- [Payments Inbox](Payments_Inbox.md) (15 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (12 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (12 shared connections)

## Source Files

- `src/modules/billing/payments/razorpay/fake.ts`
- `src/modules/billing/payments/razorpay/runtime.ts`
- `src/modules/billing/reconciliation.ts`
- `src/modules/billing/service.ts`
- `test/billing/internal-api.test.ts`
- `test/billing/payments/disputes.test.ts`
- `test/billing/payments/invoices.test.ts`
- `test/billing/payments/orders.test.ts`
- `test/billing/payments/payments-reconciliation.test.ts`
- `test/billing/payments/refunds.test.ts`
- `test/billing/payments/subscriptions.test.ts`
- `test/billing/scope-kill-worker.cjs`
- `test/unit/payments/fake.test.ts`

## Audit Trail

- EXTRACTED: 573 (100%)
- INFERRED: 2 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*