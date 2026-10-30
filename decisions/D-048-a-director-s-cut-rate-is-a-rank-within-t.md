---
id: D-048
title: A director's cut rate is a rank within the song, and it is allowed to be inert
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-225
---

## Context

Batch 8.9 and 8.11. D-046 binds every director value to being a weight or a preference order and never an absolute duration or count, because the song read decides cut points from real bars and real energy (6.4, D-031) and a dance director handed a ballad must shift that distribution rather than replace it. Three of the directors' six levers are the lane ratio, the shot ladder and the cut rate. The first two were already ratios. The third was not obvious: cutRateV1 derives minBars and maxBars from the bar length and the model's own duration window, and barsForEnergyV1 then picks the fast end for any bar above energyQuartileV1, the song's own 75th percentile.

## Options considered

1. Let a director set bars per clip directly. Visible, and it is the fixed grid Batch 6 removed wearing a different hat. 2. Let a director scale the clip length by a factor. Still a duration, and it detaches the cut from the bar. 3. Move the PERCENTILE: a director says how much of this particular song counts as its loud part, and the range stays the tempo's and the model's. 4. Give a director a separate minimum clip length, below the model's minimum, and trim the surplus.

## Decision

Option 3. DirectorProfileV1.cutFastPercentile is passed to energyQuartileV1, which now takes a percentile defaulting to 0.75 — the number every caller read before Batch 8. stays-close reads 0.90, holds-frame 0.75, fills-floor 0.50. The same value is read by shotGrammarV1 for the lane split, so the cut rate and the performance lane can never disagree about what this song's loud part is, which the old comment on energyQuartileV1 already demanded. Option 4 is explicitly NOT taken, and the consequence of that is recorded below rather than discovered.

## Reason

A percentile is the only one of the four that survives the next song. The other three name a length, and a length is an absolute against a distribution nobody has measured — which is the fourth time that mistake would have been made here after the 4.0 seam threshold, the 0.70/0.90 cut-rate line, trusting Whisper's language field and the gate's text verdict. Moving the percentile also means a ballad under the dance director cuts faster THROUGH THE BALLAD and no faster, which is the bias-never-dictate rule behaving correctly rather than being asserted. Reusing the same number for the lane split was not planned and is the better half of the change: it means a fast-cutting director also spreads its performance shots further through the song, which is one fact rather than two settings that drift.

## Consequences

MEASURED, AND IT IS THE PART TO READ. The lever is INERT at some tempos and silently so. A bar is 3.0s at 80 BPM, so against the 4-8s model the widest clip is 2 bars and so is the narrowest, and all three directors cut the identical 43 clips on the 4:16 track Batch 6 was measured on. The dead band is roughly 68-88 BPM for this model, which is where a ballad sits, which is the song the slow director exists for. cutPlanV1 now logs one line when a director asked for a split the tempo cannot express, so a render where two directors come out the same length is explained rather than filed as a bug, and directorsV1.test.ts asserts both halves: the cut counts are identical at 80 BPM, the lane split and the shot ladder still differ there, and the lever works again at 120 BPM. This is deliberately not being fixed in this batch. Fixing it is option 4 — letting a fast director take 1-bar clips and trim the surplus, which D-027 already does — and that is more clips and more spend on every slow song, so it is a cost decision for a person rather than a refactor. Until then a director is two levers on a ballad and three on everything else, and directorsV1.test.ts requires any pair to differ on two of the three, which is why that threshold is two and not three.
