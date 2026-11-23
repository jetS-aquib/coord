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

Nothing exists. The redesign adds a 'Start with a look' row on Home and on first-run Pick a track: each recipe pre-fills the create flow (director, picks, place, mood, style, aspect, tier) and shows an example video. The app's draft already holds every field (mobile create-context.tsx:35-80).

## Understanding

Assumptions: (1) StarterV1 {id, name, coverUrl, previewUrl, exampleVideoUrl, directorId, direction, where, special, visualStyle, aspectRatio, tier, order, enabled, demoTrack?: {audioUrl, contentHash}}; (2) GET /api/v1/music-videos/starters returns enabled ones in order; (3) kill switch 'starters-enabled' via switchOn, default true; (4) an admin seed script plus 6-10 recipes, each rendered once on the free credits to produce exampleVideoUrl; (5) demoTrack stays empty until cleared audio exists — the song catalogue is preview-only and switched off (services/music/epidemicV1.ts:36), so phase A recipes use the person's own song.

## Plan

1. Model + route + switch.
2. Seed script with recipe definitions.
3. Render each recipe once and store exampleVideoUrl/coverUrl.
4. Contract note.

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
