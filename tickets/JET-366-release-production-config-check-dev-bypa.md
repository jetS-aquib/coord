---
id: JET-366
title: Release: production config check — dev bypasses, R&D flags and dead routes
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T12:27:11+05:30
updated: 2026-11-19T12:27:11+05:30
decisions: 
---

## Request

One pass that makes sure nothing meant for dev or R&D is live in production, and fails boot loudly if it is.

## Understanding

Several switches are safe on a dev machine and dangerous in production: CAPTCHA_BYPASS_CLIENT (JET-244), flags.limits.generationLimit (D-071), the dev quota bypass, and the render R&D flags on feat/director-rnd (all on locally). src/routes/dbBrowser.ts can list and delete any document; it is commented out of src/index.ts, but one uncomment exposes the whole database. Assumption: a boot-time log banner plus a single test is enough; no new config system.

## Plan

1. Delete src/routes/dbBrowser.ts and its commented import.
2. A boot banner listing every non-default flag and any bypass that is set, at warn level.
3. Set the render flags to the values the eval renders pick before merging feat/director-rnd.
4. A test that the shipped flags.ts matches the release list.
5. Document the production env checklist in the release sheet.

## Reason

—

## Related files

—

## Acceptance criteria

Boot log shows every bypass/flag that is on; dbBrowser.ts is gone; flags.ts matches the agreed release values.

## Test steps

—

## Thread
2026-11-19T12:27:11+05:30 aquib N: created ticket, status: - -> open
