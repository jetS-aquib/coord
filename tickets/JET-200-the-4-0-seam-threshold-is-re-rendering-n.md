---
id: JET-200
title: The 4.0 seam threshold is re-rendering nearly every clip, still, and doubling generation cost
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: done
created: 2026-10-26T13:03:48+05:30
updated: 2026-10-27T16:29:38+05:30
decisions: D-018, D-024
closed: 2026-10-27
---

## Request

Re-measure the seam band on current model output before paying for another round of re-renders. Either move the threshold to where the real band sits, or establish that the pins genuinely are not being honoured — which would be a prompt or model problem that a retry cannot fix.

## Understanding

On the render I profiled through the frame-comparison endpoint: 124 calls in 22 bursts. Burst 1 was exactly 62 calls in 12.1s — 31 clips x 2 ends, the full first pass. The remaining 21 bursts were 62 more calls, i.e. a second full pass. Every clip went to re-render.

That is the same outcome the code comment in verifySeamsV1 already describes from the first live render: '29 of 31 clips with the IDENTICAL prompt... every one of them failed again: 60 generations for 31 clips, about double the money, for no change.' The pinFocused prompt and the keep-the-better-take logic were added to fix it. On this render they did not: the re-render count is still ~100% of clips.

SEAM_THRESHOLD_V1 = 4.0 came from a band measured 2026-10-23 as: identical 0, good runs 2.1-3.3, unrelated stills 10.3. If essentially every real clip now scores above 4.0, that band no longer describes the material being produced, and 4.0 is no longer sitting in an empty gap.

Assumptions:
1. I am reading re-render activity from frame-comparison call patterns, not from your plan documents. The seamScore values themselves are in RenderPlanV1 and would settle this immediately — I have not read them.
2. One thing I can rule out as the cause: the metric moved when it came to this service. It did not. Rec.709 greyscale was matched to sharp deliberately; measured, the resampling kernel moves a score by 0.003 and the luma choice by 0.16. A clip scoring 7 here would have scored about 7 in Node.
3. I do not know whether the anchor stills and the video model are well enough matched for a 2.1-3.3 band to be reachable at all. An anchor is drawn by an image model; the clip is drawn by a video model from that anchor. Some floor of mismatch is structural.

## Plan

1. Pull the seamScore values off a recent RenderPlanV1 and look at the distribution, not the pass/fail count. That alone may show the band has moved.
2. Take about 10 clips across that range and watch each boundary. Mark which ones a person would actually call a jump cut.
3. Set the threshold where that line really is. If the honoured clips cluster at 5-7, 4.0 is simply mis-set and this is a one-constant change.
4. If clips that score 8 genuinely look wrong, the threshold is right and the problem is upstream: the pins are not being honoured, and re-rendering with the same stills will keep failing. That is worth knowing before spending on it.
5. Either way, consider capping total re-renders per song, so a mis-set threshold can never silently double the bill again.

## Reason

This is about 3.7 minutes of a roughly 14 minute render and roughly half the generation spend, and your own comment says a variation-free retry is not a retry. The threshold is cheap to re-base and expensive to leave wrong.

## Related files

src/services/render/seamCheckV1.ts (SEAM_THRESHOLD_V1), src/services/render/renderOrchestratorV1.ts (verifySeamsV1)

## Acceptance criteria

The threshold is backed by a current measurement rather than the 2026-10-23 one, and a normal render re-renders a minority of its clips instead of all of them. If the conclusion is that the pins are not honoured, that is written down and the re-render loop is capped rather than left to run on every clip.

## Test steps

1. Render a song and count re-rendered clips against total clips; expect a minority.
2. Check the seam score distribution is not clustered just above the threshold.
3. Watch the boundaries of the clips that were NOT re-rendered and confirm none of them is a visible jump cut.

## Thread
2026-10-26T13:03:48+05:30 aquib N: created ticket, status: - -> open
2026-10-26T13:07:07+05:30 aquib N: status: open -> approved
2026-10-26T13:18:04+05:30 aquib N: linked decision D-018 (Seam threshold re-based to 9.0 and re-renders capped at a fifth of the song)
2026-10-26T13:19:22+05:30 aquib N: Measured. Your assumption 1 was the right instinct — the seamScores settle it, and they say the threshold is mis-set, not that the pins are unhonoured. D-018 has the full numbers.

Five scored RenderPlanV1 documents, 132 clips, every one already the better of two takes:
  lowest score anywhere   3.89
  per-render bodies       4.6-8.9 (medians 4.4, 5.3, 5.6, 6.8, 7.1)
  per-render tails        9.8-67.9, two to four clips a song
Not one clip of 132 reached 2.1-3.3. So 4.0 sat BELOW the entire distribution — there was no gap at 4, and every clip tripping it was arithmetic, not disobedience.

Your assumption 3 is the explanation and it is correct: an image-model anchor and a video-model clip have a structural floor between them of about 4. The scores above being post-re-render best-of-two is the proof that no retry closes it.

SEAM_THRESHOLD_V1 = 9.0 — above every render's body (max 8.93), below every render's tail (min 9.81). And your step 5, which I think is the more important half: rerenderBudgetV1 caps re-renders at ceil(clips/5), worst seams first, with a warning in the log when it bites. The threshold is a measurement and measurements go stale; the budget is what makes the next stale one a log line instead of a bill.

What I could NOT do from the data, and it is your test step 3: watch the boundaries of clips scoring 4.6-8.9 and confirm none of them is a visible jump cut. If any of them is, 9.0 is too high and the next move is by eye, not by query.
2026-10-26T18:36:48+05:30 aquib N: linked decision D-024 (Seams are measured as each clip lands, and the budget is spent first-come)
2026-10-27T16:25:21+05:30 aquib N: status: approved -> in_progress
2026-10-27T16:25:21+05:30 aquib N: status: in_progress -> review — SEAM_THRESHOLD_V1 is 9.0, re-based on the 132 scored clips across five renders — body 4.6-8.9, tail 9.8-67.9, so 9.0 sits in the gap that is actually there rather than below the whole distribution. rerenderBudgetV1 caps re-renders at a fifth of the song and warns once when spent. The reasoning and the numbers are in seamCheckV1.ts's header so nobody re-derives them. D-018, shipped in e7494ab.
2026-10-27T16:29:38+05:30 aquib N: status: review -> done
