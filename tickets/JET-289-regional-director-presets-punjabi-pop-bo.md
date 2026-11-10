---
id: JET-289
title: Regional director presets: Punjabi pop, Bollywood cinematic, devotional, indie Hindi
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:42+05:30
updated: 2026-11-10T20:28:12+05:30
decisions: 
---

## Request

Add directors whose look and rules fit regional genres, so the creator can pick one that knows the music.

## Understanding

Built on the song-context request; a preset is a director whose voice and rules are culture-specific. Assumption: 4 presets to start; the brief suggests one from the song context.

## Plan

Depends on: JET-288.
1. 4 presets in directorsV1.ts with their own voice, look and rules.
2. The brief ranks them using the song context.
3. Mobile picks them up from the existing directors list.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Three directors today (Mira, Dev, Kabir), all genre-neutral, carrying only numbers plus a one-line voice. Competitors (Atlabs) sell regional presets.

## Related files

src/services/render/directorsV1.ts, briefV1.ts

## Acceptance criteria

A Punjabi song's brief offers the Punjabi pop director first, and a render with it looks like the genre.

## Test steps

—

## Thread
2026-11-10T01:57:42+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:28:12+05:30 aquib N: status: open -> approved
