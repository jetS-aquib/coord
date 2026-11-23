---
id: JET-396
title: Starter recipes: a list of ready-made looks (director, picks, style, example video) for new users
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:47:59+05:30
updated: 2026-11-23T17:31:29+05:30
decisions: D-098
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
2026-11-23T16:06:31+05:30 aquib N: Revised in place 2026-11-23 (unapproved): see the REVISED note in Understanding and the updated Depends on line. Reason: remote-config design (JET-411..413) and the person's reprioritisation (auth backend later with Google sign-in, auth UI now, push last).
2026-11-23T17:18:14+05:30 aquib N: status: open -> approved
2026-11-23T17:31:18+05:30 aquib N: linked decision D-098 (Config bundle manifest fallback order, and starters stay data in the starters bundle)
2026-11-23T17:31:29+05:30 aquib N: status: approved -> in_progress
2026-11-23T17:31:29+05:30 aquib N: Built as content, per the revision. There are 10 trend recipes in seedV1.ts (starters@1), each mapped to a director already in the catalogue, with picks, where and special (the creative direction), a style, a caption look, coldOpen and the aspect: Sangeet night, Baraat (wedding season, Nov–Feb), Soft launch, Digicam diaries (Y2K), Silly little life, Dawn aarti, Neon 2049, Anime opening, Dreamworld (16:9) and Winter miniature (cozy, until mid-Jan). Four new looks went into styles@2 (digicam, super8, soft_focus, cyber_neon), and the pointer must say styles:2. There is also a home@1 with a wedding hero, a starter row and a new-looks banner. Covers and stills: scripts/draw-config-art.ts draws them, one image call each (14 in total), then --upload. NOT DONE: art is not drawn (it costs image calls; waiting on a go), example videos are not rendered (10 renders on credits plus a song for each; waiting on a go), demoTrack is null. The 'GET /starters 503' done-when is obsolete since the revision. TEST: GET /api/v1/config/starters/1 -> 10 recipes; each recipe's directorId is in /directors and its visualStyle is in /styles/2.
