---
id: JET-451
title: Console v2: ops observability (pipeline health, stuck renders, provider history, API latency/errors) - feasibility
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-26T15:07:28+05:30
updated: 2026-11-26T15:42:45+05:30
decisions: D-109, D-110
---

## Request

(1) GET /admin/ops/pipeline: in-flight renders by stage, median stage duration (24h), stuck renders (lease expired or no heartbeat > N min), clip retry rate, failure reasons. (2) GET /admin/ops/providers: current snapshot plus 24h history of error rate and latency. (3) GET /admin/ops/api: requests/min, p50/p95 latency, 5xx rate by route group, 24h. (4) GET /admin/ops/alerts: recent server_alert events. (5) Heartbeat record for background loops (song-read sweeper, render resume, job recovery) with last-run time.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b4. Suggested priority: P1 (pipeline + providers) / P2 (latency metrics).

## Understanding

No metrics store: only pino request logs with durationMs, server_alert PostHog events, /api/health and /api/health/providers (live circuit-breaker snapshot). Renders run in-process with Mongo leases; no queue, no cron. On-call cannot see p95 latency, 5xx rate, stuck renders, retry rates or provider history in one place. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: Pipeline: RenderPlanV1 lease/stage/attempts (exist). Providers and API: needs a store. Schema: Feasibility: (a) Mongo minute-rollup collection written by the request logger, TTL 30d; (b) PostHog events (sampled) queried by HogQL; (c) Cloud Monitoring/Logging if deployed on GCP. Recommend one. Events: If (b): api_request_sampled event. Security: Ops+ roles.

## Plan

1. Confirm feasibility and answer the open questions: Deployment target and existing monitoring (Cloud Run? GKE? VM)? Which store? Stuck threshold N?
2. Propose the API shape (GET /admin/ops/{pipeline,providers,api,alerts,loops}?from&to.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: A render whose lease expired 10 min ago appears as stuck with Resume offered.
4. Fill Test steps.
Risks: Adding write load per request; sampling and rollups needed. Dependencies: Where the backend is deployed (unknown to web team).

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Pipeline endpoint lists a deliberately stalled test render as stuck; provider history shows an induced circuit open; API panel numbers match logs within 5%.

## Test steps

1. `GET /api/admin/ops/pipeline`: inFlight by status/stage and last24h numbers. 2. Stall a test render: in Mongo set a running render's `leaseUntil` and `updatedAt` 20 minutes back; it shows under `stuck` with `restart`; `POST /api/admin/renders/<jobId>/restart` picks it up. 3. `GET /api/admin/ops/providers`: circuits plus hourly calls/error rate per provider. 4. Use the app for a few minutes, then `GET /api/admin/ops/api`: request counts per route group that match the server log. 5. `GET /api/admin/ops/loops` and `/ops/alerts` answer.

## Thread
2026-11-26T15:07:28+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:01+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:09+05:30 aquib N: BUILT (all five). Contract section 'Ops'; D-109. Store chosen: a Mongo per-minute rollup (ApiMetricMinuteV1, one row per minute per route group per instance, TTL 30d) written by the request logger. That works wherever we are deployed; if prod is on GCP, Cloud Monitoring can replace /ops/api later. Provider history needs no new store: it comes from GenerationLog (calls, failures, p50/p95 per hour). Stuck = worker status, no live lease, no write for N min (default 10, ?stuckMinutes=). Nothing picked those up before a restart, so there is a new POST /renders/:jobId/restart (allowedActions includes 'restart'), safe because it claims the lease first. Loops are per process (ponytail). p50/p95 on /ops/api are histogram bucket edges, so counts and 5xx match the logs exactly but latency is approximate.
2026-11-26T15:38:11+05:30 aquib N: status: approved -> in_progress
2026-11-26T15:38:11+05:30 aquib N: status: in_progress -> review — built; see the BUILT note and Test steps
2026-11-26T15:42:45+05:30 aquib N: linked decision D-110 (Go-to-market business defaults for the console: money, finance inputs, roles, retention, metric definitions, view-as, monitoring)
