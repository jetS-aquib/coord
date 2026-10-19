# Job Transitions

> 30 nodes · cohesion 0.09

## Key Concepts

- **jobService.ts** (46 connections) — `src/services/jobs/jobService.ts`
- **worker.cjs** (12 connections) — `test/jobs/worker.cjs`
- **idempotency/crash-worker.cjs** (11 connections) — `test/idempotency/crash-worker.cjs`
- **jobTransitions.ts** (10 connections) — `src/services/jobs/jobTransitions.ts`
- **jobTransitions.test.ts** (9 connections) — `src/services/jobs/jobTransitions.test.ts`
- **ProviderFactory** (7 connections) — `src/services/providers/providerFactory.ts`
- **isJobActive()** (5 connections) — `src/services/jobs/jobTransitions.ts`
- **JobEvent** (5 connections) — `src/services/jobs/jobTransitions.ts`
- **GenerationJobStatus** (4 connections) — `src/models/GenerationJob.ts`
- **.getProviderForModel()** (3 connections) — `src/services/providers/providerFactory.ts`
- **principal()** (3 connections) — `test/billing/payer.test.ts`
- **ExecutionStopped** (2 connections) — `src/services/jobs/jobService.ts`
- **loggedProvider()** (2 connections) — `src/services/jobs/jobService.ts`
- **request()** (2 connections) — `test/jobs/worker.cjs`
- **submit()** (2 connections) — `test/jobs/worker.cjs`
- **ref_events** (1 connections)
- **JobChanges** (1 connections) — `src/services/jobs/jobService.ts`
- **events** (1 connections) — `src/services/jobs/jobTransitions.test.ts`
- **states** (1 connections) — `src/services/jobs/jobTransitions.test.ts`
- **transitions** (1 connections) — `src/services/jobs/jobTransitions.ts`
- **[database, principal, commandId]** (1 connections) — `test/idempotency/crash-worker.cjs`
- **{ jobService }** (1 connections) — `test/idempotency/crash-worker.cjs`
- **mongoose** (1 connections) — `test/idempotency/crash-worker.cjs`
- **{ ProviderFactory }** (1 connections) — `test/idempotency/crash-worker.cjs`
- **submit()** (1 connections) — `test/idempotency/crash-worker.cjs`
- *... and 5 more nodes in this community*

## Relationships

- [Job Service and Providers](Job_Service_and_Providers.md) (9 shared connections)
- [Provider Adapters](Provider_Adapters.md) (9 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (7 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (6 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (6 shared connections)
- [Usage and Token Logging](Usage_and_Token_Logging.md) (5 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (4 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (4 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (3 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (3 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (2 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (1 shared connections)

## Source Files

- `src/models/GenerationJob.ts`
- `src/services/jobs/jobService.ts`
- `src/services/jobs/jobTransitions.test.ts`
- `src/services/jobs/jobTransitions.ts`
- `src/services/providers/providerFactory.ts`
- `test/billing/payer.test.ts`
- `test/idempotency/crash-worker.cjs`
- `test/jobs/worker.cjs`

## Audit Trail

- EXTRACTED: 99 (98%)
- INFERRED: 2 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*