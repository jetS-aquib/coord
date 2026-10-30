---
id: JET-231
title: Give the cast a face and a name, so the call sheet shows people instead of image prompts
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-30T17:27:51+05:30
updated: 2026-10-30T17:35:52+05:30
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

—

## Thread
2026-10-30T17:27:51+05:30 aquib N: created ticket, status: - -> open
2026-10-30T17:31:53+05:30 aquib N: status: open -> approved
2026-10-30T17:35:52+05:30 aquib N: linked decision D-057 (The cast gets portraits, but only on a render that asked for the gate)
