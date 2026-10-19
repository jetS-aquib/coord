# Circuit Breaker

> 11 nodes · cohesion 0.29

## Key Concepts

- **providerCircuitBreaker** (10 connections) — `src/services/providers/circuitBreaker.ts`
- **.execute()** (5 connections) — `src/services/providers/circuitBreaker.ts`
- **.getOrCreateStats()** (4 connections) — `src/services/providers/circuitBreaker.ts`
- **CircuitBreakerError** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.canExecute()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.recordFailure()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.recordSuccess()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.constructor()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.constructor()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.getStats()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.reset()** (1 connections) — `src/services/providers/circuitBreaker.ts`

## Relationships

- [Captcha, Circuit Breaker, Idempotency](Captcha,_Circuit_Breaker,_Idempotency.md) (3 shared connections)

## Source Files

- `src/services/providers/circuitBreaker.ts`

## Audit Trail

- EXTRACTED: 19 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*