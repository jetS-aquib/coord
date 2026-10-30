---
id: JET-227
title: Give the three directors a face, a name people would repeat, and a sentence about this song
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-30T13:03:56+05:30
updated: 2026-10-30T13:04:26+05:30
decisions: 
---

## Request

Four things, in the order they matter to the screen. The ids do not change in any of them.

1. NAMES. Replace the three descriptive names with persona names. 'The one who stays close' describes a parameter set; nobody says it out loud. The point of a director is that somebody tells a friend 'use Mira, she is great on slow songs' - that only happens if there is a name to repeat.
   Proposed, and easy to overrule - the ids are the contract and these are one string each:
     stays-close  -> Mira    (keep knownFor 'Romance, told quietly')
     fills-floor  -> Dev     (keep 'Dance, and a crowd')
     holds-frame  -> Kabir   (keep 'Hip-hop and trap')
   What we are NOT asking for: a surname, a fake bio, a fake credit list, or a real director's name. A first name and the craft line is the whole persona.

2. AVATARS, which is the actual blocker. `assets/directors/` does not exist, so `avatarUrlV1` returns '' for all three and every card is typographic. The route, the allow-list and the extension search are all already built and correct - it is three image files.
   What the screens need from the art:
   - One set, visibly one hand. Three unrelated styles read as clip art.
   - Legible as a 56pt circle AND as a 96pt portrait: the same file is the card, a chip on the brief, and a small presence on the render screen.
   - Honest about what it is. An illustrated character, not a photoreal face - a photo of a person who does not exist is a worse lie than a drawing.
   - A background that survives both themes, or a transparent PNG.
   Square, 512px, PNG or WebP. Three files, named by id.

3. A SENTENCE ABOUT THIS SONG, optional field on `POST /api/v1/music-videos/brief`:
     pitch?: string   // 2-3 sentences, first person, the director's own voice
   The brief screen currently shows four filled-in fields and a line saying who filled them. That is a form with a label on it. What makes it feel like somebody took the job is the director saying what they are going to do with THIS track: 'It's slow and it's about one person, so I'm staying close. Two places, the rooftop for the chorus. I'll hold the hook.'
   You already make the model call and `DirectorProfileV1.voice` already exists, so this is a field on an answer you are already generating. Absent or '' is fine and we narrate from the four answers instead.

4. TRAITS, also optional, also on the director list:
     traits?: string[]   // 2-3, <= 24 chars each, e.g. 'Cuts on the loud bars'
   Three cards that differ only in a paragraph read as three paragraphs. You already hold the numbers that make them actually different - performanceRatio, cutFastPercentile, ladderShift, the camera vocabulary - and two or three of them written as plain phrases is the cheapest way to show a user that the difference is real. Written by hand, not generated.

NOT ASKED FOR, and worth saying because it would be the obvious next thought: no 'no director' field. We checked - `resolveDirectorV1('')` already answers with HOUSE_DIRECTOR_V1 and the brief route already treats a missing directorId as no director. The manual path is simply us not sending the field, and it needs nothing.

## Understanding

A product note from the dev on the Batch 8 screens, now that both halves are running on a device. Three of the four asks are copy and art rather than logic, and the fourth is a field on a call you already make.

The reasoning behind it, in my words: a director is only worth picking if it is somebody. Today the card is a description of a parameter set with no face, so what the user sees is a third form standing between them and a render. The gap is not information - the intro line is good and the arithmetic behind it is real - it is that nothing on the card behaves like a person.

What I am doing on my side regardless of this ticket:
- A fourth option, 'I'll direct it myself', which sends NO directorId and shows the brief as the plain form with empty fields and greyed examples, the way 7.1 shipped. That is the user's ask and it needs nothing from you.
- When a director IS chosen, the brief becomes a plan they narrate rather than four filled boxes, with a 'change anything' affordance. I will compose that narration from the four answers until `pitch` exists, and swap to `pitch` the moment it does.
- Their avatar follows them: the card, the brief, and a small presence on the render screen, so it reads as that director doing the job rather than a choice you made once and never saw again.

Assumptions, correct any:
- Ids never change. `stays-close` stays `stays-close` whatever the name on the card is, because a stored plan cites it (8.14) and my fallback list is keyed on it.
- The names are yours to set. I proposed three so you are not inventing copy from a ticket, not because mine are right.
- `pitch` is written in the reader's language like the rest of the brief (D-039), not the song's.
- Until the art lands the cards stay typographic rather than showing a placeholder tile, so there is no visual debt to undo.

## Plan

1. Ship the mobile side now, against the shapes above, all optional: no art, no pitch and no traits still renders a correct screen.
2. Add the manual path (no directorId) and the plain-form brief behind it.
3. Rewrite the brief's top as the director's plan with a 'change anything' affordance, narrated from the four answers until pitch exists.
4. Carry the avatar through the brief and the render screen.
5. Transcribe whatever names you settle on into the fallback list, since the ids are what has to agree.

## Reason

The screens are built and the pipeline behind them is real - two directors genuinely cut differently. What is missing is the half a user actually judges it on. A name somebody repeats, a face that recurs, and a sentence about their own song is the difference between a feature and a third step in a form, and none of it is engineering.

## Related files

backend: assets/directors/{stays-close,fills-floor,holds-frame}.png, src/services/render/directorsV1.ts, src/services/render/briefV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts; mobile: src/features/create/directors.ts, src/app/(create)/director.tsx, src/app/(create)/brief.tsx

## Acceptance criteria

GET /directors returns three persona names, three non-empty avatarUrls that load on a device, and optional traits. POST /brief with a directorId can return a pitch in the reader's language, and still answers 200 without one. A brief with no directorId is unchanged from today.

## Test steps

—

## Thread
2026-10-30T13:03:56+05:30 aquib N: created ticket, status: - -> open
2026-10-30T13:04:26+05:30 aquib N: status: open -> approved
2026-10-30T13:25:10+05:30 aquib N: All four are in, and all four of your assumptions hold as written — ids never change,
the names were mine to set, the pitch follows the reader's locale, and the cards stay
typographic until art lands (they do not have to any more).

1. NAMES — taking yours exactly: Mira / Dev / Kabir, knownFor unchanged. One flag
   rather than a change, because it is a judgement call and it is yours: Mira Nair
   and Kabir Khan are both well-known Indian directors, and a first name alone in a
   film-making product sits closer to them than it would anywhere else. I do not
   think a bare first name borrows anybody's credibility and I have shipped them —
   but you wrote "not a real director's name" in the ticket, so you should get to
   apply your own rule. Say one word and I will swap either; it is one string and the
   ids do not move.

2. AVATARS — three files, and they are not placeholders. 512x512 WebP, 14-18KB each
   (PNG was 240KB for the same flat art). Generated with our own image model through
   a committed script, scripts/generate-director-avatars.ts, which exists precisely
   because "one set, visibly one hand" is a constraint somebody has to honour again
   for a fourth director — the shared style block in it IS the hand.
   It took two passes. The first set failed your own first requirement: Dev came back
   with a heavier outline, a patterned shirt and a cut-out silhouette edge, so the
   three read as two illustrators. The style block now pins line weight, crop,
   single-colour clothing and shoulders running off the bottom edge, and the second
   set is one hand. A third pass fixed Mira specifically — her jumper was the same
   value as her background, so she was a pale blob at 56pt while the other two
   separated cleanly. Contrast between garment and field is now stated in the prompt
   rather than hoped for.
   Checked as a contact sheet at 192pt and 56pt, on white and on #12151a.
   avatarUrl is now non-empty for all three and is built from the host your DEVICE
   used, not BACKEND_URL — that is localhost:5006 here, which would have handed you
   three unloadable URLs.

3. PITCH — on POST /brief, and only when a directorId is sent. With no director the
   request is byte identical to the one 7.10 was measured on, which is the same
   promise D-047 makes everywhere else, so your manual path is genuinely untouched.
   Three real pitches on the same slow 80 BPM track, so you can see they are three
   plans and not three moods:
     Mira:  "...I want to follow two people through the quiet streets, letting the
             music play softly under their moment rather than having them perform to
             the camera. When the chorus lifts, we let them finally pull each other
             close."
     Dev:   "...I want to take that dark refrain and surround you with crowds, setting
             two distinct night worlds against each other."
     Kabir: "...I want to hold you completely still in symmetrical, wide spaces while
             the night surrounds you."
   That first one is the 0.15 lane ratio said in plain words, which is the thing worth
   noticing: the voice is reaching the same place the arithmetic already goes.
   Locale verified on a real call: an English song with hi-IN and ta-IN comes back in
   Devanagari and Tamil respectively, pitch included.

4. TRAITS — two or three per director, all <= 24 chars, hand-written and each one a
   restatement of a field on the profile. A test pins that the "to camera" chip
   belongs to the highest performanceRatio, the "loud bars" chip to the lowest cut
   percentile and the "close-ups" chip to the biggest ladder shift, so the copy cannot
   quietly drift off the numbers it is claiming to describe.

Nothing changed about the no-director path, as you said it would not need to.

One thing you should know because it affects your fallback list: avatarUrl is no
longer ever empty for these three, so the "typographic until art lands" state is dead
code on your side the moment you deploy against this. Keep the bundled art as the
offline fallback — the ids still agree — but the card can assume a picture now.
