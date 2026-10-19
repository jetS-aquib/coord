# Payments Client and Modes

> 102 nodes · cohesion 0.04

## Key Concepts

- **razorpay/fake.ts** (78 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **client.ts** (52 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **runtime.ts** (44 connections) — `src/modules/billing/payments/razorpay/runtime.ts`
- **localFake.ts** (24 connections) — `src/modules/billing/payments/localFake.ts`
- **RazorpayHttpError** (14 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **assertFakeAllowed()** (12 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **client.test.ts** (12 connections) — `test/unit/payments/client.test.ts`
- **ActivePaymentsMode** (11 connections) — `src/config/payments.ts`
- **prepareLocalFakeRazorpay()** (11 connections) — `src/modules/billing/payments/localFake.ts`
- **RazorpaySubscription** (11 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **paymentsFakeEnabled()** (10 connections) — `src/config/payments.ts`
- **FakeRazorpaySurface** (9 connections) — `src/modules/billing/payments/razorpay/runtime.ts`
- **RazorpayPayment** (8 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **chargeSubscriptionCycle()** (8 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **createFakeRazorpay()** (8 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **setSubscriptionStatus()** (8 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **createRazorpayClient()** (6 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **activateSubscription()** (6 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **cloneSubscription()** (6 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **fakeCapturePayment()** (6 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **restoreFakeRazorpay()** (6 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **RazorpayInvoice** (5 connections) — `src/modules/billing/payments/razorpay/client.ts`
- **nowSeconds()** (5 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **openDispute()** (5 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- **pauseSubscription()** (5 connections) — `src/modules/billing/payments/razorpay/fake.ts`
- *... and 77 more nodes in this community*

## Relationships

- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (25 shared connections)
- [Disputes](Disputes.md) (13 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (12 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (9 shared connections)
- [Payments Worker](Payments_Worker.md) (8 shared connections)
- [Payments Inbox](Payments_Inbox.md) (6 shared connections)
- [Payment Expiry](Payment_Expiry.md) (6 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (5 shared connections)
- [Billing Payments](Billing_Payments.md) (5 shared connections)
- [Billing Payments Subscription](Billing_Payments_Subscription.md) (4 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (3 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (3 shared connections)

## Source Files

- `src/config/payments.ts`
- `src/modules/billing/payments/localFake.ts`
- `src/modules/billing/payments/razorpay/client.ts`
- `src/modules/billing/payments/razorpay/fake.ts`
- `src/modules/billing/payments/razorpay/runtime.ts`
- `test/unit/payments/client.test.ts`

## Audit Trail

- EXTRACTED: 306 (97%)
- INFERRED: 8 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*