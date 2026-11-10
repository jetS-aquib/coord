---
id: JET-282
title: Performance shots tell the model to sing, so every singer mouths words that are not in the song
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:37+05:30
updated: 2026-11-10T14:39:16+05:30
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

1. Pick a song with lyrics and choose "The artist performing" in guided direction (most shots are performance). Render on the demo tier.
2. Server log: every performance clip's prompt ends with "Nobody sings, speaks or mouths words…" (search the log for "mouths words").
3. Open the call sheet / shot list: performance shot lines describe playing, dancing, silhouettes, wide or side-on shots, not "singing to camera".
4. Watch the finished video: count shots where a face visibly mouths words. Expect none or close to none (a model can still slip; note how many). Performance should still read as performance.

## Thread
2026-11-10T01:57:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:37:36+05:30 aquib N: status: open -> approved
2026-11-10T14:39:16+05:30 aquib N: status: approved -> in_progress
2026-11-10T14:39:16+05:30 aquib N: Built. Shot-list rule for the performance lane now says nobody sings or mouths words on camera and offers framings (closed mouth, turned away, silhouette, behind a mic, wide/side-on/back-lit). Every performance clip's prompt gets NO_MOUTHING_V1 appended (renderOrchestratorV1.ts), including re-renders and refusal salvage. Done as one rule for every director rather than passing Mira's voice through: it is a limit of the model, not a style. No API change, so nothing for mobile.
2026-11-10T14:39:16+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
