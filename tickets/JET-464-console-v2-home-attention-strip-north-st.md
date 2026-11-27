---
id: JET-464
title: Console v2: Home (attention strip, north-star and KPI tiles, recent admin changes)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:53+05:30
updated: 2026-11-27T15:51:22+05:30
decisions: 
---

## Request

Home page from music-jetkreate-web/planning/ui-ux-audit/03 §2 using existing endpoints and D-110 definitions.
Size: S. Builds on: JET-460, JET-461, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Attention strip lists only abnormal items, by severity: a kill switch off (GET /killswitches), spend breaker > 80% (GET /flags), stuck renders (GET /ops/pipeline), open provider circuits (GET /ops/providers), accounts frozen in 24h, failure-rate spike, negative margin today, finance inputs for last month missing after the 10th (D-110 Q3). When nothing is wrong: one quiet "All systems normal" line. KPI tiles (30d, delta vs previous period): the north-star "weekly creators with a completed render" (D-110 Q6), WAU (active user = any event), new users, renders completed, failure %, AI cost, price vs cost at rate card. Recent admin changes: last 10 rows of GET /audit (kind=write). Tiles a role cannot read are hidden.

## Plan

1. Attention rules as small pure functions with a unit test each.
2. KPI tiles with drill-down links.
3. Recent changes list.
4. Role-aware rendering.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/page.tsx, apps/admin/lib/attention.ts (+ test)

## Acceptance criteria

With all healthy, the strip shows one calm line and no red; switching renders off shows "Renders off" in the strip on the next load; the north-star tile is labelled with its definition.

## Test steps

—

## Thread
2026-11-26T15:48:53+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:22+05:30 aquib N: status: open -> approved
