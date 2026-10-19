# Provider Costs and Rollout

> 90 nodes · cohesion 0.05

## Key Concepts

- **microcredits** (92 connections) — `src/modules/billing/domain.ts`
- **getWorkspaceModel()** (88 connections) — `src/models/Workspace.ts`
- **publishConfig()** (79 connections) — `src/modules/billing/catalog.ts`
- **draftConfig()** (76 connections) — `src/modules/billing/catalog.ts`
- **grant()** (69 connections) — `src/modules/billing/service.ts`
- **text-to-video.test.ts** (63 connections) — `test/billing/routes/text-to-video.test.ts`
- **provider-costs.test.ts** (61 connections) — `test/billing/provider-costs.test.ts`
- **billing/rollout.test.ts** (60 connections) — `test/billing/rollout.test.ts`
- **getWorkspaceMembershipModel()** (46 connections) — `src/models/WorkspaceMembership.ts`
- **billing-local-pilot.ts** (32 connections) — `scripts/billing-local-pilot.ts`
- **setRolloutMode()** (25 connections) — `src/modules/billing/catalog.ts`
- **main()** (12 connections) — `scripts/billing-local-pilot.ts`
- **settledRun()** (12 connections) — `test/billing/provider-costs.test.ts`
- **Dispatched** (11 connections) — `test/billing/settle.test.ts`
- **Accepted** (10 connections) — `test/billing/worker.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/image.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/podcast.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/text.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/text-to-video.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/video-service.test.ts`
- **setUp()** (9 connections) — `test/billing/routes/video.test.ts`
- **fixture()** (8 connections) — `test/billing/internal-api.test.ts`
- **setUp()** (8 connections) — `test/billing/rollout.test.ts`
- **consumeIssuanceAllowance()** (7 connections) — `src/modules/billing/service.ts`
- **setUpWorkspace()** (7 connections) — `test/billing/cancel.test.ts`
- *... and 65 more nodes in this community*

## Relationships

- [Billing Route Tests](Billing_Route_Tests.md) (82 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (53 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (45 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (38 shared connections)
- [Bypass, Cancel and Indexes](Bypass,_Cancel_and_Indexes.md) (34 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (32 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (30 shared connections)
- [Billing Grants and Persistence](Billing_Grants_and_Persistence.md) (29 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (23 shared connections)
- [Payment Expiry](Payment_Expiry.md) (22 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (11 shared connections)
- [Metrics Tests](Metrics_Tests.md) (10 shared connections)

## Source Files

- `scripts/billing-local-pilot.ts`
- `src/models/Workspace.ts`
- `src/models/WorkspaceMembership.ts`
- `src/modules/billing/catalog.ts`
- `src/modules/billing/domain.ts`
- `src/modules/billing/service.ts`
- `test/billing/bypass/inventory.test.ts`
- `test/billing/cancel.test.ts`
- `test/billing/catalog.test.ts`
- `test/billing/e2e/models.test.ts`
- `test/billing/internal-api.test.ts`
- `test/billing/metrics.test.ts`
- `test/billing/payments/billing-profile.test.ts`
- `test/billing/payments/disputes.test.ts`
- `test/billing/payments/e2e/funding.test.ts`
- `test/billing/payments/invoices.test.ts`
- `test/billing/payments/orders.test.ts`
- `test/billing/payments/payments-reconciliation.test.ts`
- `test/billing/payments/plan-changes.test.ts`
- `test/billing/payments/refunds.test.ts`

## Audit Trail

- EXTRACTED: 762 (100%)
- INFERRED: 1 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*