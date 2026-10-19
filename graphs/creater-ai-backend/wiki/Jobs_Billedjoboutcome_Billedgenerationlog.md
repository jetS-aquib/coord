# Jobs Billedjoboutcome Billedgenerationlog

> 25 nodes · cohesion 0.16

## Key Concepts

- **billedJobOutcome.ts** (42 connections) — `src/services/jobs/billedJobOutcome.ts`
- **billedGenerationLog.ts** (26 connections) — `src/services/jobs/billedGenerationLog.ts`
- **getExecutionAdapter()** (17 connections) — `src/modules/billing/adapters/index.ts`
- **deliverBilledJob()** (12 connections) — `src/services/jobs/billedJobOutcome.ts`
- **logBilledGeneration()** (9 connections) — `src/services/jobs/billedGenerationLog.ts`
- **logPendingBilledGeneration()** (8 connections) — `src/services/jobs/billedGenerationLog.ts`
- **runDeliverySweep()** (8 connections) — `src/services/jobs/billedJobOutcome.ts`
- **markBilledJobProcessing()** (7 connections) — `src/services/jobs/billedJobOutcome.ts`
- **transition()** (7 connections) — `src/services/jobs/jobTransitions.ts`
- **emit()** (5 connections) — `src/services/jobs/billedJobOutcome.ts`
- **move()** (5 connections) — `src/services/jobs/billedJobOutcome.ts`
- **SettledArtifact** (5 connections) — `src/services/jobs/billedJobOutcome.ts`
- **billedUsage()** (5 connections) — `src/services/jobs/billedUsage.ts`
- **ADMIN_CLOSURE** (4 connections) — `src/modules/billing/reconciliation.ts`
- **upsertRow()** (4 connections) — `src/services/jobs/billedGenerationLog.ts`
- **failureDetail()** (4 connections) — `src/services/jobs/billedJobOutcome.ts`
- **chargedAttemptAnswer()** (3 connections) — `src/services/jobs/billedJobOutcome.ts`
- **target()** (3 connections) — `src/services/jobs/billedJobOutcome.ts`
- **adminClosure()** (2 connections) — `src/services/jobs/billedGenerationLog.ts`
- **BilledOutcome** (2 connections) — `src/services/jobs/billedGenerationLog.ts`
- **isDuplicateKey()** (2 connections) — `src/services/jobs/billedGenerationLog.ts`
- **isOpen()** (2 connections) — `src/services/jobs/billedJobOutcome.ts`
- **JOB_TYPE** (1 connections) — `src/services/jobs/billedGenerationLog.ts`
- **DELIVERY_SWEEP_BATCH** (1 connections) — `src/services/jobs/billedJobOutcome.ts`
- **DeliveryOutcome** (1 connections) — `src/services/jobs/billedJobOutcome.ts`

## Relationships

- [Billing Route Tests](Billing_Route_Tests.md) (14 shared connections)
- [Payment Expiry](Payment_Expiry.md) (10 shared connections)
- [Billing Worker and Metrics](Billing_Worker_and_Metrics.md) (8 shared connections)
- [Job Transitions](Job_Transitions.md) (7 shared connections)
- [Pricing Adapters and Domain](Pricing_Adapters_and_Domain.md) (5 shared connections)
- [Crash Worker Recovery](Crash_Worker_Recovery.md) (5 shared connections)
- [Job Service and Providers](Job_Service_and_Providers.md) (5 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (4 shared connections)
- [Usage and Token Logging](Usage_and_Token_Logging.md) (4 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (3 shared connections)
- [Reconciliation Persistence](Reconciliation_Persistence.md) (3 shared connections)
- [Billing Contracts and Routing](Billing_Contracts_and_Routing.md) (3 shared connections)

## Source Files

- `src/modules/billing/adapters/index.ts`
- `src/modules/billing/reconciliation.ts`
- `src/services/jobs/billedGenerationLog.ts`
- `src/services/jobs/billedJobOutcome.ts`
- `src/services/jobs/billedUsage.ts`
- `src/services/jobs/jobTransitions.ts`

## Audit Trail

- EXTRACTED: 135 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*