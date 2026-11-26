---
id: JET-429
title: Admin renders and content: render detail, moderation of videos and podcasts, feedback, public assets and elements
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:21+05:30
updated: 2026-11-26T12:23:42+05:30
decisions: 
---

## Request

Admin read and moderation routes for renders and every kind of user content.

## Understanding

GET /admin/renders lists plans with cost and cancel/resume/stitch exist; there is no detail view and no admin route for MusicVideo, Video, Podcast, VideoFeedback, PublicAssets or Element. Takedown means hidden from the owner's share link and public pages but not deleted, so it can be restored. Assumption: a takedown flag (moderation: {hidden, reason, by, at}) on MusicVideo/Video/Podcast is acceptable; share and media routes must honour it.

## Plan

1. GET /admin/renders/:jobId: plan, stages, shots, flag snapshot, cost, PostHog trace id (= jobId), GenerationLog rows.
2. GET /admin/{music-videos,videos,podcasts}?userId&status&q&cursor and /:id.
3. POST /admin/{kind}/:id/takedown {reason} and /restore; share and public media routes refuse hidden items.
4. GET /admin/feedback?cursor.
5. CRUD /admin/public-assets and /admin/elements.
6. Tests for takedown on the share route.

## Reason

—

## Related files

src/routes/admin.ts, src/models/MusicVideo.ts, src/models/Video.ts, src/models/Podcast.ts, share/public media routes, .coord/contracts/api-admin.md

## Acceptance criteria

A taken-down video's share link returns 404 and comes back on restore; render detail shows every stage and its cost; feedback lists newest first.

## Test steps

—

## Thread
2026-11-24T17:04:21+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:42+05:30 aquib N: status: open -> approved
