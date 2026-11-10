---
id: JET-282
title: Performance shots tell the model to sing, so every singer mouths words that are not in the song
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:37+05:30
updated: 2026-11-10T14:37:36+05:30
decisions: 
---

## Request

Until we have real lip sync, stop asking the video model for visible singing; shoot performance so the mouth does not have to match.

## Understanding

Real lip sync needs a non-Google provider and is last priority (separate R&D request). This is the free mitigation: performance framed wide, side-on, back-lit, on the instrument, eyes closed, mouth closed or hidden, crowd and hands. Assumption: a close-up of a singer is still allowed when the mouth is out of frame or obscured.

## Plan

1. Shot-list rules: performance shots never mouth or sing words; offer the framings above.
2. clipPromptV1 appends a short "mouth closed, no lip movement, no speech" line to performance shots.
3. Pass the director's no-mouthing rule through to the shot list.
4. Render one song with "artist performing" and count shots with visible mouthing before/after.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). shotListV1.ts:437 asks performance shots for "Singing, playing, moving to it", with the lyric line passed as "sung here". "The artist performing" sets 60% of shots to performance (directionV1.ts:24). Omni and Veo generate their own audio and accept no audio input, so the mouth can never match the user's recording. Mira's "nobody mouths the words" lives only in her voice, which reaches the treatment, not the shot list (directorsV1.ts:206). Google only, no new cost.

## Related files

src/services/render/shotListV1.ts, src/services/render/renderPromptsV1.ts, src/services/render/directorsV1.ts

## Acceptance criteria

A render with "artist performing" has no shot where a face visibly mouths words; performance still reads as performance.

## Test steps

—

## Thread
2026-11-10T01:57:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:37:36+05:30 aquib N: status: open -> approved
