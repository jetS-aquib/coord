# Auth Epoch Bump

> 14 nodes · cohesion 0.30

## Key Concepts

- **authEpoch.ts** (15 connections) — `src/shared/authEpoch.ts`
- **NotFoundError** (15 connections) — `src/shared/errors/AppError.ts`
- **currentAuthEpoch()** (10 connections) — `src/shared/authEpoch.ts`
- **auth-bump-epoch.ts** (9 connections) — `scripts/auth-bump-epoch.ts`
- **authEpochAdmin.ts** (9 connections) — `src/shared/authEpochAdmin.ts`
- **bumpUserAuthEpoch()** (6 connections) — `src/shared/authEpochAdmin.ts`
- **nextGlobalAuthEpoch()** (5 connections) — `src/shared/authEpochAdmin.ts`
- **authEpochEnvSchema** (4 connections) — `src/shared/authEpoch.ts`
- **authEpoch.test.ts** (4 connections) — `src/shared/authEpoch.test.ts`
- **main()** (3 connections) — `scripts/auth-bump-epoch.ts`
- **nextEpoch()** (3 connections) — `src/shared/authEpochAdmin.ts`
- **ref_node_util** (2 connections)
- **authEpochSchema** (2 connections) — `src/shared/authEpoch.ts`
- **.constructor()** (1 connections) — `src/shared/errors/AppError.ts`

## Relationships

- [Auth and Identity Principals](Auth_and_Identity_Principals.md) (14 shared connections)
- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (7 shared connections)
- [Ideas and GCS URLs](Ideas_and_GCS_URLs.md) (4 shared connections)
- [Plan Sync Scripts](Plan_Sync_Scripts.md) (3 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (2 shared connections)
- [Auth Middleware and Signatures](Auth_Middleware_and_Signatures.md) (2 shared connections)
- [Identity Audit](Identity_Audit.md) (1 shared connections)
- [Error Handling Middleware](Error_Handling_Middleware.md) (1 shared connections)

## Source Files

- `scripts/auth-bump-epoch.ts`
- `src/shared/authEpoch.test.ts`
- `src/shared/authEpoch.ts`
- `src/shared/authEpochAdmin.ts`
- `src/shared/errors/AppError.ts`

## Audit Trail

- EXTRACTED: 61 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*