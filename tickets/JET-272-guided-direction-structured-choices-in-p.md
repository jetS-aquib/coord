---
id: JET-272
title: Guided direction: structured choices in, prompts baked from templates, brief ranks our options
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-09T03:23:39+05:30
updated: 2026-11-09T03:24:30+05:30
decisions: D-077
---

## Request

Accept direction: { directorId?, story: performance|mixed|story, cast: solo|duo|band|crowd, place: city_night|nature|stage|home|road|fantasy, mood: euphoric|romantic|dark|nostalgic|defiant|calm, look: visual style id, special?: string<=300 } on the project. Bake the treatment/shot-list/script prompt text from fixed per-key templates instead of pasting directionPrompt raw. Brief returns, per group, the option ids ranked for this song and director (top one = recommended) instead of free-text suggestions. directionPrompt stays accepted for old projects.

## Understanding

The product owner wants minimal free text and deterministic, consistent results. Today mobile joins who/where/story/look/note into one 'Who: ...' string (answers.ts buildDirection) and the backend pastes it into three prompts (treatmentV1.ts:173, shotListV1.ts:429, scriptV1.ts:166). ASSUMPTIONS: (a) the option lists are a starting set and ours to edit; push back on any the pipeline cannot act on; (b) story maps to performanceRatio (D-033) and cast to cast min/max, overriding the director's defaults when set; (c) place and mood go into the treatment prompt as fixed phrases; (d) special is the only free text, in a bounded slot after the intent step (companion request); (e) same inputs must produce byte-identical baked prompt text.

## Plan

1. Option catalogue (ids, labels, prompt phrases) in one module, served by GET /direction-options.
2. Project schema: direction object; validation.
3. bakeDirectionV1(direction, director) -> text used where directionPrompt is used today.
4. Brief schema: per-group ranked ids; keep pitch.
5. Fallback to directionPrompt when direction is absent.
6. Contract update; a test that the same direction bakes the same text.

## Reason

Consistency and accuracy: guided inputs give the same video for the same choices, and remove most typing for rookies.

## Related files

src/services/render/briefV1.ts, treatmentV1.ts, shotListV1.ts, scriptV1.ts, directorsV1.ts, src/models/MusicVideo.ts, musicVideoV1.routes.ts, contract

## Acceptance criteria

A project saved with a direction object renders with baked prompts (logged); two saves with the same object produce identical prompt text; brief returns ranked ids per group; an old project with only directionPrompt renders as before.

## Test steps

—

## Thread
2026-11-09T03:23:39+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
