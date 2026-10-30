---
id: D-055
title: A human override wins over the director and is recorded as one, so a hand-edited render never pollutes the comparison
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-229
---

## Context

Batch 8.8, pro overrides. On the call sheet a person who has cut a video can change a row's shot size, its lane or its hold, and lock a cast member so a regenerate does not re-roll them. The plan already stores every one of those fields per clip, so applying a change is a write. The question is what happens to it afterwards. Two things pull against each other: the override has to WIN — a director preference that silently reasserts itself is worse than no override at all — and the stored resolved director profile (8.14, D-046) exists so that two renders can be compared, which is what every number in Batch 8 was tuned on. D-048's whole finding, that the cut-rate lever is inert between 68 and 88 BPM, came out of comparing stored profiles across renders.

## Options considered

1. Apply the override to the clip and nothing else. Simplest, and an edited render then sits in the measurement pool looking exactly like one the director made alone. 2. Record the override and treat it as advisory, letting a later regenerate re-decide. Keeps the director coherent and breaks the person's expectation, which is the one thing an override must not do. 3. Apply it, pin it, and record it on the plan as an override — both halves, deliberately.

## Decision

Option 3. RenderPlanV1 gains an append-only overrides list of { index, field, from, to, at }, the edited clip is marked overridden, and the cast gains a per-render locked flag. An overridden field is never rewritten: regenerating the cast or a neighbouring row leaves it alone, and so does any later pass. Overrides are accepted only while the plan is in 'review' (D-051) — before anything has been paid for — because after that, changing a shot is a re-shoot and the existing clips/:idx/rerender route is the gesture with the right price attached. The call sheet returns overridden per row and locked per cast member, so the screen can show that a row is no longer the director's.

## Reason

The recording half is the part that is easy to skip and is the reason this is a decision rather than a patch. The resolved profile on the plan is a ruler. A render where a person changed four rows and locked a face is a render measured with a bent ruler, and if it is not labelled, nobody can tell which of the pooled renders it was — the average quietly moves and the finding that comes out of it is wrong in a way no test can see. That is the same argument 7B.5 made for storing every gate verdict including the passes, and it is how the last four bugs here were found.

Pinning rather than advising follows from what an override IS. The director is a set of weights over a grammar, and the whole of D-046 is that it biases and never dictates; a person saying 'that one is close' is not another weight, it is the answer. Letting a weight overwrite an answer inverts the two.

Restricting it to 'review' is not a limitation, it is the honest price. Before accept, changing a row costs nothing and changes what gets drawn. After accept, the still is paid for and the clip is pinned to it, so the same gesture costs dollars — and a control that silently costs a dollar in one state and nothing in another is the kind of thing a person learns about from a bill.

## Consequences

The R&D that compares directors can and must filter on the overrides list; a render carrying any override is not a sample of what that director does. Mobile gets a control that must stay one layer down — 8.8's own condition is that it never becomes a form the novice walks through, and that is mobile's to hold (JET-229). An override is per render and not per project: the same person rendering the same song again gets the director's answer back, which is right, because the override was about this cut. Locking is likewise per render. Nothing here touches the cut points: a hold is bounded by its own section's span, so an override cannot move a cut off the music and undo Batch 6.
