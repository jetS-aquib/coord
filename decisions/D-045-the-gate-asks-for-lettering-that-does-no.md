---
id: D-045
title: The gate asks for lettering that does not belong, not for lettering
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

D-040 put 'text' in GATE_REDRAW_ON_V1 on the reasoning that gibberish lettering is a defect under any treatment, and left the question as 'does the frame contain any lettering, words, captions, watermarks or signage? Gibberish letter-shapes count.' Three renders have now measured it. On the first two it fired 3 and 4 times on the stills. On mvr_1793338408189_d864708f it fired 18 times on the stills and 38 times on 45 clips. The cause is in our own look bible: that treatment chose 'elevated rooftop overlooking a glowing neon skyline', 'subterranean city tunnel with glowing overhead amber lights'. A neon cityscape contains signage by definition, so the gate was rejecting precisely what the treatment ordered. On the still side that cost 22 redraws and exhausted the check budget, leaving 12 of 46 anchors unchecked — the false positives crowded out the checking. On the clip side it cost nothing, because D-043 had already kept 'text' out of CLIP_REDRAW_ON_V1.

## Options considered

1. Drop 'text' from GATE_REDRAW_ON_V1 and only record it. Stops the spend and gives up a real defect — hallucinated glyphs and burnt-in watermarks are worth cents to redraw. 2. Keep the question and raise the check budget so the redraws stop starving the checking. Pays more money to be wrong more comfortably. 3. Branch in code on whether the look bible mentions neon, signage or a city. An unmeasured heuristic over prose, which is the mistake this codebase has paid for three times. 4. Narrow the QUESTION: ask only about lettering that does not belong, and tell the model that real signage belonging to the stated location is not a defect.

## Decision

Option 4. hasText now asks whether there is 'lettering that DOES NOT BELONG in this shot — a watermark, a caption or subtitle, a UI overlay, a logo stamped flat on the image, or text whose letter-shapes are malformed or meaningless', and says explicitly that well-formed signage belonging to the location is not a defect, naming that location from the look bible. 'text' stays in GATE_REDRAW_ON_V1 and stays out of CLIP_REDRAW_ON_V1; neither list moves. The exoneration names the place rather than being generic, because a model with no stated location has no way to tell a shop sign that belongs from one that was hallucinated into a bedroom.

## Reason

This is the answer to the question D-040 and D-043 left open, and it is the opposite of what the obvious reading suggested. Two renders at a 72-76% fail rate looked like a gate that should pay for less; the third shows a gate that was asked the wrong question. The verdict was never measuring a defect — it was measuring whether the song had a city in it. Narrowing the question costs nothing and keeps the real defect; narrowing the LIST would have thrown away a genuine catch to work around our own wording. That distinction is the whole lesson: before deciding what a check should spend on, check that it is asking about the thing you think it is. Option 3 deserves naming as the one refused — 'if the look bible mentions neon' is an unmeasured heuristic over prose, in the same family as the 4.0 seam threshold and the 0.70/0.90 cut-rate line, and it would have made the gate's behaviour depend on a treatment's vocabulary.

## Consequences

The text verdict should fall back towards the 3-4 of the first two renders on a city song and stay there on a rural one; if it does not, the question is still wrong and the next move is dropping it from the redraw list rather than rewording it again. The check budget should stop being exhausted, so the 12 unchecked anchors come back under inspection — that is the larger win, since an unchecked anchor is the thing 7B.1 exists to prevent. This narrows D-040 without superseding it: the split between what is redrawn and what is only recorded is unchanged, and only the wording of one of the five verdicts moves. Unverified until the next render. The same question is shared with clipCheckV1 through gateQuestionV1, so the clip side narrows at the same time and its 38 recorded text failures should fall too — they cost nothing, but they were drowning the verdicts that matter in the stored distribution.
