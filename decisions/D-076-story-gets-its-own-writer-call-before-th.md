---
id: D-076
title: Story gets its own writer call before the treatment, and each location gets its own reference plate
date: 2026-11-06
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-262
---

## Context

The treatment wrote story, places, wardrobe and look in one answer, from at most 6 lyric lines a section and no energy or timing, so the story did not follow the music. The single plate showed only the first clip's location, so later locations had no image reference.

## Options considered

1) Enlarge the treatment prompt with all lyrics and energy. 2) A separate writer call before the treatment that owns the story; the treatment stages it. 3) Per-section location plates. 4) One plate per unique location text, plus a people-only cast sheet.

## Decision

2 and 4. scriptV1.ts writes premise, turn and one scene per section hung on a sung line; the treatment receives it and its beats come from the script. The cast sheet goes in generateSceneImage's character slot and the location plate in its scene slot, so the shared image function is unchanged. Both are behind flags, RENDER_SCRIPT_WRITER=1 and RENDER_LOCATION_PLATES=1, and off by default.

## Reason

One call doing four jobs did the story worst; splitting it gives the story the whole song without making the staging answer longer. Reprises already share location text, so per-location plates cost 2-3 images, not one per section.

## Consequences

+1 text call (with one retry) and +2-3 images per render when on. A null script leaves the treatment prompt byte-identical. App-facing shape unchanged (logline/beats); a new crew chair 'writer' appears in crew notes. Location plates fix architecture, not light, but generateSceneImage labels the scene reference as 'match environment and lighting', so a night section drawn against a day plate may lean toward day; watch for it.
