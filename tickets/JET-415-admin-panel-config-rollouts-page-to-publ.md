---
id: JET-415
title: Admin panel: Config rollouts page to publish bundles, compare versions, move what is live and roll back
from: music-jetkreate-mobile
to: music-jetkreate-frontend
filed_by: aquib N
status: open
created: 2026-11-23T19:25:05+05:30
updated: 2026-11-23T19:25:05+05:30
decisions: 
---

## Request

Add an admin-only page in the web app for the app's config bundles (JET-412/413): see each bundle's versions and which is live, preview and compare two versions, publish a new version from JSON, move the live pointer, flip the kill switch, and roll back. Uses the admin API from the companion backend request.

## Understanding

Assumptions: (1) it sits behind the existing AdminRoute and admin sidebar section, like /public-assets; (2) editing is JSON with schema errors shown inline (the backend returns the zod error); no visual editor for blocks in v1; (3) preview shows images for starters/styles (cover/still URLs) and a plain JSON diff for the rest; (4) moving the pointer and the kill switch both ask for confirmation and show what will change; (5) EAS OTA updates are not part of this page.

## Plan

1. Route /admin/config behind AdminRoute; sidebar entry.
2. Bundles table: versions, live marker, created by/at.
3. Version view with image previews and a diff against live.
4. Publish form (JSON + schema errors).
5. Go live / roll back / kill switch with confirm dialogs and the change history.

## Reason

Lets the team ship starters, styles, copy and Home blocks to the app without an app release or touching PostHog by hand.

## Related files

—

## Acceptance criteria

An admin publishes home@2 with an extra banner, compares it with @1, makes it live, sees the banner in the app after its next foreground refresh, then rolls back and the banner is gone. A non-admin gets the not-found page.

## Test steps

—

## Thread
2026-11-23T19:25:05+05:30 aquib N: created ticket, status: - -> open
2026-11-23T19:25:09+05:30 aquib N: Depends on: JET-414 (backend admin API).
