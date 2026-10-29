---
id: JET-216
title: Four inputs instead of the Direction box, so the treatment has something to direct from
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-10-29T12:31:11+05:30
updated: 2026-10-29T12:31:11+05:30
decisions: 
---

## Request

Replace the single free-text Direction box with the four inputs from row 7.1 of the render plan — who's in it, where, story shape, look — plus one optional note collapsed behind 'Add a note'. Energy, pacing and mood are never asked: they are read off the song. Send the four answers to the backend exactly as you send directionPrompt today, so nothing about the contract changes.

## Understanding

Batch 7 landed on the backend today: a treatment, a look bible and a shot list now decide what is in every frame, and a full 4:16 render is running on them. The one input they all read is mv.directionPrompt — the free-text box.

WHY WE ARE ASKING NOW. On today's render that box contained a 90-word brief naming wardrobe, palette, location, camera language and aspect. The treatment that came back was good, and it was good because the brief was written by somebody who knew what a treatment needs. That is the whole problem: the box rewards the one user who already knows what to put in it, and tells everybody else nothing. Four labelled inputs ask the same person for the same four facts, in words anybody can answer.

The four, and what each one feeds on our side:
 - WHO'S IN IT  -> the cast brief, and the wardrobe entry the look bible keeps per person
 - WHERE        -> one location per section label, which is what makes chorus 2 the same place as chorus 1
 - STORY SHAPE  -> the logline and the per-section beats
 - LOOK         -> palette and lens language, used as the 'Look:' line on every still

ASSUMPTIONS, and we would rather be corrected than have you build around them:
 - CONCATENATION, NOT A CONTRACT CHANGE. Join the four answers into directionPrompt with a label each ('Who: ...  Where: ...  Story: ...  Look: ...') and POST it exactly as today. We can read that shape immediately. If you would rather send four named fields we will add them, but then this ticket waits on us and it does not have to.
 - THE SUGGESTIONS ARE OURS AND THEY DO NOT EXIST YET. Row 7.1 says each input is pre-answered from the song read. The backend half of that is 7.10 and we have not built it — there is no endpoint today that turns a song read into four suggested answers. So build the screen with empty or locally-derived defaults, and when 7.10 lands the suggestions arrive without a UI change. We did not want to hold this behind our own work.
 - YOU ALREADY HOLD THE READ. D-032 put the gate before the brief, so by the time this screen is shown the song read is on the device. Anything you can usefully default from it yourself — language for the copy, whether the track is instrumental — is yours to use now.
 - NOTHING IS REQUIRED. All four empty must still render: the treatment reads the song and the lyrics and writes something, which is what happens today when the box is blank.
 - WE ARE NOT ASKING FOR A CRAFT QUESTION. Shot sizes, lane ratio, cut rate and lyric mode are all decided from the song on our side (D-033, D-034) and must never appear on this screen.

## Plan

1. File this and carry on. Nothing of ours is blocked: the treatment reads directionPrompt whatever shape it is in.
2. Build 7.10 next — the endpoint that turns a song read into the four questions, their defaults and their examples, so a sparse acoustic track and a 128 BPM club record are not asked the same thing. That is the thing D-032 says this gate was bought for.
3. Tell you when it lands; it should need no change to the screen, only to where the placeholder text comes from.

## Reason

Everything Batch 7 generates is downstream of this one string. The pipeline now has a director, a DOP and a production designer, and the only thing any of them is told about the artist's intent is whatever got typed into a box most people leave empty.

## Related files

mobile: app/(create)/brief.tsx, lib/generation.ts. Ours, for context: src/services/render/treatmentV1.ts

## Acceptance criteria

The create flow shows four labelled inputs and an optional note instead of one free-text box. Leaving all of them empty still starts a render. The four answers reach the backend inside directionPrompt with their labels intact, and a render started from the new screen comes back with a logline that reflects what was typed in them. No question on the screen uses a film-craft term.

## Test steps

—

## Thread
2026-10-29T12:31:11+05:30 aquib N: created ticket, status: - -> open
