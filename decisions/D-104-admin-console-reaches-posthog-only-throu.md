---
id: D-104
title: Admin console reaches PostHog only through music-jetkreate-backend
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-web, music-jetkreate-backend
tickets: 
---

## Context

src/routes/admin.ts:6 assumed the Next.js panel would read PostHog itself, server side. The console needs product dashboards, a per-user activity timeline, and feature-flag toggles.

## Options considered

—

## Decision

The console holds no PostHog keys and no PostHog SDK. The backend adds admin routes that run named HogQL queries, return a person's events, and list/patch feature flags, using a PostHog personal API key held only in backend env. Every flag change goes through auditAdmin into AuditLog.

## Reason

One place for secrets and one audit trail: flag changes made from the console are logged next to every other admin action, and access is gated by the same User.role check.

## Consequences

Backend gains POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID and a small PostHog REST client. Supersedes the comment at src/routes/admin.ts:6, which should be updated when the routes land. The PostHog UI stays the place for ad-hoc exploration.
