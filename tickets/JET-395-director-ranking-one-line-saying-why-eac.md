---
id: JET-395
title: Director ranking: one line saying why each director suits this song
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-23T15:47:58+05:30
updated: 2026-11-23T16:51:18+05:30
decisions: 
---

## Request

rankDirectorsV1 (directorsV1.ts:472) scores directors by genre/place regex and returns {directors, best} with no reason. The redesigned Director screen shows the top 3 with one line of why ('Steady rhythm and one voice suit handheld, real-light scenes').

## Understanding

Assumptions: (1) a deterministic sentence built from the signals the ranker already used (tempo band from bpm, energy, places/genre matched, number of voices if known) — no extra model call or cost; (2) returned as directors[].why on the ranked list; only for the ranked call that has a song; (3) max ~70 characters.

## Plan

1. Collect matched signals in the scorer.
2. Template a why per director.
3. Return on the ranked response.

## Reason

Choosing a director becomes choosing a collaborator for a reason, not scanning seven bios.

## Related files

src/services/render/directorsV1.ts (or wherever rankDirectorsV1 lives), src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Ranked directors for Zaaya return a why for each, and the top director's why mentions the song's tempo or mood.

## Test steps

—

## Thread
2026-11-23T15:47:58+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:51:18+05:30 aquib N: status: open -> approved
2026-11-23T17:11:48+05:30 aquib N: Built, not committed. whyDirectorV1: tempo band from bpm, mood from mean energy, then 'their kind of <genre>' / 'they know <region>' / the director's first trait; <=70 chars, no model call. Only on the ranked call (audioUrl with a read song). TEST: GET /directors?audioUrl=<Zaaya>&title=Zaaya -> every card has why, the top one names tempo or mood; without audioUrl, no why.
