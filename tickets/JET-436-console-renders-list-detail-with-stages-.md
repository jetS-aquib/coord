---
id: JET-436
title: Console renders: list, detail with stages, shots and cost, and cancel/resume/stitch
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:08+05:30
updated: 2026-11-26T12:39:04+05:30
decisions: 
---

## Request

Watch and rescue renders from the console.

## Understanding

List from GET /admin/renders (status, user filters) with cost; detail from JET-429's render detail; actions call the existing cancel/resume/stitch routes. Links to the PostHog trace (trace id = jobId) and to the user.

## Plan

1. /renders table with status tabs and auto-refresh every 15s while any is running.
2. /renders/[jobId]: stages timeline, shots grid with stills/clips, cost breakdown, flag snapshot, logs.
3. Cancel/resume/stitch with confirms.

## Reason

—

## Related files

apps/admin/app/(console)/renders/**

## Acceptance criteria

A stuck render can be found and force-stitched from the console, and the action shows in the audit log.

## Test steps

—

## Thread
2026-11-24T17:05:08+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:39:04+05:30 aquib N: status: open -> approved
2026-11-26T12:57:01+05:30 aquib N: BUILT (uncommitted). /renders status tabs + user filter, auto-refresh 15s while any is running. /renders/[jobId]: stages strip, summary with user/project links, itemised cost, shots grid (clip or still), AI calls table, flag snapshot, timings, full plan JSON, audit (target=jobId). Cancel/Resume/Force stitch behind confirms. Optional env POSTHOG_APP_URL turns the trace id into a link. TEST: force-stitch a stuck render; it shows in the page's audit section.
