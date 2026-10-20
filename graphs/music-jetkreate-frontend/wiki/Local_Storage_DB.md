# Local Storage DB

> 11 nodes

## Key Concepts

- **StorageDB** (11 connections) — `src/services/storageDB.ts`
- **.find()** (4 connections) — `src/services/storageDB.ts`
- **.findOne()** (4 connections) — `src/services/storageDB.ts`
- **.init()** (4 connections) — `src/services/storageDB.ts`
- **.seed()** (4 connections) — `src/services/storageDB.ts`
- **.delete()** (3 connections) — `src/services/storageDB.ts`
- **.initAsync()** (3 connections) — `src/services/storageDB.ts`
- **.toQueryString()** (3 connections) — `src/services/storageDB.ts`
- **.update()** (3 connections) — `src/services/storageDB.ts`
- **.constructor()** (2 connections) — `src/services/storageDB.ts`
- **.insert()** (2 connections) — `src/services/storageDB.ts`

## Relationships

- [AI Service Layer](AI_Service_Layer.md) (3 shared connections)

## Source Files

- `src/services/storageDB.ts`

## Audit Trail

- EXTRACTED: 23 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*