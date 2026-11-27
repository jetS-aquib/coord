---
id: JET-471
title: Console v2: System (health from /ops, controls with kill switch route, feature flags create/target/archive/usage)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:49:02+05:30
updated: 2026-11-27T15:52:00+05:30
decisions: 
---

## Request

System pages on /ops/*, /killswitches and /posthog/flags (.coord/contracts/api-admin.md Ops, PostHog; JET-451, JET-456) with D-110 Q8.
Size: M. Builds on: JET-460, JET-461, JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Health: provider lights from circuits plus 24h error rate and p95 per provider; API panel (requests, rpm, 5xx/4xx rate, p50/p95 as histogram edges, by route group, hourly); pipeline (in flight by stage, stuck table with Restart/Cancel, median phase times, retry rate, failure reasons); alerts feed (server_alert, 7 days); loops (last run per process, state that it is the answering instance). No paid monitoring (D-110). Controls: kill switches as channel strips (GET/POST /killswitches; off is C2 + re-auth; confirm effect by polling serverSees); spend breaker level meter and launch limits form (GET /flags). Flags: table with state light, rollout slider (step 5), conditions on person properties, allow/deny by email (server maps to ids; show unknown_emails), create (key rules), archive, 30-day usage; kill switch keys refused (409 use_killswitch_route). Maintenance = renders kill switch (D-110 check (a)); say so in its strip help.

## Plan

1. Health page.
2. Controls page with channel strips.
3. Flags list, detail, create, targeting, usage.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/control/** -> system/**

## Acceptance criteria

Turning renders off asks for a recent sign-in, then the strip turns Off once serverSees changes; a stuck test render appears on Health with Restart; adding an unknown email to a flag allow list shows which email is unknown.

## Test steps

—

## Thread
2026-11-26T15:49:02+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:52:00+05:30 aquib N: status: open -> approved
