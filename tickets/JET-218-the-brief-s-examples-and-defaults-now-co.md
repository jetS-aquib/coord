---
id: JET-218
title: The brief's examples and defaults now come from the song — POST /api/v1/music-videos/brief
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-10-29T13:26:21+05:30
updated: 2026-10-29T13:26:51+05:30
decisions: D-037
---

## Request

Call POST /api/v1/music-videos/brief { audioUrl, title? } once the song read has landed, and draw the four inputs from what it returns: each question's placeholder instead of the hardcoded example, and its hint under the label when there is one. On submit, substitute a blank field's suggestion before building directionPrompt. Always 200 — on any failure it returns the generic form you already show.

## Understanding

This is 7.10, and it is the thing D-032 held the brief behind the song read FOR. That decision recorded that until 7.10 ships the gate buys nothing visible, and that it should land WITH 7.10 or be felt as a delay for no reason. It has now shipped on our side.

THE SHAPE. 200 always, never 404:
  { language, source: 'song' | 'default',
    questions: [ { key, label, hint, placeholder, suggestion }, ... ] }
Four questions, always, always in the order who / where / story / look and always with
those labels — the order and the labels come from our constant and not from the model,
so nothing can reorder or rename your form. source is 'default' when it is the generic
form, which is what you get for an instrumental, a missing read or a failed call.

- placeholder: the greyed-out example, written for THIS track. Replaces your hardcoded
  one. Never empty.
- hint: at most eight words under the label, or '' — we tell the model to leave it
  empty rather than write something that would fit any song, so expect empties.
- suggestion: a real answer we would use if the field is left blank. May be ''.
- language: the song's language; every string comes back in it, in its own script.

THIS PROBABLY REPLACES JET-217, and that is the part worth reading before you start
it. JET-217 says an all-blank brief 400s at the v0 storyboard route, and proposes
sending the title as a stand-in. If you substitute suggestions for blank fields
instead, directionPrompt is never empty whenever a song read exists, the 400 cannot
happen, and what reaches the treatment is four real answers drawn from the song
rather than a filename. Your screen already promises 'Anything you leave blank, the
song decides' — this is what makes that literally true. Keep JET-217's one-liner as
the belt-and-braces case for an instrumental, where source is 'default' and every
suggestion is ''.

ASSUMPTIONS:
 - You call this AFTER the read resolves, on the same audioUrl you passed to
   /song-read. It is cheap on a warm read and costs one text call otherwise.
 - Substituting a suggestion into directionPrompt is right, not misleading. The
   suggestion was derived from this song, so the treatment re-reading it is coherent;
   and it makes the render reproduce what the person actually saw on screen.
 - You keep showing suggestions as placeholders rather than pre-filling the inputs.
   Pre-filled text goes unread, and the screen's own copy is about leaving things
   blank. If you would rather pre-fill, that is your call — say so and we will stop
   describing them as placeholders.
 - Nothing about the submit contract changes: still one labelled directionPrompt.

## Plan

1. File this; our half is in and the endpoint is live behind the existing auth.
2. Nothing further from us until you have it on screen — the next thing we would
   change is which four questions get asked, and that should be decided against a
   real brief rather than guessed at twice.

## Reason

7.1 made the brief answerable; this makes it answerable about the song in front of the person. A sparse acoustic demo and a 128 BPM club record are currently asked the same four questions with the same examples under them, and an example that does not fit the track teaches the wrong answer.

## Related files

mobile: src/app/(create)/brief.tsx, src/features/create/create-context.tsx (buildDirection), src/lib/generation.ts. Ours: src/services/render/briefV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Opening the Direction screen for a track with a song read shows examples that match that track rather than the seaside-town defaults, and the strings are in the song's language. Leaving a field blank and pressing Start filming sends that question's suggestion in directionPrompt. An instrumental, or a song read that failed, shows exactly today's form and still renders. No question on the screen uses a film-craft term.

## Test steps

—

## Thread
2026-10-29T13:26:21+05:30 aquib N: created ticket, status: - -> open
2026-10-29T13:26:51+05:30 aquib N: linked decision D-037 (The brief's questions are fixed; only its examples, hints and defaults come from the song)
