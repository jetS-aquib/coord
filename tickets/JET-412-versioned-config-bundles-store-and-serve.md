---
id: JET-412
title: Versioned config bundles: store and serve immutable bundles (starters, styles, lyric looks, directors, copy, limits, home blocks) behind a PostHog version pointer
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T16:05:15+05:30
updated: 2026-11-23T17:18:00+05:30
decisions: 
---

## Request

Depends on: nothing (PostHog is already wired via switchOn in shared/posthog.ts).

The app will load frequently changing data — media lists, copy, validation limits, Home content blocks — from versioned bundles instead of shipping it in builds. The active versions are a small JSON payload on a PostHog flag 'ui-config'; the backend stores and serves the bundles. This also absorbs JET-396 (starters become the 'starters' bundle). Design note: music-jetkreate-mobile docs/ux-revamp-v2/REMOTE_CONFIG.md.

## Understanding

Assumptions: (1) Mongo ConfigBundleV1 {bundle, version (int), schemaVersion, minAppVersion, payload, createdAt, publishedBy}, unique (bundle, version), immutable after insert; (2) GET /api/v1/config/:bundle/:version public to signed-in users, Cache-Control immutable for a year; (3) GET /api/v1/config/manifest returns the current pointer (env/DB-pinned) as the fallback when PostHog does not answer; (4) POST /api/v1/admin/config/:bundle (admin role) validates against a zod schema per bundle and creates the next version; optionally updates the PostHog flag payload through the PostHog API, otherwise the pointer is moved by hand in PostHog; (5) bundles hold data only — no expressions; (6) initial bundles and their schemas: starters, styles, lyricLooks, directors (display fields only; the render keeps using DIRECTORS_V1), copy, limits, home; (7) media URLs use the backend's own /media host (JET-194 posture); (8) a seed script publishes v1 of each from today's hard-coded values so the app's embedded defaults and v1 match.

## Plan

1. Model + zod schemas per bundle.
2. Read routes (bundle@version, manifest) with immutable caching.
3. Admin publish route.
4. Seed v1 from current values (visual styles, caption styles, director display, limits).
5. Create PostHog flag 'ui-config' with the v1 pointer.
6. Contract file in .coord/contracts describing bundle shapes.

## Reason

Lets content and limits change without an app release, and gives the starter library a home.

## Related files

src/models/ConfigBundleV1.ts, src/modules/config/*, src/routes/admin.ts, scripts/seed-config.ts, .coord/contracts/config-bundles.md

## Acceptance criteria

GET /api/v1/config/styles/1 returns the six visual styles with still URLs that open; publishing a new styles payload creates version 2 and version 1 still returns unchanged; an invalid payload is rejected with the zod error; GET /api/v1/config/manifest returns the pointer.

## Test steps

—

## Thread
2026-11-23T16:05:15+05:30 aquib N: created ticket, status: - -> open
2026-11-23T17:18:00+05:30 aquib N: status: open -> approved
