---
id: JET-396
title: Starter recipes: a list of ready-made looks (director, picks, style, example video) for new users
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:47:59+05:30
updated: 2026-11-23T15:47:59+05:30
decisions: 
---

## Request

Depends on: JET-412.

Nothing exists. The redesign adds a 'Start with a look' row on Home and on first-run Pick a track: each recipe pre-fills the create flow (director, picks, place, mood, style, aspect, tier) and shows an example video. The app's draft already holds every field (mobile create-context.tsx:35-80).

## Understanding

REVISED 2026-11-23 after the remote-config design (docs/ux-revamp-v2/REMOTE_CONFIG.md): no StarterV1 model or /starters endpoint. Recipes are the 'starters' bundle served by JET-412. This ticket is the content work: define 6-10 recipes {id, name, coverUrl, previewUrl, exampleVideoUrl, directorId, direction, where, special, visualStyle, aspectRatio, tier, order, enabled, demoTrack?}, render each once on the free credits to produce exampleVideoUrl/coverUrl, and publish them as starters@N. demoTrack stays empty until cleared audio exists (the song catalogue is preview-only and switched off, epidemicV1.ts:36), so phase A recipes use the person's own song.

## Plan

1. Write the recipe definitions (with product).
2. Render each recipe once; store cover and example video URLs on the /media host.
3. Publish the 'starters' bundle through JET-412's admin route; move the PostHog pointer.
4. Keep a seed script so the bundle can be rebuilt.

## Reason

New users start from a finished-looking idea instead of a blank form.

## Related files

src/models/StarterV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, scripts/seed-starters.ts

## Acceptance criteria

GET /starters returns the seeded recipes with playable exampleVideoUrl; turning the flag off returns 503 {code:'starters_off'}.

## Test steps

—

## Thread
2026-11-23T15:47:59+05:30 aquib N: created ticket, status: - -> open
