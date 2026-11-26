---
id: JET-430
title: Admin config and billing gaps, and remove the two no-auth seed endpoints
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:22+05:30
updated: 2026-11-26T12:23:46+05:30
decisions: 
---

## Request

Let the console browse and activate config bundle versions and browse credit ledgers, then delete the temporary seed endpoints.

## Understanding

POST /admin/config/:bundle publishes a version but nothing lists versions or makes one live (today that is the PostHog ui-config flag). Billing draft/publish/rollback and per-user routes already exist (billing.routes.ts:96-241, JET-422). POST /api/admin/billing/seed and /api/admin/config/seed have no auth (src/routes/index.ts:99-100, JET-412/418) and say 'delete with the admin panel'. Assumption: activating a version sets the ui-config flag through the B2 flag client, so this follows B2.

## Plan

1. GET /admin/config/:bundle (versions, which is live) and GET /admin/config/:bundle/:version.
2. POST /admin/config/:bundle/:version/activate.
3. GET /admin/billing/ledger?userId&kind&from&to&cursor if users/:id doesn't already page the ledger.
4. Delete both seed routes and their mounts; keep the seed scripts in scripts/.
5. Tests.

## Reason

—

## Related files

src/routes/index.ts, src/routes/admin.ts, src/modules/config/config.routes.ts, src/modules/billing/billing.routes.ts, .coord/contracts/api-admin.md

## Acceptance criteria

Both seed URLs return 404 without auth; a bundle's versions list with the live one marked; activate changes what /api/v1/config returns within a minute.

## Test steps

—

## Thread
2026-11-24T17:04:22+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:46+05:30 aquib N: status: open -> approved
