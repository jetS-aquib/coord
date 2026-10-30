---
id: D-057
title: The cast gets portraits, but only on a render that asked for the gate
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-231
---

## Context

JET-231 asks for a portrait per cast member on the call sheet, and asks the question honestly: that is 2 to 4 image calls on a plan nobody has approved, against a gate D-051 deliberately costed at two text calls and one image. One of the ticket's three premises is already false — the plate IS drawn before the review stop, in applyDirectionV1, and the device run that prompted the ticket (mvr_1793360749640_e97d6b04, status review, 3 cast) has a populated plateUrl. So the fallback the ticket offers to settle for already exists. The question that remains is whether a six-panel reference sheet is a picture OF THE CAST in the sense a card needs. It is not: it holds the whole cast and the location in one image, the panel layout is not a contract, and mobile correctly refuses to crop faces out of it.

## Options considered

1. No portraits. The plate is already there and a name is free, which is the trade the ticket says it would take. 2. Portraits on every render. Simple, and it spends on every render started from the web, which has no call sheet to show them on. 3. Portraits only when the caller asked for the review gate, drawn after the plate and conditioned on it. 4. Portraits drawn lazily after accept, when the anchors are being drawn anyway. Free in effect, and useless — the screen that wants them is the one before accept.

## Decision

Option 3. When a plan carries the review flag, the direction pass draws one portrait per cast member after the plate, concurrently, each conditioned ON the plate, each behind the same deadline and the same fail-soft the plate already has. A render that did not ask for the gate draws none, because it has no screen to show them on. Absent art is an absent field, never an empty string, so the card draws its own slot. Named cast members cost nothing extra and are taken from autoGenerateCast's existing answer.

## Reason

The constraint is what makes the spend defensible, and it is the whole decision: the cost lands exactly where the screen is. Option 2 would have paid for three images on every web render, every resume and every project that never opens a call sheet — which is most renders, and none of them can display the result. Gating on the flag the caller already sends turns a general cost into a cost somebody asked for.

Conditioning each portrait on the plate rather than on the description alone is not polish. A card that shows a face the render will not draw is worse than a card with no face, because it makes a promise the video breaks — the same failure the pitch had before D-053. The plate is already the reference every anchor is drawn against, so a portrait drawn from it is the same person by construction. It also fails in the right direction: no plate means no reference, which means no portraits, rather than three faces nobody will see again.

The names cost nothing and should have been kept from the start. autoGenerateCast has always returned name, role and description, and resolveCastV1 dropped the first two on a correct rule stated too broadly — a name must never reach a PROMPT, because that is what the provider refuses. It was never a reason to hide the name from a person reading a screen, and keeping it is what lets the beat, the notes and the row say Maya instead of at-image-one.

## Consequences

A gated render now costs two text calls, one plate and one to three portraits before anything is approved; an ungated one is unchanged. Latency at the gate rises by roughly one image call, since the portraits run concurrently behind the image lane cap. Every path fails soft: no plate, a refusal, a timeout or an error each leave the field absent and the screen draws its own slot, which mobile has already built. The portraits are stored on the plan beside the cast, so a resumed or reopened call sheet shows the same faces rather than redrawing them. What this does NOT do is give the cast art to the render itself — the anchors are still drawn against the plate, so nothing about a rendered frame changes. If the spend turns out to be unwanted, the switch is the review flag and not a code change.
