---
id: D-053
title: The pitch is persisted and reaches the treatment as the artist-facing contract
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-228
---

## Context

JET-227 added a 'pitch' to POST /brief: the director, first person, saying what they are going to do with THIS song — 'It's slow and it's about one person, so I'm staying close. Two places, and the roof for the big part.' It is written by the same call that writes the four suggestions and it is explicitly instructed to agree with them. It is then thrown away. Nothing stores it on the project and nothing passes it to generateTreatmentV1, so the director describes a plan on one screen and the treatment — generated minutes later, from the song read, the brief answers and the director's one-line voice — need not honour a word of it. Row 8.7 is the row that notices: it asks that every row of the call sheet carry its reason, and a reason that contradicts what the person was promised two screens earlier is worse than no reason.

## Options considered

1. Declare it cosmetic: it is screen copy, the treatment reads the same song and the same director and will land somewhere similar anyway. 2. Persist it and feed it to the treatment as a CONTRACT — what the artist was told, which the treatment must honour. 3. Persist it and feed it as context, worded as one more input among many. 4. Generate the treatment from the pitch alone.

## Decision

Option 2. MusicVideo gains pitch, written by the same save that already writes directorId and the four brief answers; the render copies it onto the plan at plan time, like every other field a resumed render must not re-derive; and generateTreatmentV1 takes it as a named input, placed in the prompt as WHAT THE ARTIST WAS ALREADY PROMISED and instructed to be honoured — not as taste, but as the one thing on the page that a person has already read and agreed to. An absent pitch changes nothing: the prompt is byte-identical to the one 7.2 and 8.9 were measured on, which is the same promise D-047 makes about the house profile.

## Reason

Option 1 is defensible for exactly one reason and it is the wrong one: the treatment would probably land somewhere similar. 'Probably similar' is not what was promised. The pitch names specifics — two places, the roof for the big part, staying close — and the treatment is the document that decides places. If it picks three places and a stairwell, the product has told the artist a lie in the one sentence that was supposed to make a director feel like a person who had listened. That is not a cosmetic defect; it is the feature's whole claim failing quietly, and nobody would ever see it because the two screens are minutes apart.

It is also already true that the brief's SUGGESTIONS reach the treatment when a person taps through them — D-037 recorded that deliberately, because 'it is what they saw and agreed to, and it is what makes the render reproduce the screen'. The pitch is written in the same call as those suggestions, instructed to agree with them, and read by the person in the same moment. Treating it differently from them is an inconsistency, not a design.

Option 3 is the version that sounds safer and buys nothing: a model given 'here is some more context' weighs it against everything else, which is the behaviour we already have. The word that does the work is that it was PROMISED.

## Consequences

A pitch that is wrong about the song is now a pitch that makes the video wrong, where before it was only a sentence that aged badly — the failure moves from invisible to visible, which is the trade and it is the right one. The brief call is unchanged; this costs no call. Mobile has to send the pitch back on the project save, which is one more field on a request it already makes (JET-228). Any project saved before this has no pitch and renders exactly as it does today. One thing this does not do: it does not make the pitch authoritative over the song read. The places count still comes from the director's range and the cuts still come from real bars — the pitch steers what the treatment writes, never what the arithmetic computes, which is the line D-046 draws and this does not cross it.
