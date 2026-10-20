# Assertion Replay Cache

> 7 nodes

## Key Concepts

- **ReplayCache** (7 connections) — `app/core/service_assertion.py`
- **.claim()** (3 connections) — `app/core/service_assertion.py`
- **._prune()** (2 connections) — `app/core/service_assertion.py`
- **.clear()** (1 connections) — `app/core/service_assertion.py`
- **.__init__()** (1 connections) — `app/core/service_assertion.py`
- **Remembers seen ``jti`` values for the replay window. In-process, like the…** (1 connections) — `app/core/service_assertion.py`
- **True when ``jti`` has not been seen before; records it.** (1 connections) — `app/core/service_assertion.py`

## Relationships

- [Job Routes and Identity](Job_Routes_and_Identity.md) (2 shared connections)

## Source Files

- `app/core/service_assertion.py`

## Audit Trail

- EXTRACTED: 9 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*