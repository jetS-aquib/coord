# Billing Razorpay

> 51 nodes

## Key Concepts

- **refunds.ts** (53 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **accounts.ts** (43 connections) — `apps/iris/lib/billing/accounts.ts`
- **getSqlClient()** (40 connections) — `apps/iris/lib/db/client.ts`
- **grants.ts** (27 connections) — `apps/iris/lib/billing/grants.ts`
- **markAccountStale()** (20 connections) — `apps/iris/lib/billing/accounts.ts`
- **ensureAccount()** (18 connections) — `apps/iris/lib/billing/accounts.ts`
- **changeSubscription()** (17 connections) — `apps/iris/lib/billing/razorpay/service.ts`
- **startSubscription()** (14 connections) — `apps/iris/lib/billing/accounts.ts`
- **issueGrant()** (12 connections) — `apps/iris/lib/billing/grants.ts`
- **billing/cron/route.ts** (11 connections) — `apps/iris/app/api/billing/cron/route.ts`
- **pgTimestamp()** (10 connections) — `apps/iris/lib/billing/grants.ts`
- **drainGrant()** (9 connections) — `apps/iris/lib/billing/grants.ts`
- **endPaidAccessNow()** (9 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **refundPayment()** (9 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **isTerminalStatus()** (8 connections) — `apps/iris/lib/billing/razorpay/models.ts`
- **billingSubscription** (8 connections) — `apps/iris/lib/db/schema.ts`
- **creditGrant** (8 connections) — `apps/iris/lib/db/schema.ts`
- **renew()** (7 connections) — `apps/iris/lib/billing/accounts.ts`
- **runBillingCycle()** (7 connections) — `apps/iris/lib/billing/accounts.ts`
- **applyOutcomes()** (7 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **readRefundable()** (7 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **handOver()** (7 connections) — `apps/iris/lib/billing/razorpay/service.ts`
- **persistProviderState()** (7 connections) — `apps/iris/lib/billing/razorpay/service.ts`
- **cancelSubscriptionFor()** (6 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- **recordProviderRefund()** (6 connections) — `apps/iris/lib/billing/razorpay/refunds.ts`
- *... and 26 more nodes in this community*

## Relationships

- [Billing Razorpay](Billing_Razorpay.md) (84 shared connections)
- [Lib Atlas](Lib_Atlas.md) (24 shared connections)
- [Rollstock Audio Generation](Rollstock_Audio_Generation.md) (16 shared connections)
- [Lib Db](Lib_Db.md) (13 shared connections)
- [Atlas Features And Search](Atlas_Features_And_Search.md) (10 shared connections)
- [App Atlas](App_Atlas.md) (9 shared connections)
- [Lib Billing](Lib_Billing.md) (8 shared connections)
- [Lib Posthog](Lib_Posthog.md) (6 shared connections)
- [Lib Rollstock](Lib_Rollstock.md) (3 shared connections)
- [Scripts](Scripts.md) (3 shared connections)
- [Lib Account](Lib_Account.md) (2 shared connections)
- [Core API Routes](Core_API_Routes.md) (2 shared connections)

## Source Files

- `apps/iris/app/api/billing/cron/route.ts`
- `apps/iris/lib/billing/accounts.ts`
- `apps/iris/lib/billing/grants.ts`
- `apps/iris/lib/billing/razorpay/models.ts`
- `apps/iris/lib/billing/razorpay/refunds.ts`
- `apps/iris/lib/billing/razorpay/service.ts`
- `apps/iris/lib/db/client.ts`
- `apps/iris/lib/db/schema.ts`

## Audit Trail

- EXTRACTED: 319 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*