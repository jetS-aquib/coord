---
id: D-046
title: A director is a parameter set that biases the grammar, not a prompt that describes a style
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: 
---

## Context

Batch 8. The product problem is that the four brief inputs of 7.1 are optional and therefore do not read as a feature; the intended answer is that a user hands the song to a named director with a personality and a specialism, and stops being asked craft questions at all. The engineering question is what a director IS. Everything a director would decide already exists in code and is frozen at a single value: DEFAULT_PERFORMANCE_RATIO_V1 = 0.35, LADDER_16_9 and LADDER_9_16, the camera-move table, the lyric-mode policy, and the bars-per-clip choice in cutPlanV1. D-033 already noted of the lane ratio that 'exposing it is a parameter, not a change', and ShotGrammarOptionsV1 already accepts it.

## Options considered

1. A director is a block of text prepended to the treatment prompt. Cheapest, and the model decides what the style means. 2. A director is a parameter set over the grammar that already exists, plus a voice for the treatment. 3. A director is a separate pipeline per style. 4. Let the model pick the director from the song and do not ask the user.

## Decision

Option 2. DirectorProfileV1 widens ShotGrammarOptionsV1 and is threaded through shotGrammarV1, cutPlanV1 and treatmentV1. A profile sets the lane ratio, the cut-rate bias, the shot-size ladder, the camera vocabulary, the lyric-mode policy and the location count, and supplies a voice for the treatment call. Today's constants ship as one built-in profile, so the refactor changes no rendered frame. TWO RULES BIND IT. First, every value is a weight or a preference order, never an absolute duration or an absolute count: a director BIASES the grammar and never dictates it, because the song read decides cut points from real bars and real energy and a dance director handed a ballad must not force fast cuts. Second, the resolved profile is stored on the plan, not the director's id, so a later tweak to a director does not silently rewrite what an old render meant.

## Reason

The failure mode of option 1 is the one that kills the product idea: if two directors differ only in prompt adjectives they produce the same cut rate, the same shot progression and the same lane split, and a user sees through them in one render. What is visible in a finished video is the arithmetic — how often it cuts, how tight it sits, how much of it is the artist to camera. That is also the split D-034 already settled, arithmetic in code and judgement to the model, so a director is simply a second set of arithmetic rather than a new idea. Option 2 is additionally the cheap one precisely because the knobs exist; the work is R&D into what the numbers should be, which is where the effort belongs. Option 3 would fork the pipeline and double every future fix. Option 4 throws away the trust the feature exists to buy — handing the song to someone you chose is the product, and a hidden choice is not a handover. The bias-never-dictate rule is there because the obvious way to make directors feel distinct is to let them set durations outright, which would reinstate the fixed grid Batch 6 removed.

## Consequences

8.9 is a pure refactor and should land before any director exists; everything after it is data entry. Three directors are planned, differentiated by arithmetic and grounded in the target languages rather than Western defaults — notably a LOW lane ratio for the Hindi-leaning one, because contemporary Hindi picturisation has moved away from lip-sync, which happens to also be the cheapest thing to render well while Batch 10 does not exist. Mobile gains a director screen before the brief and the brief becomes 'your director chose these, tap to change'. The plan grows a resolved profile, which is what makes two renders comparable and any R&D possible at all — the same argument as 7B.5. Avatars and animation are explicitly not on the critical path: static art first, because the trust comes from the intro naming a real craft choice and not from the picture. A director that turns out to be indistinguishable from another is then a data problem with a measurable answer, rather than a rewrite.
