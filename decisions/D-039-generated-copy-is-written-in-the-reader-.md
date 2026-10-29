---
id: D-039
title: Generated copy is written in the reader's language, which the song does not get to choose
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: 
---

## Context

A live render on 2026-10-29. Whisper hallucinated the opening of an English track — the first transcript lines came back as 'Sasada tat, ica vada' — and reported the song's language as 'la'. briefV1 and treatmentV1 both read that value and instructed the model to write in it. The brief came back in competent Latin ('Homo superbus cum grege fidelium vestitu luxurioso'), mobile filled all four inputs with it, and the treatment's logline went out in Latin too. The prompts and the look bible were unaffected, because 7.5 already pins everything that feeds an image to English — the damage landed exactly where the design said human-facing text would go.

## Options considered

1. Keep reading the song's language and add a confidence gate. There is no confidence value in the response to gate on. 2. Keep it but restrict to a whitelist of languages we ship. Fixes Latin, invents a product scope nobody decided, and still trusts a guess inside the list. 3. Take the language from the reader — the client's locale — and never from the song. 4. Always English.

## Decision

Option 3. displayLanguageV1 in a new leaf module languageV1.ts normalises a caller-supplied code: a device tag reduces to its language part, and anything that is not exactly two letters becomes 'en'. POST /api/v1/music-videos/brief takes an optional language; MusicVideo carries one for the treatment. The detected language stays in the facts handed to the model, explicitly labelled a guess and explicitly barred from deciding what language to write in, because it is still useful for choosing an example. Two letters rather than two-or-three is deliberate: three admits real ISO codes and also admits 'not' out of 'not-a-language-code'.

## Reason

This narrows 7.5 and the language clause of D-037, which said human-facing text comes back in the song's language. That was wrong in a way worth naming: the song read's own contract documents  as a guess, the same as the section labels, and we had already agreed to treat the labels as guesses. A wrong label costs one prompt; a wrong language costs the entire screen at once, with no partial credit, and the person cannot even read the error. The language of a form is a property of whoever is reading it, which is the client's to know and not something to infer from a machine transcription of a noisy intro. English as the default is wrong for some people and readable by far more of them than Latin is.

## Consequences

Until mobile sends a locale, every brief and logline is English — including for songs genuinely in another language, which is a regression against the intent of 7.5 and is accepted because the alternative is Latin. A ticket covers mobile sending the device locale on /brief and on project create; MusicVideo.language exists already so that change is one-sided. Three-letter language codes degrade to English. The detected language is still stored and still shown to the model as context. Nothing about prompts, the look bible or the shot list changes — those were always English by design.
