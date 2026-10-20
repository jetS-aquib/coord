# Provider Circuit Breaker

> 15 nodes

## Key Concepts

- **providerCircuitBreaker** (10 connections) — `src/services/providers/circuitBreaker.ts`
- **circuitBreaker.ts** (8 connections) — `src/services/providers/circuitBreaker.ts`
- **.execute()** (5 connections) — `src/services/providers/circuitBreaker.ts`
- **.getOrCreateStats()** (4 connections) — `src/services/providers/circuitBreaker.ts`
- **CircuitBreakerError** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.canExecute()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.recordFailure()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **.recordSuccess()** (3 connections) — `src/services/providers/circuitBreaker.ts`
- **CircuitBreakerOptions** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **CircuitState** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **CircuitStats** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.constructor()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.constructor()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.getStats()** (1 connections) — `src/services/providers/circuitBreaker.ts`
- **.reset()** (1 connections) — `src/services/providers/circuitBreaker.ts`

## Relationships

- [Route Registration and Middleware](Route_Registration_and_Middleware.md) (2 shared connections)
- [App Bootstrap and Logging](App_Bootstrap_and_Logging.md) (2 shared connections)

## Source Files

- `src/services/providers/circuitBreaker.ts`

## Audit Trail

- EXTRACTED: 25 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*