---
id: JET-294
title: R&D (last): real lip sync on performance shots from the song's vocal stem
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:46+05:30
updated: 2026-11-10T01:57:46+05:30
decisions: 
---

## Request

Find out whether we can make performance shots actually lip-sync to the user's song, at what cost and quality.

## Understanding

Last priority: needs a non-Google provider and new cost while we run on free Google credits. Nothing ships without a decision record.

## Plan

1. (a) One Omni clip with a quoted Punjabi line, to document that it fails.
2. (b) Vocal stem (Demucs) cut by word timings -> 3 performance shots through 2-3 lip-sync providers.
3. Compare sync quality, cost, latency; decision record and, if yes, a build request.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). No Google model takes an audio input; Omni dialogue is evaluated in English only and holds about 6-7s, and its audio is newly generated, so it cannot match the recording. Research: Kling Lipsync (~$0.03/s, 2-10s clips), Sync lipsync-2-pro (~$0.08/s), InfiniteTalk v2v; Hedra / OmniHuman for close-ups. About $2-5 extra per video.

## Related files

scripts/rnd/lipsync/

## Acceptance criteria

Three side-by-side shots per provider with cost and time, and a decision record.

## Test steps

—

## Thread
2026-11-10T01:57:46+05:30 aquib N: created ticket, status: - -> open
