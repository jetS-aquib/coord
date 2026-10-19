# Disputes

> 18 nodes · cohesion 0.22

## Key Concepts

- **getPaymentsRuntime()** (62 connections) — `src/modules/billing/payments/razorpay/runtime.ts`
- **fundOrder()** (31 connections) — `src/modules/billing/payments/orders.ts`
- **fundCycle()** (28 connections) — `src/modules/billing/payments/subscriptions.ts`
- **createOrder()** (27 connections) — `src/modules/billing/payments/orders.ts`
- **paymentsSweep()** (11 connections) — `src/modules/billing/payments/paymentsReconciliation.ts`
- **buyerSnapshot()** (8 connections) — `src/modules/billing/payments/billingProfile.ts`
- **expiresAtForOffer()** (6 connections) — `src/modules/billing/payments/orders.ts`
- **fundedOrder()** (6 connections) — `test/billing/payments/disputes.test.ts`
- **grantedOrder()** (6 connections) — `test/billing/payments/invoices.test.ts`
- **subscribe()** (6 connections) — `test/billing/payments/plan-changes.test.ts`
- **addUtcCalendarMonths()** (5 connections) — `src/modules/billing/payments/orders.ts`
- **lotFundedBy()** (5 connections) — `src/modules/billing/payments/orders.ts`
- **describePaymentMethod()** (5 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **grantedOrder()** (5 connections) — `test/billing/payments/billing-profile.test.ts`
- **fundedOrder()** (5 connections) — `test/billing/payments/refunds.test.ts`
- **frozenOffer()** (4 connections) — `src/modules/billing/payments/subscriptions.ts`
- **isDuplicateKey()** (3 connections) — `src/modules/billing/payments/subscriptions.ts`
- **isWholeMonthlyPeriod()** (3 connections) — `src/modules/billing/payments/subscriptions.ts`

## Relationships

- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (32 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (26 shared connections)
- [Payments Worker](Payments_Worker.md) (19 shared connections)
- [Payment Expiry](Payment_Expiry.md) (14 shared connections)
- [Payments Client and Modes](Payments_Client_and_Modes.md) (13 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (8 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (6 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (6 shared connections)
- [Billing Payments Subscription](Billing_Payments_Subscription.md) (6 shared connections)
- [Billing Payments Plan](Billing_Payments_Plan.md) (5 shared connections)
- [Billing Profiles](Billing_Profiles.md) (3 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (3 shared connections)

## Source Files

- `src/modules/billing/payments/billingProfile.ts`
- `src/modules/billing/payments/orders.ts`
- `src/modules/billing/payments/paymentsReconciliation.ts`
- `src/modules/billing/payments/razorpay/client.ts`
- `src/modules/billing/payments/razorpay/runtime.ts`
- `src/modules/billing/payments/subscriptions.ts`
- `test/billing/payments/billing-profile.test.ts`
- `test/billing/payments/disputes.test.ts`
- `test/billing/payments/invoices.test.ts`
- `test/billing/payments/plan-changes.test.ts`
- `test/billing/payments/refunds.test.ts`

## Audit Trail

- EXTRACTED: 186 (97%)
- INFERRED: 6 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*