---
id: JET-261
title: A branded public share page for a finished video, plus the share-link routes mobile calls
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-06T15:30:31+05:30
updated: 2026-11-06T15:30:31+05:30
decisions: 
---

## Request

Add (1) POST /api/music-videos/:id/share (requireAuth + signature, owner only) that creates or returns a random shareToken on the project and answers { url } where url is <public base>/s/<token>; (2) DELETE /api/music-videos/:id/share to revoke it; (3) a PUBLIC GET /s/:token (no auth, no signature, like /api/ai/local-upload) that returns server-rendered HTML: poster (posterUrl), a <video> player on finalVideoUrl served straight from GCS, the title, 'Made with jetKreate' branding and a get-the-app link, laid out for the project's aspectRatio (portrait or landscape). Include Open Graph and Twitter player meta tags (og:title, og:description, og:image, og:video, og:video:type, og:video:width/height, twitter:card=player) so WhatsApp, iMessage, Slack and X render a card. A revoked, unknown or unfinished project answers a friendly 404 page. Build the HTML as an escaped template string, no templating dependency. Rate limit the public route, set Cache-Control short, and never expose userId or internal ids on the page.

## Understanding

Mobile will call POST share, then pass the returned url to the native share sheet; a second option shares the mp4 file itself and needs nothing from the backend. I assume unlisted and permanent with revoke is the default and expiry is optional, that the GCS bucket is public-read so the page can use finalVideoUrl directly (if it is private the page must sign the URL per request), and that the public base URL comes from the existing BACKEND_URL setting. OPEN QUESTION FOR A HUMAN, NOT FOR CODE: whether music rights allow public sharing of videos containing Epidemic library tracks or user-uploaded copyrighted songs; someone should confirm before this ships.

## Plan

1. Add shareToken (unique, sparse, random 16+ bytes) to MusicVideo. 2. Add POST and DELETE /:id/share behind requireAuth and requireSignature with an owner check. 3. Add a public /s/:token route outside auth that renders the HTML, 404 page and OG tags. 4. Rate limit it and set Cache-Control. 5. Test: owner, non-owner, revoked, unfinished, escaped title, link preview in WhatsApp.

## Reason

Mobile is adding a Share button. Sharing the raw mp4 URL gives an ugly link and no preview; a branded page with OG tags is the only way chat apps show a real card, and it needs server-rendered HTML because our web client is a Vite SPA that crawlers cannot read. A random token, not the project id, because ids are guessable and a share must be a deliberate, revocable publish.

## Related files

src/models/MusicVideo.ts,src/modules/musicVideo/musicVideo.routes.ts,src/modules/musicVideo/musicVideo.controller.ts,src/routes/index.ts,src/modules/share/ (new)

## Acceptance criteria

POST share returns a stable url for an owned, completed project and 403/404 for anyone else or an unfinished one. Opening the url in a browser shows the poster, plays the video and carries the branding. Pasting it in WhatsApp or iMessage shows title and poster. DELETE share makes the same url a 404 page. The page contains no user id. HTML-escaping holds for a title like <script>.

## Test steps

—

## Thread
2026-11-06T15:30:31+05:30 aquib N: created ticket, status: - -> open
