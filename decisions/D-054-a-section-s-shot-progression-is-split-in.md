---
id: D-054
title: A section's shot progression is split into even runs, so a re-establish is never one clip long
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

shotSizeV1 takes a section's clips wide to close so the shot tightens as the section builds, and caps the run at one ladder length so a long section re-establishes rather than giving ten identical mediums — a cap bought with a real render, where a 200.9-second section held 33 of a song's 44 clips. The cap is implemented as 'position modulo the ladder length', which leaves whatever is left over as the final run. When that remainder is one clip, the section renders close -> wide -> close at its very end, which reads as a mistake rather than as a re-establish. Measured over the counts a section actually takes: it is wrong at 7 clips and at 33, right at 1 to 5, 6, 8, 9, 11, 19 and 43. Batch 8B makes it common rather than rare — the library's median track is 2:58 against the 4:16 the grammar was measured on, and short tracks put more sections in the 6-to-9 band.

## Options considered

1. Leave it. It is two clips out of forty and nobody has complained. 2. Special-case the stub: when the last run is one clip, hold the tightest shot instead of re-establishing. One line, and it ends the section on three identical closes. 3. Forbid a run shorter than some minimum. A threshold, and the fifth unmeasured number in this codebase. 4. Partition the section into EVEN runs instead of full-ladder runs plus a remainder: ceil(count / ladder) runs, each spanning the ladder across however many clips it got.

## Decision

Option 4. The run count is ceil(count / ladder.length) and the section's clips are split evenly between those runs; within a run the existing formula is unchanged, and the last clip of a section is still forced to the tightest shot. A section of 7 goes from 'wide, medium wide, medium, medium close, close, WIDE, close' to 'wide, medium wide, medium close, close, wide, medium, close' — two real runs of four and three. Sections of 1 to 5 clips are byte-identical to today, which is most of the short-track case and all of the test fixtures that pin small sections.

## Reason

The stub is not a special case to be caught, it is what 'modulo' does with a remainder, so option 2 patches the symptom where the partition is the cause. Option 4 removes the remainder entirely rather than handling it, which is why it needs no minimum and therefore no threshold — the arithmetic cannot produce a run of one, because splitting N clips into ceil(N/5) parts gives every part at least three whenever there is more than one part. That is a property of the formula, not a number somebody chose, and it is the difference between this and the four unmeasured constants this codebase has already paid for.

It is also strictly a better progression where it differs and not merely a safer one: a section of six used to spend the whole ladder and then repeat its closing shot; it now re-establishes once in the middle, which is what a long section does on a set.

## Consequences

THIS CHANGES RENDERED FRAMES, and that is the cost of it. Every section of six clips or more gets a different shot size on at least one clip, including the 33-clip section of the baseline render mvr_1793338408189_d864708f. So the claim 8.9 was careful to protect — that a house-style render is frame-identical to the baseline — no longer holds after this commit, and the next render is the new baseline for anything compared frame to frame. The cut points, the lane split, the lyric modes, the cut counts and every director's arithmetic are untouched, so D-048's finding and the director comparisons it rests on are unaffected. shotListV1.test.ts gains a case pinning that no section ever renders a run of one, which is the assertion that would have caught this before a render did.
