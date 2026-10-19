# Payments Service Core

> 57 nodes · cohesion 0.07

## Key Concepts

- **refunds.ts** (72 connections) — `src/modules/billing/payments/refunds.ts`
- **disputes.ts** (38 connections) — `src/modules/billing/payments/disputes.ts`
- **createPaymentRefund()** (24 connections) — `src/modules/billing/payments/refunds.ts`
- **microcreditsFromCreditString()** (17 connections) — `src/modules/billing/domain.ts`
- **freeze()** (17 connections) — `src/modules/billing/service.ts`
- **revokeUnusedGrant()** (15 connections) — `src/modules/billing/service.ts`
- **registerInboxHandler()** (13 connections) — `src/modules/billing/payments/inboxRegistry.ts`
- **recordPaymentsFinding()** (12 connections) — `src/modules/billing/payments/findings.ts`
- **inboxRegistry.ts** (12 connections) — `src/modules/billing/payments/inboxRegistry.ts`
- **applyDisputeEntity()** (11 connections) — `src/modules/billing/payments/disputes.ts`
- **findings.ts** (11 connections) — `src/modules/billing/payments/findings.ts`
- **previewPaymentRefund()** (10 connections) — `src/modules/billing/payments/refunds.ts`
- **InboxItem** (9 connections) — `src/modules/billing/payments/inbox.ts`
- **proportionalRevokeTarget()** (9 connections) — `src/modules/billing/payments/refunds.ts`
- **settleLostDispute()** (8 connections) — `src/modules/billing/payments/disputes.ts`
- **ingestExternalRefund()** (8 connections) — `src/modules/billing/payments/refunds.ts`
- **submitPaymentRefund()** (8 connections) — `src/modules/billing/payments/refunds.ts`
- **BillingOrder** (8 connections) — `src/modules/billing/persistence.ts`
- **endPlanForRefund()** (6 connections) — `src/modules/billing/payments/refunds.ts`
- **finding()** (6 connections) — `src/modules/billing/payments/refunds.ts`
- **PaymentDisputedError** (5 connections) — `src/modules/billing/payments/refunds.ts`
- **finding()** (4 connections) — `src/modules/billing/payments/disputes.ts`
- **removeHold()** (4 connections) — `src/modules/billing/payments/disputes.ts`
- **clearInboxHandlers()** (4 connections) — `src/modules/billing/payments/inboxRegistry.ts`
- **quarantineOrder()** (4 connections) — `src/modules/billing/payments/orders.ts`
- *... and 32 more nodes in this community*

## Relationships

- [Payment Expiry](Payment_Expiry.md) (25 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (18 shared connections)
- [Payments Worker](Payments_Worker.md) (13 shared connections)
- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (11 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (11 shared connections)
- [Payments Inbox](Payments_Inbox.md) (11 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (10 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (10 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (9 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (9 shared connections)
- [Disputes](Disputes.md) (8 shared connections)
- [Billing Persistence](Billing_Persistence.md) (7 shared connections)

## Source Files

- `src/modules/billing/domain.ts`
- `src/modules/billing/payments/disputes.ts`
- `src/modules/billing/payments/findings.ts`
- `src/modules/billing/payments/inbox.ts`
- `src/modules/billing/payments/inboxRegistry.ts`
- `src/modules/billing/payments/orders.ts`
- `src/modules/billing/payments/paymentsReconciliation.ts`
- `src/modules/billing/payments/refunds.ts`
- `src/modules/billing/payments/subscriptions.ts`
- `src/modules/billing/persistence.ts`
- `src/modules/billing/service.ts`

## Audit Trail

- EXTRACTED: 294 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*