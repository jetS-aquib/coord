# Docs

> 15 nodes

## Key Concepts

- **eve Session (SessionState)** (4 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **chat_event Ordered Event Log** (4 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **streamSessionEvents (NDJSON reader + retry)** (3 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **pendingUserMessage Recovery** (3 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Recovery Sweep** (2 connections) — `apps/iris/docs/capacity-and-queue.md`
- **Local App Chat Row** (2 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Settled Turn (completed / failed / waiting)** (2 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Worker-Free Dispatcher (kickDispatch)** (2 connections) — `apps/iris/docs/capacity-and-queue.md`
- **advanceFilm (idempotent by construction)** (2 connections) — `apps/iris/docs/director.md`
- **Orphaned Framing Claims Released After 3 Minutes** (2 connections) — `apps/iris/docs/director.md`
- **Structured Connection Authorization Flow** (2 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Refresh and Resume Overlay** (2 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Snapshot Merging (preserveKnownInitialEvents)** (2 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **createPersistedClientSession** (1 connections) — `apps/iris/docs/how-the-chatbot-works.md`
- **Event Log Invariants** (1 connections) — `apps/iris/docs/how-the-chatbot-works.md`

## Relationships

- [Docs](Docs.md) (4 shared connections)

## Source Files

- `apps/iris/docs/capacity-and-queue.md`
- `apps/iris/docs/director.md`
- `apps/iris/docs/how-the-chatbot-works.md`

## Audit Trail

- EXTRACTED: 16 (84%)
- INFERRED: 3 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*