# Metrics and Reconciliation

> 49 nodes · cohesion 0.07

## Key Concepts

- **metrics.ts** (66 connections) — `src/modules/billing/metrics.ts`
- **modules/billing/metrics.test.ts** (19 connections) — `src/modules/billing/metrics.test.ts`
- **sampleBillingGauges()** (10 connections) — `src/modules/billing/metrics.ts`
- **billingCounters()** (9 connections) — `src/modules/billing/metrics.ts`
- **billingHealth** (9 connections) — `src/modules/billing/metrics.ts`
- **evaluateBillingAlerts()** (8 connections) — `src/modules/billing/metrics.ts`
- **runMetricsPass()** (7 connections) — `src/workers/billing.worker.ts`
- **bucketAges()** (5 connections) — `src/modules/billing/metrics.ts`
- **AgedGauge** (4 connections) — `src/modules/billing/metrics.ts`
- **diffAlerts()** (4 connections) — `src/modules/billing/metrics.ts`
- **resetBillingMetrics()** (4 connections) — `src/modules/billing/metrics.ts`
- **bucketLabels()** (3 connections) — `src/modules/billing/metrics.ts`
- **moneyWindow()** (3 connections) — `src/modules/billing/metrics.ts`
- **reconciliationGauge()** (3 connections) — `src/modules/billing/metrics.ts`
- **summarise()** (3 connections) — `src/modules/billing/metrics.ts`
- **taskHeartbeats()** (3 connections) — `src/modules/billing/metrics.ts`
- **alertsFor()** (3 connections) — `src/modules/billing/metrics.test.ts`
- **worstLevel()** (3 connections) — `src/modules/billing/metrics.ts`
- **pendingThresholdMs()** (3 connections) — `src/modules/billing/reconciliation.ts`
- **alert()** (2 connections) — `src/modules/billing/metrics.ts`
- **ALERT_RULES** (2 connections) — `src/modules/billing/metrics.ts`
- **AlertRule** (2 connections) — `src/modules/billing/metrics.ts`
- **.evaluate()** (2 connections) — `src/modules/billing/metrics.ts`
- **BillingGauges** (2 connections) — `src/modules/billing/metrics.ts`
- **emptyCounters()** (2 connections) — `src/modules/billing/metrics.ts`
- *... and 24 more nodes in this community*

## Relationships

- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (13 shared connections)
- [Metrics Tests](Metrics_Tests.md) (8 shared connections)
- [Payment Expiry](Payment_Expiry.md) (5 shared connections)
- [Catalog Contracts](Catalog_Contracts.md) (3 shared connections)
- [Internal Routes and Reads](Internal_Routes_and_Reads.md) (3 shared connections)
- [Billing Domain and Pricing](Billing_Domain_and_Pricing.md) (3 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (2 shared connections)
- [Reconciliation Persistence](Reconciliation_Persistence.md) (2 shared connections)
- [Payments Service Core](Payments_Service_Core.md) (2 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (2 shared connections)
- [Internal API and Subscriptions](Internal_API_and_Subscriptions.md) (2 shared connections)
- [Feature Entitlements](Feature_Entitlements.md) (1 shared connections)

## Source Files

- `src/modules/billing/metrics.test.ts`
- `src/modules/billing/metrics.ts`
- `src/modules/billing/payments/findings.ts`
- `src/modules/billing/reconciliation.ts`
- `src/workers/billing.worker.ts`

## Audit Trail

- EXTRACTED: 128 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*