---
id: JET-229
title: Pro overrides, one layer down: change a row, lock a face, and never make the novice walk through a form
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-10-30T16:20:46+05:30
updated: 2026-10-30T16:56:29+05:30
decisions: D-055
---

## Request

The mobile half of plan row 8.8. On the call sheet from JET-228, let somebody who wants to change a shot's size, its lane or its hold do that, and lock a cast member so a regenerate cannot re-roll them. It must be one layer down from the row — never a step in the flow, never a field the novice has to pass through.

## Understanding

In my own words: 8.3's rows are legible to a novice and that is the point; 8.8 is for the person who has cut a video and wants to say 'that one is too wide'. So it is an affordance ON a row rather than a screen of its own, and the default path must be unchanged by its existence.

Filed separately from JET-228 deliberately, for two reasons. It lands last in the batch and should not hold the screen up, and it is the one row here that can be approved or dropped on its own without the rest of the call sheet changing shape.

ASSUMPTIONS, each of which I would rather have corrected:
 1. An override is valid only while the plan is in 'review' — before anything is paid for. Once the render is spending, changing a shot's size is a re-shoot, which is the existing clips/:idx/rerender route and a different gesture with a different price.
 2. An override WINS over the director, permanently, for this render. It is not a hint the next regenerate can quietly undo: regenerating the cast or a neighbouring row leaves an overridden row alone.
 3. It is also RECORDED as an override. This is not bookkeeping — the stored director profile exists so two renders can be compared (D-048 and all the cut-rate R&D rests on it), and a hand-edited render silently in that pool makes the comparison a lie. So the plan carries an overrides list and the row comes back with overridden:true, and you should be able to see on the screen that a row is no longer the director's.
 4. Locking a cast member is per-render, on the plan, not on the project. 'Lock this face' means 'a regenerate does not re-roll them in THIS render'.
 5. Changing a row's size or lane does NOT rewrite its action line by itself — it changes the grammar and the composed prompt. If the person wants new words for the row, that is shots/:idx/regenerate from JET-228, which is a separate tap and a separate text call.
 6. 'Change the hold' I am reading as the clip's musical length, bounded by the section it sits in — a row cannot be stretched past its own section boundary without re-cutting the song, which would undo Batch 6. If you meant something else by hold, say so.

## Plan

1. PATCH /api/v1/music-videos/render/:jobId/clips/:idx — body may carry any of { shotSize, lane, musicalSeconds }. Only in 'review'. Validated against the ladder for this aspect and against the section's own span.
2. POST /api/v1/music-videos/render/:jobId/cast/:tag/lock and .../unlock — per render, per tag. A locked member survives cast/regenerate unchanged.
3. The plan gains overrides: [{ index, field, from, to, at }], append-only. The call sheet row gains overridden:true and the cast card gains locked:true.
4. A render carrying any override is marked as such on the plan, so the R&D that compares directors can exclude it rather than average it in.
5. Mobile: the row opens one layer down — long-press, or a chevron on the row, your call — with three controls and nothing else. The default path never shows them.

## Reason

Most of the API for this exists already: clips/:idx/rerender takes a prompt, and the grammar fields are all on the clip. What does not exist is the record that a human changed it, and that is the part that matters beyond this screen. Four renders of measurement are what Batch 8's three directors were tuned on, and D-048's whole finding — that the cut-rate lever is inert between 68 and 88 BPM — came out of comparing stored profiles across renders. One hand-edited render sitting unlabelled in that pool is a number nobody can trust and nobody can spot.

## Related files

Backend: src/models/RenderPlanV1.ts (overrides, cast locks), src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts
Mobile: app/(create)/plan.tsx and whatever row component JET-228 lands

## Acceptance criteria

Somebody who has cut a video can change one row's shot size on the call sheet and see the render honour it. Somebody who has not never sees the control. A regenerate does not undo an override or re-roll a locked face. The stored plan says plainly which rows a person changed, so a render with overrides can be told apart from one the director made alone.

## Test steps

1. On the call sheet, open a row one layer down and change its size from wide to close. The row shows as changed.
2. Regenerate the row's section, or the cast. The changed row keeps close.
3. Tap Start filming. The still drawn for that shot is a close-up.
4. Lock a cast member, regenerate the cast — that member's description is unchanged, the others are not.
5. On a render with no overrides, the whole control is absent and nothing on the screen differs from JET-228.

## Thread
2026-10-30T16:20:46+05:30 aquib N: created ticket, status: - -> open
2026-10-30T16:24:57+05:30 aquib N: linked decision D-055 (A human override wins over the director and is recorded as one, so a hand-edited render never pollutes the comparison)
2026-10-30T16:54:58+05:30 aquib N: Backend half of this is built and waiting on your side, and on this ticket's approval.

PATCH /render/:jobId/clips/:idx takes { shotSize, lane, musicalSeconds }, any subset.
POST /render/:jobId/cast/:tag/lock and .../unlock. Both refuse outside the pre-spend
window — queued, planning, review — with a message naming the re-render route, rather
than silently doing something that bills.

The plan now carries overrides: [{ index, field, from, to, at }], append-only; the
call sheet row carries overridden:true and the cast card carries locked:true; and the
poll payload carries an overrides count so a render made by a person can be told from
one made by its director at a glance. That last part is the half of D-055 that is
easy to skip and the reason it is a decision: four renders of measurement are what
Batch 8's directors were tuned on, and an unlabelled hand-edited render bends that
ruler without anybody being able to see it.

Assumption 6 is settled the way I guessed: the hold is the clip's musical length, and
the server bounds it by the clip's own section span and the model's maximum. A row
cannot be stretched past its section boundary, so an override can never move a cut off
the music.
2026-10-30T16:56:29+05:30 aquib N: status: open -> approved
2026-10-30T17:14:09+05:30 aquib N: Built. Your assumptions 1 to 6 all stand as written; nothing needed correcting.

WHERE IT LIVES, since you left the gesture to me. Not a long-press and not a chevron on the row. Tapping a row opens its reason, which is 8.7 and is for everybody, and the opened row carries one quiet line - Change this shot - that opens a sheet. A chevron on all forty-five closed rows would invite the novice into the thing this ticket says they must never walk through; a long-press would hide it from the person it was built for. One layer below 8.7 rather than beside it.

THE SHEET IS THREE CONTROLS AND ONE ACTION. How tight and How long it holds are STEPPERS, not segmented controls, because your own code calls it a ladder and moves a rung at a time - and medium close does not fit in a fifth of a phone. The lane is two segments. Underneath, Write this one again, which is JET-228's shots/:idx/regenerate and is marked as the thing that costs a text call where the three above are free.

ONE PATCH PER EDIT, and this is the part I pulled out into its own module so a check can reach it. The sheet collects all three and sends only the fields that moved. Sending an unchanged value would write an override record for an edit nobody made, and that record is not bookkeeping - it is the half of D-055 that is easy to skip. The mistake is invisible on screen, so src/features/create/shot-change.ts holds the arithmetic and npm run check:plan asserts that opening a row and closing it sends nothing.

THE HOLD IS NOT BOUNDED PROPERLY ON OUR SIDE and I want this on the record rather than in a comment only. The call sheet row does not carry its own room - the section span is on the section, but the row's start is not on the row - so the stepper offers a flat 1 to 12 seconds and leans on your clamp. A person who asks for nine seconds in a four-second section is quietly given four, and the screen reloads and shows four. Correct, but it is a control that offers something it cannot deliver. If a future call sheet row carried its remaining room, that goes away. Marked as a ponytail comment naming the ceiling; not worth a ticket unless you think otherwise.

Overridden rows carry a mark on the row, so a plan a person edited reads differently from one the director made alone. Cast locks are a lock glyph per member, their own target rather than the whole card, so nobody locks a face while reading one.

tsc clean. NOT VERIFIED on a device, and no override has been round-tripped against a live plan.
