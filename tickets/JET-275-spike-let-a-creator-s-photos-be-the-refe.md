---
id: JET-275
title: Spike: let a creator's photos be the reference for cast and places
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:23:58+05:30
updated: 2026-11-09T23:31:22+05:30
decisions: D-077
---

## Request

R&D first, then build: accept castRefs[] (up to 3 image URLs) and placeRefs[] (up to 3) on the project; use a cast ref as the reference for that cast member's portrait (a stylised character in the chosen look, never sent raw to the video model) and a place ref for that location's plate. Spike question: what share of shots does the video model refuse when anchors come from a real person's photo, raw vs stylised, per visual style.

## Understanding

The owner wants image references for cast and environment. The pipeline already draws cast portraits and per-location plates as anchors (castPortraitPromptV1, locationPlatePromptV1), so a photo can replace a drawn reference. RISK: the first live v1 render lost 20 of 31 shots to 'no real people's likenesses', so a real face may be refused the same way; the spike decides whether this ships. ASSUMPTIONS: (a) uploads use the existing upload route; (b) the app shows a consent line on upload; (c) feature-flagged until the spike result is in.

## Plan

1. Spike: 3 photos x 3 styles x ~10 shots, raw vs stylised portrait; report refusal rate and likeness.
2. If viable: schema fields, portrait/plate generation from refs, behind a flag.
3. Contract update.

## Reason

The artist's own face and places are what make the video theirs.

## Related files

src/services/render/renderOrchestratorV1.ts, renderPromptsV1.ts, models, routes

## Acceptance criteria

Spike report with refusal rates; if built, a render with a cast photo shows that character consistently across shots behind a flag.

## Test steps

—

## Thread
2026-11-09T03:23:58+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
2026-11-09T23:31:22+05:30 aquib N: status: open -> approved
2026-11-10T01:09:02+05:30 aquib N: Backend: not started. The ticket is R&D first and the spike needs real face photos and ~90 video clips (~$70-90 at $0.10/s) — both need a person's go-ahead. Skipped for now by aquib N; nothing built. When it resumes: build castRefs/placeRefs behind a flag (stylised portraits only, never raw to the video model) plus the spike script, then run the spike before the flag ships.
