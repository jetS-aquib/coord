# Transaction Tests

> 15 nodes · cohesion 0.18

## Key Concepts

- **withAtomicScope()** (11 connections) — `src/modules/billing/atomic.ts`
- **collections()** (9 connections) — `src/modules/billing/atomic.ts`
- **acquireLock()** (7 connections) — `src/modules/billing/atomic.ts`
- **recoverScope()** (5 connections) — `src/modules/billing/atomic.ts`
- **ScopeContendedError** (5 connections) — `src/modules/billing/atomic.ts`
- **ScopeLostError** (5 connections) — `src/modules/billing/atomic.ts`
- **applyUndo()** (4 connections) — `src/modules/billing/atomic.ts`
- **record()** (4 connections) — `src/modules/billing/atomic.ts`
- **rollBack()** (4 connections) — `src/modules/billing/atomic.ts`
- **decode()** (2 connections) — `src/modules/billing/atomic.ts`
- **isDuplicateKey()** (2 connections) — `src/modules/billing/atomic.ts`
- **sleep()** (2 connections) — `src/modules/billing/atomic.ts`
- **scope()** (2 connections) — `test/billing/transaction.test.ts`
- **.constructor()** (1 connections) — `src/modules/billing/atomic.ts`
- **.constructor()** (1 connections) — `src/modules/billing/atomic.ts`

## Relationships

- [Atomic Transactions](Atomic_Transactions.md) (15 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (6 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (2 shared connections)
- [Resolutions and Internal Reconciliation](Resolutions_and_Internal_Reconciliation.md) (1 shared connections)
- [Billing Persistence](Billing_Persistence.md) (1 shared connections)
- [Database Roles](Database_Roles.md) (1 shared connections)

## Source Files

- `src/modules/billing/atomic.ts`
- `test/billing/transaction.test.ts`

## Audit Trail

- EXTRACTED: 45 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*