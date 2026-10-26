---
id: D-018
title: Seam threshold re-based to 9.0 and re-renders capped at a fifth of the song
date: 2026-10-26
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-200
---

## Context

SEAM_THRESHOLD_V1 was 4.0, set 2026-10-23 from hand-made pairs: identical frames 0, a clip that honoured its pin 2.1-3.3, two unrelated stills 10+. Read back on 2026-10-26, the seamScores of the five scored RenderPlanV1 documents — 132 clips, each already the better of two takes — contain nothing below 3.89. Per-render bodies run 4.6-8.9 (medians 4.4, 5.3, 5.6, 6.8, 7.1) with a clearly separate tail at 9.8-67.9 of two to four clips. The 2.1-3.3 band was never reached by a single real clip. So 4.0 sat below the entire distribution, every clip tripped it, and five consecutive renders each paid for a second full generation pass.

## Options considered

(a) leave 4.0 and treat the universal failure as the pins not being honoured — but the scores above are already post-re-render best-of-two, so the retry demonstrably does not move them; (b) move the threshold to the gap the data actually shows; (c) make it relative to each render's own median; (d) remove the seam check and the re-render loop entirely.

## Decision

(b), plus a cap. SEAM_THRESHOLD_V1 = 9.0 — above every render's body (max 8.93) and below every render's tail (min 9.81), so it separates 'as close as an image-model anchor and a video-model clip get' from 'this clip went somewhere else'. rerenderBudgetV1 caps re-renders at ceil(clips/5), worst seams first.

## Reason

The 2.1-3.3 band describes two frames from the same generation. An anchor is drawn by an image model and the clip by a video model from that anchor, so some floor of mismatch between them is structural and no retry removes it — the best-of-two scores are the proof. The threshold has to sit where the material's own populations separate, and they separate cleanly at 9. The cap is separate from the threshold on purpose: the threshold is a measurement and measurements go stale, and the cost of a stale one was five renders at double price with nothing in the logs to say so.

## Consequences

A normal render re-renders 0-4 clips instead of all 31, roughly halving generation spend and removing about 3.7 minutes. Clips scoring 4.6-8.9 are now accepted as-is; if any of those are visible jump cuts the threshold is still too high and that is the measurement to make next, by eye, which is the one part of JET-200 that could not be done from the data. Deliberately not fixed: the structural image-model/video-model mismatch that puts the floor at ~4 instead of ~2. ponytail — 9.0 is absolute and the body drifts run to run (median 5.27 on 23 Oct, 6.77 on 26 Oct); if a future model pushes a body past 9, make it relative (this render's median + ~3) rather than editing the constant again.
