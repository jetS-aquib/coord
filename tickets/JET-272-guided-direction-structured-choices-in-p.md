---
id: JET-272
title: Guided direction: structured choices in, prompts baked from templates, brief ranks our options
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:23:39+05:30
updated: 2026-11-09T23:31:08+05:30
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
2026-11-09T23:31:08+05:30 aquib N: status: open -> approved
2026-11-09T23:55:56+05:30 aquib N: Mobile half built (uncommitted): Direction screen is four chip groups from GET direction-options (shipped fallback with the same ids), preselected from brief.ranked[0], a tap always wins; one optional 'Anything special?' (<=300). Save sends direction { directorId?, story, cast, place, mood, look: visual style id, special? } plus directionPrompt as the same choices in words for the first storyboard call. The who/where/story/look/note free-text fields and answers.ts are gone.
2026-11-10T00:06:16+05:30 aquib N: FOLLOW-UP from device testing (mobile, aquib N), please pick up under this request:
(1) The ranking contradicts the pitch. Seen on a real song with Dev: the pitch said 'two rival crowds ... a huge courtyard battle ... nobody stands alone', but ranked.cast[0] was 'solo' (and place came back city_night for a courtyard). The app preselects ranked[0], so the screen tells the person the opposite of what the director just said. Ask: rank in the same call as the pitch and make the pitch consistent with the top choice of every group (or write the pitch from the top choices), so pitch and preselection never disagree. A check that flags cast/place/mood words in the pitch that contradict ranked[0] would catch regressions.
(2) Wording: the server labels read as fragments under a heading ('A story' rendered as 'A'; 'Just one' under "Who's in it" is a count). The app now owns its wording and keys only on ids: story = The artist performing / Performing and a story / A story with actors (heading 'Artist or story'); cast = Just one / Two / Three or four / A crowd (heading 'How many people'). No backend change needed for mobile; align GET /direction-options labels if the web will use them, so both say the same.
Mobile no longer calls GET /direction-options.
