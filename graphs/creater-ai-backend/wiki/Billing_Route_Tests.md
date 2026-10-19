# Billing Route Tests

> 98 nodes · cohesion 0.05

## Key Concepts

- **podcast.test.ts** (81 connections) — `test/billing/routes/podcast.test.ts`
- **harness.ts** (73 connections) — `test/billing/e2e/harness.ts`
- **text.test.ts** (71 connections) — `test/billing/routes/text.test.ts`
- **video.test.ts** (67 connections) — `test/billing/routes/video.test.ts`
- **image.test.ts** (64 connections) — `test/billing/routes/image.test.ts`
- **getBillingGenerationJobModel()** (53 connections) — `src/models/GenerationJob.ts`
- **GenerationJob.ts** (51 connections) — `src/models/GenerationJob.ts`
- **fakeProvider.ts** (42 connections) — `test/billing/fakeProvider.ts`
- **background.test.ts** (41 connections) — `test/billing/bypass/background.test.ts`
- **runOutboxOnce()** (39 connections) — `src/workers/billing.worker.ts`
- **runSettlementPass()** (33 connections) — `src/workers/billing.worker.ts`
- **crash.test.ts** (32 connections) — `test/billing/e2e/crash.test.ts`
- **delivery.test.ts** (31 connections) — `test/billing/e2e/delivery.test.ts`
- **lifecycle.test.ts** (30 connections) — `test/billing/e2e/lifecycle.test.ts`
- **e2e/rollout.test.ts** (28 connections) — `test/billing/e2e/rollout.test.ts`
- **scriptDefault()** (26 connections) — `src/modules/billing/adapters/fake.ts`
- **resetFakeProviderHarness()** (22 connections) — `test/billing/fakeProvider.ts`
- **fakeProviderCalls** (21 connections) — `src/modules/billing/adapters/fake.ts`
- **models.test.ts** (20 connections) — `test/billing/e2e/models.test.ts`
- **negative.test.ts** (16 connections) — `test/billing/e2e/negative.test.ts`
- **setUp()** (15 connections) — `test/billing/e2e/harness.ts`
- **startHarness()** (14 connections) — `test/billing/e2e/harness.ts`
- **resetBetweenScenarios()** (13 connections) — `test/billing/e2e/harness.ts`
- **stopHarness()** (10 connections) — `test/billing/e2e/harness.ts`
- **settledCharge()** (9 connections) — `test/billing/internal-api.test.ts`
- *... and 73 more nodes in this community*

## Relationships

- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (82 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (59 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (38 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (35 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (33 shared connections)
- [Payment Expiry](Payment_Expiry.md) (26 shared connections)
- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (26 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (24 shared connections)
- [Fake Provider and Pricing](Fake_Provider_and_Pricing.md) (17 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (16 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (16 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (15 shared connections)

## Source Files

- `src/models/GenerationJob.ts`
- `src/modules/billing/adapters/fake.ts`
- `src/workers/billing.worker.ts`
- `test/billing/bypass/background.test.ts`
- `test/billing/e2e/crash.test.ts`
- `test/billing/e2e/delivery.test.ts`
- `test/billing/e2e/harness.ts`
- `test/billing/e2e/lifecycle.test.ts`
- `test/billing/e2e/models.test.ts`
- `test/billing/e2e/negative.test.ts`
- `test/billing/e2e/rollout.test.ts`
- `test/billing/fakeProvider.ts`
- `test/billing/internal-api.test.ts`
- `test/billing/routes/image.test.ts`
- `test/billing/routes/podcast.test.ts`
- `test/billing/routes/text.test.ts`
- `test/billing/routes/video.test.ts`
- `test/billing/wallet-endpoints.test.ts`

## Audit Trail

- EXTRACTED: 789 (98%)
- INFERRED: 18 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*