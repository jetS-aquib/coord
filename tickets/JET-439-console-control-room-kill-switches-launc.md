---
id: JET-439
title: Console control room: kill switches, launch limits, spend breaker, feature flags, config bundles
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:12+05:30
updated: 2026-11-26T12:39:15+05:30
decisions: 
---

## Request

One page to switch the platform's behaviour without a deploy.

## Understanding

Reads GET /admin/flags (kill switches, launch limits, today's spend); flips PostHog flags and rollout % via JET-427; publishes and activates config bundles via JET-430. Kill switches get a big confirm since they stop renders or signups for everyone.

## Plan

1. /control: kill switch toggles, launch limit and breaker values, today's spend vs breaker.
2. Feature flags table: active toggle, rollout %, payload editor.
3. Config bundles: versions, diff, publish, activate.

## Reason

—

## Related files

apps/admin/app/(console)/control/**

## Acceptance criteria

Turning renders-enabled off from the console makes the app refuse new renders within 30s; turning it on restores them.

## Test steps

—

## Thread
2026-11-24T17:05:12+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:39:15+05:30 aquib N: status: open -> approved
2026-11-26T12:57:02+05:30 aquib N: BUILT (uncommitted). /control: kill switch cards (renders-enabled, new-signups-enabled, catalogue-enabled, tier-best-enabled via PATCH /posthog/flags/:key active; turning off needs the key typed), spend today vs dailySpendUsd breaker bar, launch-limits payload editor, render flags, feature flags table (toggle, rollout %, payload; complex/multivariate say edit in PostHog). /control/config/[bundle]: versions, live vs selected, publish version, make live / roll back. No backend change needed. TEST: renders-enabled off -> app refuses renders within ~30s; on -> restored.
