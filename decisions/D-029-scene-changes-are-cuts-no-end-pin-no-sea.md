---
id: D-029
title: Scene changes are cuts: no end pin, no seam score, measure the break and do not enforce it
date: 2026-10-27
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-210
---

## Context

Anchors are one per clip boundary: anchor i opens clip i and closes clip i-1. deriveAnchorsV1 builds anchor i from clip i's own prompt, so at a scene change that still already depicts the NEW scene. renderOneClipV1 pinned the previous clip to end on it, and scoreClipV1 measured that end against it, so the last clip of every verse was asked to arrive at the chorus inside its own four seconds and then re-rendered for failing to. Every scene change in every render was paying generation money to produce a dissolve, and some were paying twice.

## Options considered

1. Leave it: continuity enforced everywhere, cuts dissolve, re-render budget spent on clips that cannot comply. 2. Unpin and stop scoring at scene boundaries; nothing else. 3. Unpin, stop scoring, and ALSO enforce a minimum difference across the cut so a scene change cannot look like a match cut.

## Decision

Option 2 plus the measurement half of 3. isSceneBoundaryV1(clips, boundaryIndex) is a pure predicate in RenderPlanV1.ts. At a scene boundary the previous clip gets no end frame (which also makes it unpinned, so it takes the wordier prompt path and cannot be re-rendered pinFocused), the fallback-to-previous-clip-frame does not reach across one either, and scoreClipV1 keeps the last-frame comparison out of the continuity max. That same comparison is still made and stored as clip.breakScore.

## Reason

The craft rule is continuity inside a scene and a clean break across one; two shots that match across a cut read as a jump cut. Measuring for a break while the model is pinned to produce a match burns the re-render budget on something it cannot fix, which is the same shape of failure D-018 paid for over five renders. The enforcement half is held back because there is no measured band for 'too similar across a cut' — and an unmeasured absolute threshold is exactly what the 4.0 seam threshold cost before D-018 re-based it from real data.

## Consequences

Scene changes become visible cuts. The re-render bill drops by whatever share of it was scene boundaries. breakScore accumulates per clip and is deliberately not on the wire; after a render or two there is a distribution to pick a minimum-difference threshold from, the way 9.0 was picked. A clip before a scene change now carries its scene in words rather than in a pin, so its prompt matters more than its neighbours'. No change on video-processing-backend: the same frame-comparison calls are made, one of them is read differently.
