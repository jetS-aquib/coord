# Payment Routes and Catalog

> 57 nodes · cohesion 0.08

## Key Concepts

- **orders.ts** (96 connections) — `src/modules/billing/payments/orders.ts`
- **routes.ts** (76 connections) — `src/modules/billing/routes.ts`
- **billingRoutes()** (40 connections) — `src/modules/billing/routes.ts`
- **createSubscription()** (27 connections) — `src/modules/billing/payments/subscriptions.ts`
- **changeSubscription()** (24 connections) — `src/modules/billing/payments/subscriptions.ts`
- **toMinorUnits()** (18 connections) — `src/modules/billing/payments/money.ts`
- **WorkspaceForbiddenError** (15 connections) — `src/shared/identity/payer.ts`
- **money.ts** (13 connections) — `src/modules/billing/payments/money.ts`
- **requireActivePaymentsMode()** (12 connections) — `src/modules/billing/payments/orders.ts`
- **confirmOrder()** (11 connections) — `src/modules/billing/payments/orders.ts`
- **fakeCheckout()** (11 connections) — `src/modules/billing/payments/orders.ts`
- **confirmSubscription()** (11 connections) — `src/modules/billing/payments/subscriptions.ts`
- **isSupportedCurrency()** (10 connections) — `src/modules/billing/payments/money.ts`
- **fakeSubscriptionCheckout()** (10 connections) — `src/modules/billing/payments/subscriptions.ts`
- **replayCommandReceipt()** (10 connections) — `src/modules/billing/service.ts`
- **publishedOffersAt()** (9 connections) — `src/modules/billing/catalog.ts`
- **saveBillingProfile()** (8 connections) — `src/modules/billing/payments/billingProfile.ts`
- **assertPaymentsAdmission()** (8 connections) — `src/modules/billing/payments/orders.ts`
- **assertWorkspaceMayPurchase()** (8 connections) — `src/modules/billing/payments/orders.ts`
- **getOrderForWorkspace()** (8 connections) — `src/modules/billing/payments/orders.ts`
- **PaymentsDisabledError** (8 connections) — `src/modules/billing/payments/orders.ts`
- **subscriptionCredits()** (7 connections) — `src/modules/billing/catalog.ts`
- **paymentsModeEnabled()** (7 connections) — `src/modules/billing/payments/inbox.ts`
- **getSubscriptionForWorkspace()** (7 connections) — `src/modules/billing/payments/subscriptions.ts`
- **modelsHandler()** (7 connections) — `src/modules/billing/routes.ts`
- *... and 32 more nodes in this community*

## Relationships

- [Payments Worker](Payments_Worker.md) (37 shared connections)
- [Disputes](Disputes.md) (32 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (23 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (17 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (17 shared connections)
- [Payment Expiry](Payment_Expiry.md) (12 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (11 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (11 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (11 shared connections)
- [Payments Client and Modes](Payments_Client_and_Modes.md) (9 shared connections)
- [Entitlements and Catalog Routes](Entitlements_and_Catalog_Routes.md) (9 shared connections)
- [Billing Payments](Billing_Payments.md) (9 shared connections)

## Source Files

- `src/modules/billing/catalog.ts`
- `src/modules/billing/contracts.ts`
- `src/modules/billing/payments/addressFormats.ts`
- `src/modules/billing/payments/billingProfile.ts`
- `src/modules/billing/payments/inbox.ts`
- `src/modules/billing/payments/money.ts`
- `src/modules/billing/payments/orders.ts`
- `src/modules/billing/payments/subscriptions.ts`
- `src/modules/billing/routes.ts`
- `src/modules/billing/service.ts`
- `src/shared/identity/payer.ts`
- `test/billing/payments/billing-profile.test.ts`
- `test/unit/payments/money.test.ts`

## Audit Trail

- EXTRACTED: 425 (99%)
- INFERRED: 4 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*