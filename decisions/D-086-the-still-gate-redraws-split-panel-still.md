---
id: D-086
title: The still gate redraws split-panel stills
date: 2026-11-17
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-339
---

## Context

Stills are drawn against a 6-panel character/location plate and sometimes copy its grid. The gate never asked whether a still is one frame, so panel stills passed (gate 'pass' on mvr_1794916057996_8297cb2e) and opened shots and the Library poster.

## Options considered

(a) a stronger SINGLE FRAME line only — already in the prompt, not enough; (b) a pixel-level border detector — more code, brittle on windows and doors; (c) an objective 'panels' observation on the gate's existing vision call, in GATE_REDRAW_ON_V1.

## Decision

(c). The gate question asks 'panels'; a true answer is a failure kind 'panels' that the gate redraws for with the correction 'ONE single full-bleed frame'. The clip check shares the question and only records it; CLIP_REDRAW_ON_V1 is unchanged.

## Reason

A grid is not a judgement call, which is the bar GATE_REDRAW_ON_V1 sets; it is the most visible defect in a demo; and it adds one boolean to a call already being made.

## Consequences

A redraw only when a still is actually a grid, capped by MAX_ANCHOR_REDRAWS_V1 and the gate budget. Demo tier has no gate, so it is unprotected. Supersedes D-085, which was recorded empty by mistake.
