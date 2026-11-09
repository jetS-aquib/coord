---
id: JET-271
title: Show the price before planning: an estimate from the song length and quality
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:23:38+05:30
updated: 2026-11-09T23:31:05+05:30
decisions: D-077
---

## Request

POST /api/v1/music-videos/estimate { audioUrl | seconds, aspectRatio? } -> { tiers: [{ tier, floor, ceiling, currency }] } from renderCostV1's arithmetic, no plan needed. Also correct renderCostV1's planning-call count (it assumes 3 text calls; the chain makes script, treatment, shot list, safety, cast = 5, +1 on blocked).

## Understanding

Mobile is adding a Ready screen where Quality is chosen with a live price per option, before the ~1 min planning wait. Today the price first appears on the call sheet, after Quality is chosen on the brief, and changing it there means restarting the flow. ASSUMPTIONS: (a) clip count can be estimated from duration and the cut plan's rate (or the song read when present) well enough that the plan's real range lands inside the estimate most of the time; (b) all three tiers in one response so the screen shows them side by side; (c) the call is cheap (no LLM), so mobile can call it on every screen open.

## Plan

1. Pure estimateCostV1(seconds, tier, aspect) reusing renderCostV1's constants.
2. Route + zod; audioUrl resolves duration via the song read when no seconds given.
3. Fix the text-call count in renderCostV1 and its header example.
4. Contract line in api-music-videos.md.

## Reason

Efficiency and trust: a creator should see what Draft/Standard/Best cost before they wait or decide.

## Related files

src/services/render/renderCostV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

For a 3:30 song all three tiers return a floor/ceiling; a real plan for that song at the same tier falls within its estimate; renderCostV1 counts 5 planning calls.

## Test steps

—

## Thread
2026-11-09T03:23:38+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
2026-11-09T23:31:05+05:30 aquib N: status: open -> approved
