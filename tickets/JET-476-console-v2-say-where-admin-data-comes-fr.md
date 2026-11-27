---
id: JET-476
title: Console v2: say where admin data comes from (PostHog, database or live server) on every /api/admin response
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-27T16:25:34+05:30
updated: 2026-11-27T16:25:34+05:30
decisions: 
---

## Request

The console must label every number, chart and table with its data source: PostHog, the database, or the live server process. Today the console guesses from a hand-written table (music-jetkreate-web/apps/admin/lib/sources.ts) read from the backend code on 2026-11-27. Please have the backend state the source on every /api/admin response so the label cannot drift from the code.

## Understanding

Add an X-Data-Source response header to every /api/admin route: a comma list of posthog | db | server, e.g. 'db', 'posthog', 'posthog,server'. For responses that mix sources, also add a top-level 'sources' object naming the source of each top-level field (e.g. GET /flags: { launchLimits: 'posthog', spendTodayUsd: 'db', render: 'server', killSwitches: 'posthog' }; GET /killswitches: { active: 'posthog', serverSees: 'server' }; GET /ops/providers: { circuits: 'server', last24h: 'db' }; GET /config/:bundle: { history: 'db', live: 'posthog' }). Assumptions: 'db' means MongoDB (incl. GenerationLog, ledger, renders, api metrics); 'server' means in-memory state of the answering instance (circuits, loops, env flags, serverSees); PostHog includes named queries, HogQL, events, flags, alerts. For PostHog answers, also say how fresh: analytics already returns 'cached'; add 'asOf' (ISO time the PostHog query ran) where cheap. Also list the per-route source in GET /meta (e.g. meta.sources: [{ route, source }]) so the console can show it before a call. The console's current guess table is in apps/admin/lib/sources.ts: please correct anything it gets wrong in the thread.

## Plan

1. Small middleware/helper setDataSource(res, ...sources) and call it in each admin route (or a route->source table next to adminAccess.ts rules, applied by one middleware).
2. Add 'sources' to the mixed responses listed above.
3. Add 'asOf' to PostHog-backed responses (analytics query, events, flags, alerts).
4. Expose the table in GET /meta as 'sources'.
5. Expose X-Data-Source in CORS exposed headers.
6. Document in .coord/contracts/api-admin.md; test that every admin route sets the header.

## Reason

Admins compare numbers across pages (e.g. renders per day from PostHog events vs render counts from Mongo) and can't tell why they differ. PostHog counts events the app sent and lags; the database is exact; server state is per instance. Without the source on screen, a PostHog-vs-database mismatch reads as a bug.

## Related files

src/routes/admin.ts, src/routes/adminAccess.ts (or new adminSources.ts), src/routes/adminOps.ts, src/shared/posthogApi.ts, src/modules/billing/billing.routes.ts, src/modules/finance/*, .coord/contracts/api-admin.md

## Acceptance criteria

Every /api/admin response has X-Data-Source; GET /flags, /killswitches, /ops/providers and /config/:bundle return a 'sources' object; GET /meta returns 'sources' per route; a test fails if a new admin route forgets the header; the contract documents it.

## Test steps

—

## Thread
2026-11-27T16:25:34+05:30 aquib N: created ticket, status: - -> open
