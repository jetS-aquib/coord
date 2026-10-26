---
id: JET-200
title: The 4.0 seam threshold is re-rendering nearly every clip, still, and doubling generation cost
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-26T13:03:48+05:30
updated: 2026-10-26T13:07:07+05:30
decisions: 
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
