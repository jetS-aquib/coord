---
id: JET-476
title: Console v2: say where admin data comes from (PostHog, database or live server) on every /api/admin response
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-27T16:25:34+05:30
updated: 2026-11-27T16:29:54+05:30
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

1. In the console, open any admin page; in the browser network tab every /api/admin response has an X-Data-Source header (readable from JS: CORS exposes it). 2. `GET /api/admin/flags` has header `server,db` and a `sources` object (spendTodayUsd 'db', killSwitches 'server'). 3. `POST /api/admin/analytics/query {name:'dau',from,to}` has header `posthog` and an `asOf` time; repeat within a minute: `cached: true`, same asOf. 4. `GET /api/admin/meta`: `sources` lists every route with its source. 5. `GET /api/admin/ops/providers` has `sources: {circuits:'server', last24h:'db'}`.

## Thread
2026-11-27T16:25:34+05:30 aquib N: created ticket, status: - -> open
2026-11-27T16:26:30+05:30 aquib N: status: open -> approved
2026-11-27T16:29:50+05:30 aquib N: BUILT. Contract section 'Data source labels'. One table (src/routes/adminSources.ts) and one middleware mounted before auth, so every /api/admin answer has X-Data-Source, refusals included; CORS exposes it. GET /meta returns sources: [{method, route, source}] built from the same table, and adminAccess.test.ts fails if a mounted route has no entry. asOf is on /analytics/query, /users/:id/events, /posthog/flags and /ops/alerts. CORRECTIONS to apps/admin/lib/sources.ts (once the header is read, the table can go): (1) /flags is 'server,db', not posthog,db,server: launch limits and kill switches there are this instance's polled copy of PostHog (up to ~30s old, and per instance), not a PostHog call. (2) /config/:bundle 'live' is 'server' for the same reason (or 'db' when source='latest'); the versions are db. (3) POST /config/:bundle/:version/activate is posthog,db, and POST /killswitches/:key is posthog. (4) /meta is db,server (plans from db, enums and schemas from code), /me is db. (5) /killswitches: inPosthog/active come from PostHog's API, serverSees is server. Everything else matches.
2026-11-27T16:29:54+05:30 aquib N: status: approved -> in_progress
2026-11-27T16:29:54+05:30 aquib N: status: in_progress -> review — built; see the BUILT note and Test steps
2026-11-27T16:32:43+05:30 aquib N: Web side done (uncommitted): api() reads X-Data-Source + asOf per request (lib/sources.ts recordSource/sourceOf, React request cache); labels show 'as of HH:MM UTC' on PostHog answers; mixed answers use 'sources' per field (Controls spend breaker); fallback table updated to your corrections (/flags server,db; /config/:bundle db,server; /meta db,server; POST killswitch/activate posthog). Checked live: Analytics 15 PostHog tags with asOf, Controls tiles Database/Live server/Live server. Verified working from the web side.
