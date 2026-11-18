---
id: JET-347
title: Revisit: director v2 as a style spec, steal-a-style, plan-only eval harness, graphic layer and cold open
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-18T01:21:27+05:30
updated: 2026-11-18T13:25:50+05:30
decisions: 
---

## Request

Track B from the 2026-11-18 R&D handoff: directors as a JSON style spec (cut density by energy, story_mode, B-story ratio, locations per minute, lyric relation, shot-type mix, camera vocabulary, palette per section with a hero colour, wardrobe changes, graphic layer, banned clichés). Convert the 7 directors, add 3 modern ones, place as a choice and not an auto-assignment, a B-story intercut, steal-a-style from a reference video (grammar only), a plan-only eval harness with a budget cap, block-grid and split-screen transitions, grain, and an audio cold open.

## Understanding

Nothing ships to prod from this until it is planned again after the demo. docs/rnd/01-director-v2-plan.md (written under JET-345) is the starting point. The eval harness needs a budget cap from the requester before any paid call.

## Plan

1. Re-read 01-director-v2-plan.md and the renders made with GEN_V2.
2. Schema and conversion of the existing directors.
3. Plan-only eval harness.
4. Prototypes behind flags.

## Reason

EDIT_V2/GEN_V2 is the demo-safe slice. This is the rest, kept so it is not lost.

## Related files

—

## Acceptance criteria

—

## Test steps

—

## Thread
2026-11-18T01:21:27+05:30 aquib N: created ticket, status: - -> open
2026-11-18T13:25:50+05:30 aquib N: status: open -> approved
2026-11-18T13:39:05+05:30 aquib N: Built (uncommitted, feat/director-rnd, flags.render.directorV2 on locally): DirectorSpecV2 {pace, motifShare, heroColour, paletteArc, banned} on all 7 directors; 3 new directors (street-pulse/Zoya, coastal-getaway/Ira, neon-chase/Kian) in catalogueV1() only under the flag; BANNED_V2 in treatment + shot list; director pace drives EDIT_V2; motif thread as the cheap B-story; planScoreV1 + scripts/rnd/evalPlans.ts (requires --budget-usd, not run); scripts/rnd/stealStyle.ts run on the reference -> docs/rnd/steal-tu-mil-jaaye.json. Graphic layer + cold open filed as JET-349. Not built: B-story with its own place, wardrobe changes, place as a user choice.
