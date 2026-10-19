# Payments Worker

> 41 nodes · cohesion 0.09

## Key Concepts

- **subscriptions.ts** (140 connections) — `src/modules/billing/payments/subscriptions.ts`
- **cancelSubscription()** (21 connections) — `src/modules/billing/payments/subscriptions.ts`
- **applyAuthoritativeEntity()** (16 connections) — `src/modules/billing/payments/subscriptions.ts`
- **applySubscriptionEntity()** (14 connections) — `src/modules/billing/payments/subscriptions.ts`
- **assignTierWithPlan()** (14 connections) — `src/modules/billing/payments/subscriptions.ts`
- **endPlanNow()** (9 connections) — `src/modules/billing/payments/subscriptions.ts`
- **endPlanAtPeriodEnd()** (8 connections) — `src/modules/billing/payments/subscriptions.ts`
- **markCancelled()** (8 connections) — `src/modules/billing/payments/subscriptions.ts`
- **runSubscriptionTransitions()** (8 connections) — `src/workers/billing.worker.ts`
- **assignSubscriptionTier()** (7 connections) — `src/modules/billing/payments/subscriptions.ts`
- **promoteScheduledSubscription()** (7 connections) — `src/modules/billing/payments/subscriptions.ts`
- **reassertPaidTier()** (7 connections) — `src/modules/billing/payments/subscriptions.ts`
- **cancelNow()** (6 connections) — `src/modules/billing/payments/subscriptions.ts`
- **endCurrentForScheduled()** (6 connections) — `src/modules/billing/payments/subscriptions.ts`
- **supersedeUnauthorised()** (6 connections) — `src/modules/billing/payments/subscriptions.ts`
- **getWorkspaceSubscriptions()** (5 connections) — `src/modules/billing/payments/subscriptions.ts`
- **afterCycleFunded()** (4 connections) — `src/modules/billing/payments/subscriptions.ts`
- **SubscriptionActiveError** (4 connections) — `src/modules/billing/payments/subscriptions.ts`
- **SubscriptionAlreadyActiveError** (4 connections) — `src/modules/billing/payments/subscriptions.ts`
- **SubscriptionChangeScheduledError** (4 connections) — `src/modules/billing/payments/subscriptions.ts`
- **getWorkspaceSubscription()** (3 connections) — `src/modules/billing/payments/subscriptions.ts`
- **notesOf()** (3 connections) — `src/modules/billing/payments/subscriptions.ts`
- **entityFreshness()** (2 connections) — `src/modules/billing/payments/subscriptions.ts`
- **LIVE_SUBSCRIPTION_STATUSES** (2 connections) — `src/modules/billing/payments/subscriptions.ts`
- **storedByRazorpayId()** (2 connections) — `src/modules/billing/payments/subscriptions.ts`
- *... and 16 more nodes in this community*

## Relationships

- [Payment Routes and Catalog](Payment_Routes_and_Catalog.md) (37 shared connections)
- [Disputes](Disputes.md) (19 shared connections)
- [Payment Expiry](Payment_Expiry.md) (18 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (13 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (10 shared connections)
- [Payments Client and Modes](Payments_Client_and_Modes.md) (8 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (6 shared connections)
- [Billing Payments Subscription](Billing_Payments_Subscription.md) (6 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (5 shared connections)
- [Billing Payments Plan](Billing_Payments_Plan.md) (5 shared connections)
- [Billing Persistence](Billing_Persistence.md) (4 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (4 shared connections)

## Source Files

- `src/modules/billing/payments/subscriptions.ts`
- `src/workers/billing.worker.ts`

## Audit Trail

- EXTRACTED: 253 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*