---
id: JET-231
title: Give the cast a face and a name, so the call sheet shows people instead of image prompts
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-10-30T17:27:51+05:30
updated: 2026-10-30T17:49:04+05:30
decisions: D-057
---

## Request

Put a portrait URL and a short name on each cast member of the call sheet, and stop the storyboard's @imageN tags reaching the reader in the beat, the notes and the why. The first device run of the call sheet is the evidence and it is attached below as what it actually looked like.

## Understanding

In my own words: JET-228 assumption 4 said you were NOT drawing a portrait per cast member, that cast cards would carry a one-line description plus the shared six-panel plate, and that if I needed per-person art it was a decision for the thread rather than something you would assume. This is me taking you up on that, with a device run rather than an opinion.

THREE THINGS THE FIRST REAL CALL SHEET SHOWED, all of them about the same missing field.

1. THERE IS NO PICTURE OF THE CAST AT THE GATE, including the plate. I checked rather than assumed: renderPlateSpriteV1 runs inside regenerateCastV1, and on the first pass it runs in the anchoring path. Anchoring is after accept. So at review, plateUrl is '' and the only thing a cast card can draw is text. JET-228 costs the gate as two text calls and ONE REFERENCE IMAGE, so I think the plate being absent here is a gap rather than a decision, and moving it before the review stop may be most of this ticket.

2. THE DESCRIPTIONS ARE IMAGE PROMPTS AND THEY ARE NOT CARD COPY. A real one is forty words: 'A distraught 24-year-old East Asian man with wet, messy raven hair, tear-streaked cheeks, and sorrowful dark brown eyes. He wears an oversized silver reflective bomber jacket over a distressed black leather tank top, paired with layered chain necklaces.' Three of those stacked is most of a phone screen of unbroken prose, before the shot list the person came for has started. They are the right thing to send an image model and the wrong thing to put on a card.

3. THE BEAT STILL HAS @imageN IN IT, and that is the one I would call a defect rather than a request. A real section header read '@image1 marches through a dense steaming neon night market flanked by his loyal crew including @image3, catching sight of his ex @image2 leading her own squad through the vibrant crowd.' 8.4 asks for the beat in the reader's language; a storyboard tag is an identifier that leaked out of the layer underneath it. The same tags turn up in section notes and in some why strings.

ASSUMPTIONS, each of which I would rather have corrected than guessed:
 a. One portrait per cast member is 2 to 4 image calls on a plan that has not been approved, and you costed the gate deliberately. If that is too much to spend before an accept, SAY SO and the answer is the plate moved earlier plus a name, which costs one image and no new calls at all. I would take that trade.
 b. I cannot crop per-member faces out of the plate and I am not going to try. platePromptV1 lays out three panels across the top for the whole cast, head-and-shoulders AND full length. With three cast members that might be one each by accident; it is not a contract and nothing in the prompt makes it one.
 c. A name is two or three words that a person would say out loud, not a tag and not a role title. 'Arjun', or 'the dancer'. It is what makes the beat a sentence.
 d. Both fields are optional on the wire as far as mobile is concerned. The screen is already built to draw a designed slot where the face goes and to read a short label off the description's own shape, so nothing here is blocking and nothing breaks on the day they arrive.

## Plan

1. Draw the plate during the direction pass, before the render stops at review, so plateUrl is populated on the call sheet. This may be the whole of what is needed for a picture to exist at the gate.
2. Add name to each cast member: two or three words, written by the pass that already writes the description, in the reader's language.
3. Add imageUrl to each cast member if a. is affordable. If it is not, answer on the thread and leave it off rather than spending on it.
4. Resolve @imageN to the member's name wherever a string is written FOR A READER: section beat, section notes, and row why. The clip prompt keeps its tags; it is the only consumer that should ever see them.
5. Both new fields on the call sheet cast entry, beside tag, description and locked.

## Reason

The call sheet is the hero moment of Batch 8 and the one screen that has to carry the claim that somebody read your song and made a plan. On a device it currently carries three image prompts and a sentence addressed to a storyboard. Your own code already made this argument once and better than I can: the row line counts people rather than naming them, with a ponytail comment saying that splicing a model-written description into a four-word row destroys the row. The beat is the one place that rule was not applied, and the reason it could not be is that there is nothing short to splice IN. A name fixes the row, the beat, the notes and the card with one field.

## Related files

Backend: src/services/render/renderOrchestratorV1.ts (the plate before review, resolving tags for readers), src/services/render/callSheetV1.ts, src/models/RenderPlanV1.ts (cast: name, imageUrl). Mobile, already built against this: src/features/create/cast-portrait.tsx draws the slot, src/features/create/call-sheet-text.ts holds the three stopgaps that come out when this lands, src/lib/generation.ts types both fields optional.

## Acceptance criteria

A call sheet at review carries a picture of the cast — a portrait per member, or failing that a populated plateUrl. Every cast member carries a name of two or three words. No string a person reads on the call sheet contains @imageN: not the beat, not a section note, not a why. A render whose cast is empty still answers, and the fields are simply absent rather than null.

## Test steps

1. Start a render with `review: true`. Poll until the status is `review`. On the plan: every
   cast member has a `name` and an `imageUrl`, and `plateUrl` is set.
2. GET the call sheet. Each cast card carries name, description and imageUrl. Open that
   imageUrl and the plateUrl side by side — it has to be recognisably the same person.
3. Read `sections[0].beat`. It names the person rather than saying @image1. Same for the
   logline, the pitch, every section note and every row's `why`.
4. Read any row that has a cast tag on it: "verse · medium · Cleo · concrete basement".
5. POST `.../cast/@image1/lock`, then POST `.../cast/regenerate`. The locked member keeps
   their name, description and portrait; anyone else changes. The plan's `overrides` array
   records the lock.
6. POST `.../cast/regenerate` with nobody locked. The person changes everywhere at once —
   the card, the logline, every beat and every row.
7. Start a render WITHOUT `review: true`. No portraits are drawn and nothing else differs.

## Thread
2026-10-30T17:27:51+05:30 aquib N: created ticket, status: - -> open
2026-10-30T17:31:53+05:30 aquib N: status: open -> approved
2026-10-30T17:35:52+05:30 aquib N: linked decision D-057 (The cast gets portraits, but only on a render that asked for the gate)
2026-10-30T17:47:51+05:30 aquib N: status: approved -> in_progress — Picked up — nothing committed yet, so the board has not moved it by itself.
2026-10-30T17:49:04+05:30 aquib N: status: in_progress -> review — Built, and verified on a live gated render rather than in tests alone — mvr_1793362298029_891e01ed, sitting in review on mv_1793353541497_q7e2a9 if you want to look at it. Test steps filled in above; the ticket was filed without them and the CLI has no command to add one, so they went into the field by hand.

ITEM 1 WAS ALREADY DONE, and the device run you filed this from proves it rather than contradicts it. The plate IS drawn before the review stop — it moved into applyDirectionV1 with JET-228, which is the one call site that is neither regenerateCastV1 nor the anchoring path. mvr_1793360749640_e97d6b04, the plan behind your screenshot, has a populated plateUrl. So the gap was never the plate; it was that a six-panel sheet of the whole cast plus the location is not a picture a CARD can use — which is the argument you actually made in assumption b. Nothing changed for item 1.

ITEM 3 IS AFFORDABLE AND IS IN, with one constraint that is the whole decision: portraits are drawn ONLY for a render that asked for the gate. A render started from the web has no call sheet to show them on, so it draws none and costs exactly what it costs today. The cost lands where the screen is. Each portrait is drawn AGAINST THE PLATE rather than from the description, which matters more than it sounds — every anchor is drawn against that same plate, so the card shows the person the video will actually contain. I looked at both images side by side on the live run: same bleached bob, same oversized pink blazer, same face. A card promising a face the render does not keep would be the pitch problem again. No plate therefore means no portraits. D-057.

ITEM 2 COST NOTHING AT ALL, which is the embarrassing part. autoGenerateCast has always returned name, role and description. resolveCastV1 threw the first two away on a rule that is right about PROMPTS — a real name is what the provider refuses, 20 of 31 clips on the first live render — and was stated so broadly that the name never reached a screen either. It is kept now and goes nowhere near a call.

ITEM 4 IS A BOUNDARY, NOT A REWRITE. The stored treatment keeps its tags on purpose, because generateShotListV1 reads section.beatEn back into a prompt where the tag is what makes it unambiguous. Everything leaving for a screen goes through one function instead. That bought something I did not design: on a live recast, renaming the person updated the logline, every beat and every row at once with nothing rewritten and nothing stale, because the stored text still says the tag.

ONE THING TO EXPECT ON THE WIRE, since your done-when says no at-image-N anywhere. cast[].tag and rows[].castTags[] still carry them, and they have to — they are the join key between a row and a card, not prose. Every string a person reads is clean: logline, pitch, approach, beat, place, notes, why, and the row line.

AND THE ROW NAMES PEOPLE NOW. The ponytail comment you quoted said it would name them the day somebody wrote short labels; the day arrived. It falls back to counting when the joined names would not fit the row, because the row is the thing being protected.

A BUG YOUR TICKET DID NOT ASK ABOUT AND THE SAME SCREEN WOULD HAVE SHOWN. Crew notes were duplicating: mvr_1793357396752_54dbbb09 carries 'Watched the middle of 45 takes, 40 of them wandered' six times and 'Cutting it together to the beat' four, because runPlanV1 runs again on every resume and every single-clip re-render and each run narrated its phases afresh. 9.9 narrates from these, so your screen would have shown the same sentence six times. Deduped on the exact line, so a phase whose numbers changed still appends and one with nothing new to say does not.

ONE LIMIT, and it only touches plans stored before today: a cast member with no name falls through to 'the subject', so an OLD plan's beat reads 'the subject marches through the night market flanked by the subject'. It satisfies the done-when and it is honest, and every render from here has names. Not worth a migration.

Mobile needs nothing new from you for this — both fields are optional exactly as your assumption d described.
