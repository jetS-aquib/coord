# Billing Worker and Metrics

> 60 nodes · cohesion 0.04

## Key Concepts

- **billing.worker.ts** (182 connections) — `src/workers/billing.worker.ts`
- **countBilling()** (16 connections) — `src/modules/billing/metrics.ts`
- **startBillingWorker()** (8 connections) — `src/workers/billing.worker.ts`
- **recordTaskRun()** (5 connections) — `src/modules/billing/metrics.ts`
- **registerTaskHeartbeat()** (5 connections) — `src/modules/billing/metrics.ts`
- **stopBillingWorker()** (5 connections) — `src/workers/billing.worker.ts`
- **childPlaceholder()** (4 connections) — `src/modules/billing/adapters/compositePlan.ts`
- **deferOutboxItem()** (4 connections) — `src/workers/billing.worker.ts`
- **runPaymentsSettlementsTask()** (4 connections) — `src/workers/billing.worker.ts`
- **runPaymentsSweepTask()** (4 connections) — `src/workers/billing.worker.ts`
- **settledChildArtifact()** (4 connections) — `src/workers/billing.worker.ts`
- **withChildInputs()** (4 connections) — `src/workers/billing.worker.ts`
- **reclaimExpiredInboxLeases()** (3 connections) — `src/modules/billing/payments/inbox.ts`
- **billingTasks()** (3 connections) — `src/workers/billing.worker.ts`
- **completeOutboxItem()** (3 connections) — `src/workers/billing.worker.ts`
- **paymentsOff()** (3 connections) — `src/workers/billing.worker.ts`
- **runReconciliationPass()** (3 connections) — `src/workers/billing.worker.ts`
- **ref_node_os** (2 connections)
- **EXPIRE_LOT_OPERATION** (2 connections) — `src/modules/billing/service.ts`
- **BillingTask** (2 connections) — `src/workers/billing.worker.ts`
- **.run()** (2 connections) — `src/workers/billing.worker.ts`
- **EXPIRY_SWEEP_BATCH** (2 connections) — `src/workers/billing.worker.ts`
- **resetUsersBackfill()** (2 connections) — `src/workers/billing.worker.ts`
- **stopOutboxLoop()** (2 connections) — `src/workers/billing.worker.ts`
- **ALLOWANCES_INTERVAL_MS** (1 connections) — `src/workers/billing.worker.ts`
- *... and 35 more nodes in this community*

## Relationships

- [Billing Route Tests](Billing_Route_Tests.md) (16 shared connections)
- [Metrics and Reconciliation](Metrics_and_Reconciliation.md) (13 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (12 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (11 shared connections)
- [Crash Worker Recovery](Crash_Worker_Recovery.md) (11 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (9 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (8 shared connections)
- [Payment Expiry](Payment_Expiry.md) (8 shared connections)
- [Payments Inbox](Payments_Inbox.md) (7 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (7 shared connections)
- [Allowances and Calendar](Allowances_and_Calendar.md) (6 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (5 shared connections)

## Source Files

- `src/modules/billing/adapters/compositePlan.ts`
- `src/modules/billing/metrics.ts`
- `src/modules/billing/payments/inbox.ts`
- `src/modules/billing/service.ts`
- `src/workers/billing.worker.ts`

## Audit Trail

- EXTRACTED: 227 (95%)
- INFERRED: 12 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*