---
id: JET-436
title: Console renders: list, detail with stages, shots and cost, and cancel/resume/stitch
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-24T17:05:08+05:30
updated: 2026-11-24T17:05:08+05:30
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
