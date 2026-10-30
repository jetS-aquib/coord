---
id: JET-223
title: A director screen before the brief, so handing over the song is the hero moment instead of a form
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-30T11:55:12+05:30
updated: 2026-10-30T16:12:01+05:30
decisions: 
---

## Request

A new screen between upload and the brief: pick one of three directors, shown as cards with a name, an avatar, a one-line intro and what they are known for. The choice is sent on project create and on POST /api/v1/music-videos/brief as a directorId. The brief screen then shows the director's answers pre-filled, framed as 'your director chose these — tap to change', rather than as four empty optional inputs.

## Understanding

Batch 8, planned in the Render Pipeline Delivery Plan and recorded as D-046. The product problem is ours as much as yours: 7.1 replaced one free-text box with four inputs and D-037 made their hints and examples come from the song, but they are still optional inputs on a form, and nothing about the flow says 'we have this'. The fix is that the user hands the song to somebody.

WHAT THE BACKEND IS DOING, so you are not waiting on a guess. A director is NOT a block of prompt text — it is a parameter set over the grammar that already exists: the performance/narrative lane ratio, the cut-rate bias, the shot-size ladder, the camera vocabulary and the lyric-mode policy. That matters to you because it is what makes two directors actually look different in the finished video rather than only on the card. We ship three to start.

Backend will supply a GET endpoint listing the directors with their id, name, intro, what-they-are-known-for line and avatar URL, so the three are not hardcoded in two repos. We will tell you the exact shape when 8.9 lands — it is a refactor with no behaviour change and nothing on your side depends on its internals.

ASSUMPTIONS, correct any of these rather than building around them:
 - The screen sits AFTER the audio is uploaded and BEFORE the brief, because the song read is already warming at that point and the brief needs the director to pre-answer it.
 - There is no 'no director' path. Doing nothing picks the first one, the same way 8.6 says start filming is never blocked.
 - The user can change director from the brief screen, but NOT after the render starts — the grammar is baked into the plan at that point.
 - Static avatar art is fine and is what we would ship first. Animation is explicitly not on the critical path and should not gate this.
 - Three cards fit on one screen without a carousel. If they do not at your smallest supported size, say so and we will cut the intro line rather than add scrolling.
 - You already send the device locale (JET-220); the director's intro and name come back in that language from us, so nothing new is needed there.

## Plan

1. File this and build the backend half: 8.9, the DirectorProfileV1 refactor, then the three profiles, then the list endpoint.
2. Send you the endpoint shape and the three directors as soon as the list endpoint exists.
3. The brief endpoint starts accepting directorId and returns that director's answers as the suggestions D-037 already defined — so your brief screen changes very little, the values just get better.
4. The resolved profile is stored on the plan, so a render can be explained afterwards.
5. Nothing here blocks you: until the endpoint exists the screen can be built against the three directors as static data.

## Reason

This is the batch that makes everything in 6, 7 and 7B legible to a user. The pipeline already decides shot sizes, lane splits, lyric modes and a look bible per song, and the user currently sees none of that and is asked four questions instead. A director is the one word that explains all of it, and picking one is a decision a non-expert can make confidently in two seconds.

## Related files

mobile: app/(create)/director.tsx (new), app/(create)/brief.tsx, features/create/create-context.tsx, lib/generation.ts; backend: render/directorsV1.ts, briefV1.ts, musicVideoV1.routes.ts

## Acceptance criteria

A user who uploads a song is shown three directors, picks one, and reaches a brief whose four fields are already filled with that director's answers. Changing director changes those answers. Tapping straight through with no edits starts a render. The same song under two different directors produces visibly different cut rates and lane splits, not only different wording.

## Test steps

1. Open the app, tap New video, pick an MP3, tap Continue.
2. You land on a director screen between the track and the brief. Three cards,
   each with a face, a name, what they are known for and two or three traits.
   One is already selected and Continue works without touching anything.
3. Tap a different director. The check and the accent move, and the haptic fires.
   Continue.
4. The brief opens with that director's face, "<name> is directing", their line
   about the work, and the four fields filled in with their answers.
5. Tap Change on the panel, pick a different director, come back: the four
   answers are the new director's. Anything you typed yourself survived.
6. Go back and choose "I'll direct it myself" instead. The brief has no panel
   and the four fields are empty with greyed examples, the way they were before
   this ticket.
7. Start filming with a director chosen: their face and "<name> is directing"
   sit under the progress line. With "I'll direct it myself" they are absent.
8. Two renders of one song under two directors differ in cut rate and lane
   split, not only in wording. That half is the backend's and is checked on
   the plan, not on the phone.

NOT verified on a device by the implementer: three cards plus the manual row at
1.3x font scale on the smallest supported screen.

## Thread
2026-10-30T11:55:12+05:30 aquib N: created ticket, status: - -> open
2026-10-30T11:59:02+05:30 aquib N: status: open -> approved
2026-10-30T16:11:36+05:30 aquib N: status: approved -> in_progress — mobile half built: director screen, the brief as the director's plan, the avatar through the flow
2026-10-30T16:12:01+05:30 aquib N: status: in_progress -> review — mobile half is in: director screen, the brief as a plan rather than a form, the avatar through the flow, and the manual path. JET-227 is the follow-up for names, art, a per-song pitch and traits.
