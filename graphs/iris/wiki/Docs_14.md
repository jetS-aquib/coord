# Docs

> 11 nodes

## Key Concepts

- **usage_event table (append-only meter)** (8 connections) — `apps/iris/docs/metering-and-credits.md`
- **credit_ledger table** (4 connections) — `apps/iris/docs/metering-and-credits.md`
- **settle (lib/studio/finalize.ts)** (4 connections) — `apps/iris/docs/metering-and-credits.md`
- **Metering, cost to company, and credits** (3 connections) — `apps/iris/docs/metering-and-credits.md`
- **Meter / COGS / Credits layering** (3 connections) — `apps/iris/docs/metering-and-credits.md`
- **Two-phase credit hold (hold, settle, release)** (3 connections) — `apps/iris/docs/metering-and-credits.md`
- **finalize.ts idempotent three ways over** (3 connections) — `apps/iris/docs/studio.md`
- **Razorpay payments** (2 connections) — `apps/iris/docs/payments.md`
- **Language-model middleware token meter** (1 connections) — `apps/iris/docs/metering-and-credits.md`
- **Unpriced models: conservative fallback floor, never zero** (1 connections) — `apps/iris/docs/metering-and-credits.md`
- **Webhook is an optimization, the poll is the dependency** (1 connections) — `apps/iris/docs/studio.md`

## Relationships

- [Docs](Docs.md) (9 shared connections)

## Source Files

- `apps/iris/docs/metering-and-credits.md`
- `apps/iris/docs/payments.md`
- `apps/iris/docs/studio.md`

## Audit Trail

- EXTRACTED: 20 (95%)
- INFERRED: 1 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*