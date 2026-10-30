---
id: D-047
title: An unset director is the house style, not the default director
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-225
---

## Context

Batch 8.9. D-046 settled that a director is a parameter set over the grammar that already exists, and required that shipping it change no rendered frame. That leaves one question D-046 did not answer: what a render with no directorId resolves to. Every project saved before this commit has none, every render started from the web has none, and the last baseline render (mvr_1793338408189_d864708f, 45 clips, 54 re-renders against a cap of 54, 8 locations) is the thing four renders of measurement are written against. JET-225 separately asks for a defaultId on the director list, named explicitly rather than inferred from array order, because 8.12 says doing nothing picks a director.

## Options considered

1. One default: defaultId is a real director and an unset directorId resolves to it. Simplest, and every pre-Batch-8 render silently becomes a different video. 2. Refuse to render without a director. Breaks the web path and every stored project. 3. Resolve an unset director to today's frozen constants, kept as a profile that is not in the catalogue, and keep defaultId as a separate fact about what the screen pre-selects.

## Decision

Option 3. HOUSE_DIRECTOR_V1 in directorsV1.ts holds today's numbers exactly — 0.35 performance ratio, the 75th energy percentile, no ladder shift, the camera table that used to be NARRATIVE_MOVES_V1, illustrate-on-hook and disjunctive-on-bridge both on, and an EMPTY voice so the treatment and brief prompts come back byte identical. It is deliberately absent from DIRECTORS_V1, so it can never be picked. resolveDirectorV1 answers three ways: nothing chosen is the house style, a known id is that director, an unknown or retired id is DEFAULT_DIRECTOR_ID_V1 ('stays-close'). The brief echoes '' rather than 'house' when nobody chose, so the screen can only claim a director wrote its suggestions when one did.

## Reason

Nobody chose and the default chose are different facts, and conflating them costs the thing 8.9 exists to protect. With one default, the first deploy of Batch 8 re-cuts every stored project under a 0.15 lane ratio and the baseline render stops being comparable with anything after it — the same failure as storing a director by id instead of resolved, one level up. Keeping them apart is one branch in one function and it is what makes 'this refactor changes no rendered frame' a provable claim rather than an intention: 161 pre-existing tests pass untouched. An unknown id resolving to the default rather than 400 is the same posture as the brief endpoint: this is in front of a person, and a client one release behind must get a working render rather than an error.

## Consequences

A fourth profile exists that no user can select, which is one more thing to read in directorsV1.ts; directorsV1.test.ts pins its numbers so a careless edit reads as a failing assertion rather than as a quietly changed render. A project saved before Batch 8 renders exactly as it did, and so does any render started from the web until that path sends a directorId. Mobile always sends one, so in practice almost every new render gets a real director — the house style is a floor, not a common case. When every stored project has a directorId and the baseline has been re-measured under a real director, this profile can be deleted and option 1 taken; that is a one-line change and it should be a deliberate one.
