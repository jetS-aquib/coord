---
id: JET-459
title: Console v2: correctness fixes (negative margin chart, money sign, kill switch wording, date defaults, swallowed errors)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-26T15:48:46+05:30
updated: 2026-11-26T15:48:46+05:30
decisions: 
---

## Request

Fix the console bugs found by the audit before any redesign (music-jetkreate-web/planning/ui-ux-audit/01 issues 1, 5, 9, 14; doc 08 F3).
Size: S. Builds on: none. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

The current console misleads in five places: Bars cannot draw negative values, so a −$183.72 margin shows as a positive bar; fmtUsd prints "$-183.72"; a kill switch that is off is labelled "failed"; the date "to" pre-fills tomorrow and defaults differ (30d vs 7d); Overview and Analytics drop errors from most calls and show "No data" instead. These are fixes in the existing components, not the v2 design system (that is W2/W3). Assumption: keep the current look; W3 later replaces the chart component anyway.

## Plan

1. chart.tsx: draw values around a zero baseline, negatives in destructive colour; fill missing days in pivot.
2. fmtUsd: true minus sign and thousands separators.
3. control/page.tsx: off -> "Off", on -> "On".
4. One default range (last 30 days, to = today) on Overview, Analytics, Billing; validate from <= to.
5. Show every failed call per panel (ErrorBox per card), never "No data" when the call failed.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/components/chart.tsx, apps/admin/components/ui.tsx, apps/admin/app/(console)/page.tsx, analytics/page.tsx, billing/page.tsx, control/page.tsx

## Acceptance criteria

With a negative margin day, the margin chart draws a bar below zero and the stat reads "−$183.72"; a kill switch that is off reads "Off"; Overview with one failing query shows that card's error and the other cards' data.

## Test steps

—

## Thread
2026-11-26T15:48:46+05:30 aquib N: created ticket, status: - -> open
