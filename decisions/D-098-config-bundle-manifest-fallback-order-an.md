---
id: D-098
title: Config bundle manifest fallback order, and starters stay data in the starters bundle
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-412, JET-396
---

## Context

The app needs a pointer when PostHog has not answered, and JET-396 asked for a /starters endpoint before the remote-config design.

## Options considered

Manifest: PostHog as the server sees it, then env, then newest; or newest only; or a DB-pinned pointer document.

## Decision

GET /config/manifest answers PostHog ui-config (server id), else UI_CONFIG_MANIFEST env, else the newest version per bundle. No /starters endpoint, no StarterV1 model: recipes are the starters bundle. Publishing never moves the pointer.

## Reason

Reuses remoteConfig and needs no new collection; publishing stays safe because nothing reads a new version until a person moves the pointer.

## Consequences

The fallback ignores per-user PostHog targeting. In the newest-versions fallback, a published but unpointed version becomes visible to apps that could not reach PostHog; set UI_CONFIG_MANIFEST in production to close that.
