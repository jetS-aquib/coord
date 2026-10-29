---
id: D-037
title: The brief's questions are fixed; only its examples, hints and defaults come from the song
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-218
---

## Context

7.10 of the render plan. 7.1 had already replaced one free-text Direction box with four inputs anybody can answer. The plan row says a sparse acoustic track and a 128 BPM club record do not deserve the same four questions, and that the read being in hand before the brief is what makes that possible — D-032 held the brief behind the song read on exactly that promise and recorded that the gate buys nothing visible until this ships.

## Options considered

1. Ask the model for the questions themselves — labels, order, how many. Maximum fit to the song. 2. Fix the four questions and let the model write only what sits under them: the hint, the example and the default. 3. Branch in code on the song's facts — if BPM is over 120 ask the club questions — and keep a model out of it entirely. 4. Leave the form generic and spend the effort elsewhere.

## Decision

Option 2. QUESTIONS_V1 in briefV1.ts owns the four keys, their order and their labels, and the merge takes them from that constant rather than from the answer, so a model cannot rename, reorder or add a field. The model writes per question: a hint of at most eight words or nothing, a placeholder example written for this track, and a suggestion — a real answer we would use if the field is left blank. songFactsV1 states what is measurably true of the song (tempo, shape, words per minute, the spread between its quiet and loud bars, whether it is instrumental) and does not interpret any of it; the model reads those facts and decides what kind of record it is. The endpoint always answers 200: a failed call, an instrumental or a missing read returns the generic form, flagged source 'default'.

## Reason

Option 1 makes the product's own four questions a model output, which means the screen can change shape between two songs and a user cannot learn the flow; it also makes the mobile form impossible to lay out. Option 3 is the mistake this codebase has now paid for twice — the 4.0 seam threshold and the 0.70/0.90 cut-rate line were both absolute thresholds against a distribution nobody had measured, and 'BPM over 120 means club' is the same bet. Which kind of record this is IS a judgement, and judgements go to the model while arithmetic stays in code, which is the split already recorded in D-034. Fixing the labels and varying what sits under them gets almost all of the fit for none of the instability. The screen sits in front of a person rather than in front of a render, so it always drawing matters more here than anywhere else in Batch 7 — hence 200 always, never 404.

## Consequences

One text call when the brief opens, on a read that is usually already warm. The four questions are now a shared constant between two repos that is not in a contract file: if they ever change, both ends change together. 'suggestion' gives mobile a way to make a blank field into a real answer, which also removes the all-blank 400 described in JET-217 for every song that has a read — an instrumental still has no suggestions and still needs that ticket's title fallback. A suggestion the person accepts reaches the treatment as the artist's own words, which is intended: it is what they saw and agreed to, and it is what makes the render reproduce the screen.
