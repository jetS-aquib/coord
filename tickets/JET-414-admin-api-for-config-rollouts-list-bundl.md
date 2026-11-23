---
id: JET-414
title: Admin API for config rollouts: list bundle versions, diff, move the ui-config pointer, roll back, kill switch
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T19:25:04+05:30
updated: 2026-11-23T19:25:04+05:30
decisions: 
---

## Request

The app reads versioned config bundles through the PostHog 'ui-config' flag payload (JET-412/413). Today a rollout means editing that JSON by hand in PostHog, and the admin API can only publish a bundle (POST /api/admin/config/:bundle). The admin panel needs endpoints to see what is live and move it safely.

## Understanding

Assumptions: (1) scope is config bundles only (starters, styles, lyricLooks, directors, copy, limits, home), not EAS OTA updates (those stay on the EAS CLI, docs/ota-runbook.md); (2) the pointer stays in PostHog and the backend writes it through the PostHog API with a personal API key held server-side (new env, never sent to the client); if that key is not configured the endpoints answer 503 and the manifest's existing fallback order is unchanged; (3) every pointer change is audited (who, from, to, when) by the existing auditAdmin middleware plus a stored history so a rollback can name the previous pointer; (4) the pointer is validated before it is written: every named bundle@version must exist and pass its schema; (5) a percentage/staged rollout is out of scope for v1 (PostHog release conditions can do it later); say so if you want it in.

## Plan

1. GET /api/admin/config: per bundle, versions (createdAt, createdBy, minAppVersion) and which one is live.
2. GET /api/admin/config/:bundle/:a/diff/:b: JSON diff of two versions.
3. PUT /api/admin/config/pointer {bundles, killSwitch}: validate, write the PostHog ui-config payload, store history.
4. POST /api/admin/config/pointer/rollback: back to the previous stored pointer.
5. Tests: invalid version refused, missing PostHog key -> 503, rollback restores previous.

## Reason

Content and look changes should ship from the admin panel in a minute, with a record and a one-click undo, instead of hand-editing JSON in PostHog.

## Related files

—

## Acceptance criteria

From the API alone: list shows styles@1 and @2 with @2 live; moving home to a new version updates the PostHog payload and GET /api/v1/config/manifest reflects it; rollback restores the previous pointer; a pointer naming a missing version is a 400.

## Test steps

—

## Thread
2026-11-23T19:25:04+05:30 aquib N: created ticket, status: - -> open
