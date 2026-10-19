# Payments Inbox

> 41 nodes · cohesion 0.10

## Key Concepts

- **inbox.ts** (61 connections) — `src/modules/billing/payments/inbox.ts`
- **inbox.test.ts** (32 connections) — `test/billing/payments/inbox.test.ts`
- **signatures.ts** (19 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **receiveRazorpayWebhook()** (16 connections) — `src/modules/billing/payments/inbox.ts`
- **signatures.test.ts** (9 connections) — `test/unit/payments/signatures.test.ts`
- **runPaymentsInboxOnce()** (8 connections) — `src/modules/billing/payments/inbox.ts`
- **processInboxItem()** (7 connections) — `src/modules/billing/payments/inbox.ts`
- **hmacHex()** (7 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **signWebhookBody()** (7 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **verifyWebhookSignature()** (7 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **signPayment()** (6 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **verifyPaymentSignature()** (6 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **verifySubscriptionSignature()** (6 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **asRecord()** (4 connections) — `src/modules/billing/payments/inbox.ts`
- **claimInboxItem()** (4 connections) — `src/modules/billing/payments/inbox.ts`
- **extractInboxRefs()** (4 connections) — `src/modules/billing/payments/inbox.ts`
- **razorpayWebhookHandler()** (4 connections) — `src/modules/billing/payments/inbox.ts`
- **inboxHandlerFor()** (4 connections) — `src/modules/billing/payments/inboxRegistry.ts`
- **hexEqual()** (4 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **signSubscription()** (4 connections) — `src/modules/billing/payments/razorpay/signatures.ts`
- **deliver()** (4 connections) — `test/billing/payments/e2e/funding.test.ts`
- **entityOf()** (3 connections) — `src/modules/billing/payments/inbox.ts`
- **finishInboxItem()** (3 connections) — `src/modules/billing/payments/inbox.ts`
- **InboxHandler** (3 connections) — `src/modules/billing/payments/inbox.ts`
- **resolvePaymentsConfig()** (3 connections) — `src/modules/billing/payments/inbox.ts`
- *... and 16 more nodes in this community*

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (15 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (15 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (11 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (7 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (7 shared connections)
- [Payment Expiry](Payment_Expiry.md) (6 shared connections)
- [Payments Client and Modes](Payments_Client_and_Modes.md) (6 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (4 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (4 shared connections)
- [Payments Worker](Payments_Worker.md) (3 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (3 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (2 shared connections)

## Source Files

- `src/modules/billing/payments/inbox.ts`
- `src/modules/billing/payments/inboxRegistry.ts`
- `src/modules/billing/payments/razorpay/signatures.ts`
- `test/billing/payments/e2e/funding.test.ts`
- `test/billing/payments/inbox.test.ts`
- `test/unit/payments/signatures.test.ts`

## Audit Trail

- EXTRACTED: 173 (98%)
- INFERRED: 3 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*