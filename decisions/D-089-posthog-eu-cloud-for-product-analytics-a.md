---
id: D-089
title: PostHog (EU cloud) for product analytics, AI observability, evals and runtime flags; Mongo stays the record that enforces limits
date: 2026-11-19
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-372, JET-373
---

## Context

Launching free with no analytics, no remote flags, no kill switches and AI cost only in Mongo.

## Options considered

PostHog cloud EU | PostHog cloud US | self-hosted PostHog in India | separate tools (Mixpanel + Langfuse + LaunchDarkly + Sentry)

## Decision

PostHog cloud, EU region, one SDK on backend and mobile. distinct_id = Mongo user id, $ai_trace_id = render jobId. flags.ts keeps defaults and PostHog overrides at runtime; a render snapshots its flags. Limits are enforced from Mongo, never from PostHog.

## Reason

One vendor covers analytics, LLM traces with cost, evals, flags, replay and error tracking with a free tier that fits a beta; EU gives GDPR-grade handling; no India region exists and DPDP has no localisation rule for this data today.

## Consequences

Omni video calls are captured manually (the Gemini wrapper only covers generateContent). Flags are undefined until the first poll, so every flag needs a safe default. Revisit self-hosting if India residency becomes a requirement.
