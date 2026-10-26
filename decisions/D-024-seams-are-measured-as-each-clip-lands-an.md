---
id: D-024
title: Seams are measured as each clip lands, and the budget is spent first-come
date: 2026-10-26
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-200, JET-202
---

## Context

Verification was a phase of its own: every clip generated, then every clip scored, then the ones over threshold re-rendered. Nothing required that order. All 32 anchors exist before the first clip starts, so the moment clip 7 returns, anchors 7 and 8 are already there and it can be scored — no clip's measurement depends on any other clip. What the barrier cost was a tail at the end of every render, roughly 30-50s, with the video service idle through all of it, and it was also what blocked JET-202 from closing segments during generation rather than all at once.

## Options considered

(a) leave the phases split; (b) measure inline and keep the global worst-N re-render choice by deferring the spend to a second pass; (c) measure inline and spend the budget first-come.

## Decision

(c). verifyClipV1 is the single place a seam is measured and acted on, called as each clip lands and again by a sweep for anything it missed. One mutable RerenderBudgetV1 is shared by both. D-018's threshold is unchanged; what changes is WHICH clips the budget buys — the first N over the threshold rather than the globally worst N.

## Reason

The worst N cannot be known until every clip is scored, so keeping that property means keeping the barrier, which is the thing being removed. The property is worth little in practice: a budget of ceil(clips/5) is 7 on a 31-clip song and the last five renders had between 1 and 7 clips over the re-based threshold, so it rarely binds, and when it does the difference is which clips get the same money. (b) would keep it at the cost of a second pass, which is the barrier again under another name. verifySeamsV1 is deliberately kept as a sweep rather than deleted: a resumed render holds clips that are already done and were never scored, and the clip loop skips them precisely because they are done.

## Consequences

About 30-50s off every render, and the end of a render is no longer a phase where nothing overlaps. Unblocks the deferred half of JET-202 — a segment can now close as soon as its own clips are verified. A clip is scored by whichever lane rendered it, so a lane may spend ~41s on a re-render instead of pulling the next pending clip; total work is unchanged but lane occupancy is less even near the end. Every measurement is now appended to clip.seamScores including discarded takes, so whether re-rendering actually helps becomes answerable from data instead of from memory of a log line.
