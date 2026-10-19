# Job Service and Providers

> 18 nodes · cohesion 0.30

## Key Concepts

- **jobService** (25 connections) — `src/services/jobs/jobService.ts`
- **IGenerationJob** (22 connections) — `src/models/GenerationJob.ts`
- **.change()** (10 connections) — `src/services/jobs/jobService.ts`
- **.createJob()** (9 connections) — `src/services/jobs/jobService.ts`
- **.observe()** (9 connections) — `src/services/jobs/jobService.ts`
- **.runVideo()** (9 connections) — `src/services/jobs/jobService.ts`
- **.cancelJob()** (6 connections) — `src/services/jobs/jobService.ts`
- **.persistProviderId()** (6 connections) — `src/services/jobs/jobService.ts`
- **.cancelAtProvider()** (5 connections) — `src/services/jobs/jobService.ts`
- **.getJob()** (5 connections) — `src/services/jobs/jobService.ts`
- **.recoverJobsOnStartup()** (5 connections) — `src/services/jobs/jobService.ts`
- **.getProvider()** (5 connections) — `src/services/providers/providerFactory.ts`
- **.emit()** (4 connections) — `src/services/jobs/jobService.ts`
- **.executeJob()** (4 connections) — `src/services/jobs/jobService.ts`
- **.background()** (3 connections) — `src/services/jobs/jobService.ts`
- **.getUserJobs()** (2 connections) — `src/services/jobs/jobService.ts`
- **.constructor()** (1 connections) — `src/services/jobs/jobService.ts`
- **.getInstance()** (1 connections) — `src/services/jobs/jobService.ts`

## Relationships

- [Job Transitions](Job_Transitions.md) (9 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (5 shared connections)
- [Jobs Billedjoboutcome Billedgenerationlog](Jobs_Billedjoboutcome_Billedgenerationlog.md) (5 shared connections)
- [Billed Job Types](Billed_Job_Types.md) (4 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (3 shared connections)
- [Provider Adapters](Provider_Adapters.md) (3 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (2 shared connections)
- [Video Route Tests](Video_Route_Tests.md) (2 shared connections)
- [Usage and Token Logging](Usage_and_Token_Logging.md) (2 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (1 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (1 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (1 shared connections)

## Source Files

- `src/models/GenerationJob.ts`
- `src/services/jobs/jobService.ts`
- `src/services/providers/providerFactory.ts`

## Audit Trail

- EXTRACTED: 85 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*