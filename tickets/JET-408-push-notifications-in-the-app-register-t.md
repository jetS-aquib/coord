---
id: JET-408
title: Push notifications in the app: register the device and open the right screen when a render finishes or needs you
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:50:07+05:30
updated: 2026-11-23T15:50:07+05:30
decisions: 
---

## Request

Depends on: JET-393, JET-399.

Register an Expo push token after sign-in (and remove it on sign-out); ask permission at the first 'Leave it running', not at launch; tapping 'Zaaya is ready' opens the video page, 'needs you' opens Working, 'stills are ready' opens the call sheet.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

expo-notifications is a new dependency (coord decide). FCM/APNs credentials must be set on EAS by whoever owns the store accounts. In-app polling stays as the fallback when permission is denied.

## Plan

1. Install expo-notifications; permission at first leave.
2. Register/unregister token.
3. Notification response routing by projectId.
4. EAS credentials checklist.

## Reason

Brings people back after a multi-minute render.

## Related files

src/lib/notifications.ts, src/app/_layout.tsx, src/lib/session.ts, src/app/(create)/working/[id].tsx, app.json

## Acceptance criteria

Start a render, leave, background the app: the notification arrives at completion and opens the video.

## Test steps

—

## Thread
2026-11-23T15:50:07+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:06:32+05:30 aquib N: Deprioritised 2026-11-23: push notifications are the last batch, after release QA. In-app polling on Home (JET-403) covers 'your video is ready' until then.
