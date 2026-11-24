---
id: D-103
title: Onboarded music-jetkreate-web to coordination
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-web
tickets: 
---

## Context

pnpm + Turborepo monorepo modelled on iris: apps/www (public site, Next static export), apps/admin (admin console), packages/ui (shared shadcn/ui + Tailwind v4). Owns no contracts. Depends on music-jetkreate-backend: the console's only data source is /api/admin, called server-side.

## Options considered

—

## Decision

music-jetkreate-web joins the platform registry; it owns no contracts. Site and console share one repo and one UI package, laid out like iris (pnpm workspaces, turbo, one Vercel project per app).

## Reason

JET-372 built the admin API for a panel that was to live in a new repo once onboarded; the app also needs a public site (store listing, legal, account deletion).

## Consequences

Cross-repo changes to music-jetkreate-web now go through requests. Admin APIs it needs are filed to music-jetkreate-backend.
