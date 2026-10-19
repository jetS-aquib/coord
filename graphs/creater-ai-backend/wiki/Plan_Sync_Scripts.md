# Plan Sync Scripts

> 25 nodes · cohesion 0.12

## Key Concepts

- **env.ts** (77 connections) — `src/config/env.ts`
- **payments.ts** (22 connections) — `src/config/payments.ts`
- **syncOfferPlans()** (16 connections) — `src/modules/billing/payments/subscriptions.ts`
- **payments-sync-plans.ts** (11 connections) — `scripts/payments-sync-plans.ts`
- **dotenv** (9 connections) — `package.json`
- **validatePaymentsEnv()** (8 connections) — `src/config/payments.ts`
- **ref_node_child_process** (7 connections)
- **env.test.ts** (7 connections) — `test/unit/payments/env.test.ts`
- **isValidGstin()** (6 connections) — `src/shared/gstin.ts`
- **main()** (5 connections) — `scripts/payments-sync-plans.ts`
- **liveSellerIssues()** (3 connections) — `src/config/payments.ts`
- **gstin.ts** (3 connections) — `src/shared/gstin.ts`
- **modeArg()** (2 connections) — `scripts/payments-sync-plans.ts`
- **envSchema** (2 connections) — `src/config/env.ts`
- **expectedKeyPrefix()** (2 connections) — `src/config/payments.ts`
- **keyIdMatchesMode()** (2 connections) — `src/config/payments.ts`
- **sellerPresenceIssues()** (2 connections) — `src/config/payments.ts`
- **blankToUndefined()** (1 connections) — `src/config/env.ts`
- **httpUrl()** (1 connections) — `src/config/env.ts`
- **originList** (1 connections) — `src/config/env.ts`
- **parsed** (1 connections) — `src/config/env.ts`
- **PaymentsEnvInput** (1 connections) — `src/config/payments.ts`
- **PaymentsEnvIssue** (1 connections) — `src/config/payments.ts`
- **PaymentsMode** (1 connections) — `src/config/payments.ts`
- **PLACEHOLDER_SELLER_GSTIN** (1 connections) — `src/config/payments.ts`

## Relationships

- [Payments Client and Modes](Payments_Client_and_Modes.md) (12 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (10 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (6 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (6 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (4 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (4 shared connections)
- [HTTP Cache and Channels](HTTP_Cache_and_Channels.md) (4 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (4 shared connections)
- [Payments Worker](Payments_Worker.md) (4 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (4 shared connections)
- [Auth Epoch Bump](Auth_Epoch_Bump.md) (3 shared connections)
- [Billing Adapters Payments](Billing_Adapters_Payments.md) (3 shared connections)

## Source Files

- `package.json`
- `scripts/payments-sync-plans.ts`
- `src/config/env.ts`
- `src/config/payments.ts`
- `src/modules/billing/payments/subscriptions.ts`
- `src/shared/gstin.ts`
- `test/unit/payments/env.test.ts`

## Audit Trail

- EXTRACTED: 156 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*