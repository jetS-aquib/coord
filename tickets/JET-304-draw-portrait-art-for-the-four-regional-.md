---
id: JET-304
title: Draw portrait art for the four regional directors (Jassi, Rohan, Gauri, Neel) and serve it like the older three
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T23:50:38+05:30
updated: 2026-11-10T23:53:07+05:30
decisions: 
---

## Request

Create avatar images for punjabi-pop (Jassi), bollywood (Rohan), devotional (Gauri) and indie-hindi (Neel), matching the style and size of the existing assets/directors/*.webp, and serve them from the same avatar route so GET /directors returns a real avatarUrl for all seven instead of ''.

## Understanding

JET-289 added the four regional directors with avatarUrl '' until their art ships (api-music-videos.md, Directors). The app already draws a monogram when avatarUrl is empty and swaps to the portrait the moment a URL arrives, so no app change is needed. Seen on a device: Rohan and Jassi show letter circles next to Mira's illustrated portrait, which looks unfinished. Assumptions: (1) the older three are static webp files shipped in assets/directors and served on mediaRouter by avatarUrlV1(id), and the new four should follow exactly that, not be generated per request; (2) each portrait should read as that director's persona (Jassi: Punjabi pop and bhangra, outdoors, swagger; Rohan: Bollywood romance, sweeping; Gauri: devotional; Neel: indie Hindi) in the same illustration style as Mira, Dev and the others; (3) I have not looked at the existing images' exact size or style, so match them rather than my description.

## Plan

1. Look at the three existing assets/directors/*.webp for size, crop and style.
2. Make one portrait per regional director from its persona in the director list (intro, knownFor, traits), same style, same dimensions, webp.
3. Add the four files under assets/directors/ named by director id and make avatarUrlV1 return a URL for them.
4. Check GET /api/v1/music-videos/directors returns a non-empty avatarUrl for all seven and the image route answers 200 for each.
5. Update the Directors note in api-music-videos.md: avatarUrl is no longer '' for the regional four.

## Reason

A creator on a Punjabi or Bollywood track is shown a regional director first, and that card is the only one in the list without a face.

## Related files

assets/directors/ (4 new webp), src/services/render/directorsV1.ts or wherever avatarUrlV1 lives, .coord/contracts/api-music-videos.md

## Acceptance criteria

All seven directors return a real avatarUrl, each image loads on a device, and the regional four match the older three in size and style.

## Test steps

1. Open the director screen in the app: all seven cards show a drawn portrait, no letter circles.
2. Jassi (turban, blue), Rohan (cream blazer, plum), Gauri (dupatta, sage), Neel (t-shirt, terracotta) look like the same illustrator as Mira, Dev and Kabir, and each is tellable apart at the small circle size.
3. `GET /api/v1/music-videos/directors`: every `avatarUrl` is non-empty, and each opens as a 512x512 image (they are on the bucket: storage.googleapis.com/jetkreate/project_live/directors/<id>.webp).

## Thread
2026-11-10T23:50:38+05:30 aquib N: created ticket, status: - -> open
2026-11-10T23:53:07+05:30 aquib N: status: open -> approved
2026-11-10T23:55:54+05:30 aquib N: Drawn with the committed generator (scripts/generate-director-avatars.ts), same style block as the older three, four new subjects. Rohan redrawn once: dark blazer on plum was one blob at 56pt, now a cream blazer. Uploaded to the bucket with scripts/upload-director-avatars.ts; all four answer 200. No code change to serving: avatarUrlV1 already returns a URL for any director with a file. Contract note updated.
