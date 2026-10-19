# Jobs Integration Tests

> 15 nodes · cohesion 0.21

## Key Concepts

- **jobs.test.ts** (16 connections) — `test/integration/jobs.test.ts`
- **Worker** (7 connections) — `test/integration/jobs.test.ts`
- **ref_node_events** (6 connections)
- **.send()** (4 connections) — `test/integration/jobs.test.ts`
- **create()** (3 connections) — `test/integration/jobs.test.ts`
- **start()** (3 connections) — `test/integration/jobs.test.ts`
- **.next()** (3 connections) — `test/integration/jobs.test.ts`
- **.reply()** (3 connections) — `test/integration/jobs.test.ts`
- **.kill()** (2 connections) — `test/integration/jobs.test.ts`
- **accepted** (1 connections) — `test/integration/jobs.test.ts`
- **completed** (1 connections) — `test/integration/jobs.test.ts`
- **createdJobIds** (1 connections) — `test/integration/jobs.test.ts`
- **Message** (1 connections) — `test/integration/jobs.test.ts`
- **.constructor()** (1 connections) — `test/integration/jobs.test.ts`
- **workers** (1 connections) — `test/integration/jobs.test.ts`

## Relationships

- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (3 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (2 shared connections)
- [Billed Jobs and Routes](Billed_Jobs_and_Routes.md) (1 shared connections)
- [Reconciliation and Settlement Tests](Reconciliation_and_Settlement_Tests.md) (1 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (1 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (1 shared connections)

## Source Files

- `test/integration/jobs.test.ts`

## Audit Trail

- EXTRACTED: 29 (94%)
- INFERRED: 2 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*