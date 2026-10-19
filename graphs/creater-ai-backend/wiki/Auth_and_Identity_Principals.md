# Auth and Identity Principals

> 84 nodes · cohesion 0.05

## Key Concepts

- **principal.ts** (58 connections) — `src/shared/identity/principal.ts`
- **User.ts** (37 connections) — `src/models/User.ts`
- **auth.service.ts** (36 connections) — `src/modules/auth/auth.service.ts`
- **signAccessToken()** (36 connections) — `src/shared/jwt.ts`
- **jwt.ts** (33 connections) — `src/shared/jwt.ts`
- **identity.test.ts** (29 connections) — `test/integration/identity.test.ts`
- **requireAuth.ts** (24 connections) — `src/shared/middleware/requireAuth.ts`
- **AuthService** (15 connections) — `src/modules/auth/auth.service.ts`
- **ValidationError** (15 connections) — `src/shared/errors/AppError.ts`
- **UserRepository** (12 connections) — `src/modules/auth/auth.repository.ts`
- **auth.service.test.ts** (12 connections) — `src/modules/auth/auth.service.test.ts`
- **requireAuth()** (12 connections) — `src/shared/middleware/requireAuth.ts`
- **.findByEmail()** (11 connections) — `src/modules/auth/auth.repository.ts`
- **auth.repository.ts** (10 connections) — `src/modules/auth/auth.repository.ts`
- **image.controller.test.ts** (10 connections) — `src/modules/image/image.controller.test.ts`
- **requireCurrentAuthEpoch()** (10 connections) — `src/shared/authEpoch.ts`
- **resolvePrincipal()** (9 connections) — `src/shared/identity/principal.ts`
- **signRefreshToken()** (9 connections) — `src/shared/jwt.ts`
- **.firebaseVerifyToken()** (8 connections) — `src/modules/auth/auth.service.ts`
- **.refreshTokens()** (8 connections) — `src/modules/auth/auth.service.ts`
- **principal.test.ts** (8 connections) — `src/shared/identity/principal.test.ts`
- **.findById()** (7 connections) — `src/modules/auth/auth.repository.ts`
- **.login()** (7 connections) — `src/modules/auth/auth.service.ts`
- **.register()** (7 connections) — `src/modules/auth/auth.service.ts`
- **.verifyEmail()** (7 connections) — `src/modules/auth/auth.service.ts`
- *... and 59 more nodes in this community*

## Relationships

- [MagicRoll and App Errors](MagicRoll_and_App_Errors.md) (27 shared connections)
- [Billing Route Tests](Billing_Route_Tests.md) (26 shared connections)
- [Error Handling Middleware](Error_Handling_Middleware.md) (17 shared connections)
- [Auth Middleware and Signatures](Auth_Middleware_and_Signatures.md) (15 shared connections)
- [Auth Epoch Bump](Auth_Epoch_Bump.md) (14 shared connections)
- [Idempotency Receipts](Idempotency_Receipts.md) (14 shared connections)
- [Quotes, Allowances and Payers](Quotes,_Allowances_and_Payers.md) (10 shared connections)
- [Identity Audit](Identity_Audit.md) (10 shared connections)
- [Assets, Brand Kits and Elements](Assets,_Brand_Kits_and_Elements.md) (9 shared connections)
- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (8 shared connections)
- [Billing Invariants and E2E Tests](Billing_Invariants_and_E2E_Tests.md) (8 shared connections)
- [Provider Costs and Rollout](Provider_Costs_and_Rollout.md) (6 shared connections)

## Source Files

- `src/config/firebaseAdmin.ts`
- `src/models/User.ts`
- `src/modules/auth/auth.ownership.test.ts`
- `src/modules/auth/auth.repository.test.ts`
- `src/modules/auth/auth.repository.ts`
- `src/modules/auth/auth.service.test.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/googleVerifier.ts`
- `src/modules/image/image.controller.test.ts`
- `src/shared/authEpoch.ts`
- `src/shared/errors/AppError.ts`
- `src/shared/identity/principal.test.ts`
- `src/shared/identity/principal.ts`
- `src/shared/jwt.ts`
- `src/shared/middleware/requireAuth.ts`
- `test/billing/bypass/inventory.test.ts`
- `test/billing/quote.test.ts`
- `test/billing/routes/podcast.test.ts`
- `test/billing/routes/text-to-video.test.ts`
- `test/billing/routes/text.test.ts`

## Audit Trail

- EXTRACTED: 378 (93%)
- INFERRED: 28 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*