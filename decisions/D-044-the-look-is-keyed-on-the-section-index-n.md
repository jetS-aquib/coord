---
id: D-044
title: The look is keyed on the section index, not on the section label
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-215
---

## Context

JET-215 asked video-processing for stable, finer section boundaries, and its plan listed two things as OURS rather than theirs: cap the shot-size progression so a long section re-establishes, and 'stop keying location on the section label alone — until boundaries are stable, a repeated label is as likely to be a mislabel as a real reprise'. The first shipped. The second had not, and a full 45-clip render on 2026-10-29 (mvr_1793277832749_3e886f1a) showed exactly what it costs. The song read returned EIGHT sections with real, distinct boundaries — 14s, 21s, 72s, 24s, 63s, 15s, 33s, 14s — and labelled seven of them 'verse'. lookBibleV1 keyed locations on the label, and treatmentV1's prompt explicitly instructed 'give ONE location per distinct label, not per section', so the model collapsed seven sections into one place and 42 of the 45 clips were shot in the same room. The model obeyed us perfectly; the instruction was wrong.

## Options considered

1. Wait for JET-215. The boundaries are already good — only the labels are bad — so waiting fixes nothing we are actually blocked on. 2. Infer reprises in code from energy and repeated lyric lines. Needs a similarity threshold against a distribution nobody has measured, which is the mistake this codebase has paid for three times. 3. Key the look on the section index and drop the reprise rule. Fixes the collapse and loses 'chorus 2 rhymes with chorus 1', which is most of what reads as production value for free. 4. Key on the index and move the reprise judgement to the treatment: one place per section, with the model reusing the same location text where a section genuinely returns.

## Decision

Option 4. LookBibleV1 gains locationsByIndex and timeOfDayByIndex, keyed on the section index as a string, and the treatment writes only those. The prompt now says a genuine reprise shares a place — same location text, new time of day — and says explicitly that two sections sharing a LABEL are not thereby a reprise, because the labels are a machine's guess and are often the same word for the whole song; judge from the words and the lengths. 'Few places, but not one' replaces 'few places'. environmentForV1 takes the section index and reads index first, then label, then the clip's own environment. The old label-keyed locations/timeOfDay remain and are written ONLY by fallbackLookBibleV1, which has nothing but labels to group by, so the two maps cannot disagree. A treatment that places no section at all is refused, as a treatment with no places already was. Rule 6 of the shot list prompt is aligned: read the place, not the label.

## Reason

The boundaries were never the part we could not use. The read gives eight real spans and one unreliable word per span, and we were keying the entire look of the video on the unreliable word while throwing the reliable part away — D-038 and D-039 had already agreed the read's labels and its language are guesses, and this is the third place that lesson applies. Index-keying is strictly more expressive than label-keying rather than a replacement for it: when the labels ARE right the model gives both choruses the same string and the craft rule behaves exactly as before, and when they are wrong the video still gets more than one room. Option 2 was the tempting one and is the one to refuse: 'these two sections are similar enough to be a reprise' is a threshold, nobody has the distribution, and the 4.0 seam threshold, the 0.70/0.90 cut-rate line and trusting Whisper's language field are what guessing one costs. Whether a section returns is a judgement about the song, and D-034 already settled that judgements go to the model while arithmetic stays in code — the index is the arithmetic, the reprise is the judgement.

## Consequences

A song whose every section is labelled the same now gets a place per section rather than one place, bounded by the prompt's 'two or three locations, not nine' and by the model reusing text for real reprises. Unverified on a render: the next one shows how many distinct locations actually come back, and that number is the thing to look at. The frame gate's location check becomes meaningful for the first time — it was comparing 45 frames against one of two places, which is why it almost never fired on location. Plans stored before this keep rendering identically on resume, because environmentForV1 still reads the label maps when there is no index entry. JET-215 remains open and still matters: stable boundaries make a re-render of an unchanged song reproducible, and no bridge is still ever returned so the disjunctive lyric mode still cannot fire. But the look of the video is no longer waiting on it.
