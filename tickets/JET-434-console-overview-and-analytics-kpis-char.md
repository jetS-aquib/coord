---
id: JET-434
title: Console overview and analytics: KPIs, charts, funnel, retention, HogQL box
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:05+05:30
updated: 2026-11-26T12:38:58+05:30
decisions: 
---

## Request

The landing page and analytics page of the console, fed by PostHog through the backend.

## Understanding

Uses JET-427's named queries; nothing calls PostHog directly (D-104). Overview shows KPI cards (users, active today, renders today, failures, AI spend today, credits issued/spent) and trend charts; Analytics adds a date range, the signup->first render funnel, weekly retention and a raw HogQL box. Needs JET-426 (W2) and JET-427.

## Plan

1. Overview: KPI cards + 30-day charts (shadcn chart).
2. Analytics: date range picker, funnel, retention grid, renders by status, failures by reason, spend per day.
3. HogQL box with result table and CSV download.
4. Loading and empty states; a clear 'PostHog not configured' state.

## Reason

—

## Related files

apps/admin/app/(console)/page.tsx, apps/admin/app/(console)/analytics/*

## Acceptance criteria

Numbers match the same insight in PostHog for the same range; a bad HogQL query shows the error, not a crash.

## Test steps

—

## Thread
2026-11-24T17:05:05+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:38:58+05:30 aquib N: status: open -> approved
