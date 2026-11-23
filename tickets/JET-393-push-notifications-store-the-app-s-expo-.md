---
id: JET-393
title: Push notifications: store the app's Expo push token and notify when a render finishes, fails or needs the person
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T15:47:55+05:30
updated: 2026-11-23T16:51:12+05:30
decisions: 
---

## Request

There is no push token on the user and nothing notifies anyone (models/User.ts). Renders take minutes; the app tells people they can leave and then cannot call them back.

## Understanding

Assumptions: (1) POST /api/users/me/push-tokens {token, platform} and DELETE on sign-out; a user can have several devices; (2) sending uses Expo's push HTTP API with plain fetch (no new dependency needed), batching up to 100; (3) notify on render status completed ('Zaaya is ready'), failed/blocked ('Zaaya needs you'), and review when the call sheet is ready ('Your stills are ready to approve'); payload data {projectId} so the app opens the right screen; (4) drop tokens Expo reports DeviceNotRegistered; (5) a push-enabled kill switch via switchOn; (6) FCM/APNs credentials are configured on EAS by whoever owns the store accounts — out of scope here, note it.

## Plan

1. User.pushTokens [{token, platform, createdAt}] + endpoints.
2. sendPush helper over fetch to exp.host.
3. Hook render status transitions.
4. Handle receipts / invalid tokens.
5. Kill switch.

## Reason

Brings people back when their video is ready; today they have to reopen the app and look.

## Related files

src/models/User.ts, src/modules/auth (users routes, beside DELETE /api/users/me), new src/shared/push.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Register a token from a dev build, start a short render, background the app: a notification 'Zaaya is ready' arrives at completion and tapping it opens the video.

## Test steps

—

## Thread
2026-11-23T15:47:55+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:06:32+05:30 aquib N: Deprioritised 2026-11-23: push notifications are the last batch, after release QA. In-app polling on Home (JET-403) covers 'your video is ready' until then.
2026-11-23T16:51:12+05:30 aquib N: status: open -> approved
2026-11-23T17:11:47+05:30 aquib N: Built, not committed. User.pushTokens (max 10 devices); POST/DELETE /api/users/me/push-tokens {token, platform}; src/shared/push.ts sends over fetch to exp.host in batches of 100 and drops DeviceNotRegistered tokens from the send's tickets (receipts not polled yet). Pushes on completed ('<title> is ready'), failed/blocked ('<title> needs you'), review ('Your stills are ready to approve' / 'Your plan is ready'); data {projectId, jobId, status}. Kill switch: PostHog push-enabled (default on). FCM/APNs creds on EAS are out of scope. TEST: register a dev-build token, start a short render, background the app -> 'Zaaya is ready' arrives and opens the video.
