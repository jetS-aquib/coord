# Repo Docs and Test Topology

> 40 nodes · cohesion 0.06

## Key Concepts

- **coord CLI and .coord board** (6 connections) — `.github/copilot-instructions.md`
- **Self-contained billing test topology (JET-126)** (5 connections) — `test/billing/docker-compose.yml`
- **mongo service (mongod :27019)** (5 connections) — `test/billing/docker-compose.yml`
- **evidence: documented vs captured** (5 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- **creater-ai-backend repo** (4 connections) — `.github/copilot-instructions.md`
- **JET-nnn issue tags in code** (4 connections) — `.github/copilot-instructions.md`
- **Cross-repo write guard (ask once per pair)** (3 connections) — `.github/copilot-instructions.md`
- **Contracts owned by creater-ai-backend** (3 connections) — `.github/copilot-instructions.md`
- **Search first, read the part not the file** (3 connections) — `.github/copilot-instructions.md`
- **JetKreate creator API** (3 connections) — `README.md`
- **mongod --auth enabled (JET-134 privilege boundary)** (3 connections) — `test/billing/docker-compose.yml`
- **Standalone, no replica set** (3 connections) — `test/billing/docker-compose.yml`
- **PROVIDER_MAPPINGS.byteplus (providerCosts.ts)** (3 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- **coord ctx shared facts** (2 connections) — `.github/copilot-instructions.md`
- **jetKreate platform (3 repos)** (2 connections) — `.github/copilot-instructions.md`
- **JET-nnn commit message prefix** (2 connections) — `.github/copilot-instructions.md`
- **Startup env schema in src/config/env.ts** (2 connections) — `README.md`
- **Frontend request-signing key must match the API** (2 connections) — `README.md`
- **Source map (entry, routes, modules, services, models)** (2 connections) — `README.md`
- **Application-level atomicity (src/modules/billing/atomic.ts)** (2 connections) — `test/billing/docker-compose.yml`
- **tmpfs /data/db disposable state** (2 connections) — `test/billing/docker-compose.yml`
- **BYTEPLUS_GEOMETRY refusing unobserved resolutions** (2 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- **Contracts section 22** (2 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- **No BytePlus bill export captured** (2 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- **Four-step promotion to evidence: captured** (2 connections) — `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`
- *... and 15 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `.github/copilot-instructions.md`
- `README.md`
- `test/billing/docker-compose.yml`
- `test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md`

## Audit Trail

- EXTRACTED: 37 (82%)
- INFERRED: 7 (16%)
- AMBIGUOUS: 1 (2%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*