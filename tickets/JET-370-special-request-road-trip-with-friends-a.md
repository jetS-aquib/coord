---
id: JET-370
title: Special request 'road trip with friends' answers 'could not work out what to film'
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-19T13:11:35+05:30
updated: 2026-11-19T18:39:04+05:30
decisions: 
---

## Request

A plain request that the model reads as a look/aesthetic but returns no recommendation must not show the failure message.

## Understanding

POST /special/understand with 'road trip with friends' (and 'golden hour, 90s film look') returns understood:true, kind:'aesthetic', needs:[], recommendation:null in ~1s. normalizeSpecialV1 only adds the fixed question for named references (NAMED_V1); an aesthetic with empty ingredients falls through with nothing, and the app shows 'We could not work out what to film from that. Video models also cannot copy a named film or person.' — wrong on both counts. Assumption: the right answer is to send the words through as written (kind 'plain') when there is neither a recommendation nor a question.

## Plan

1. In normalizeSpecialV1: no recommendation and no needs → return kind 'plain' (goes as written).
2. Unit test with the exact model output above.
3. Check why the model returns empty ingredients at LOW thinking (prompt or schema).

## Reason

—

## Related files

src/services/render/specialRequestV1.ts

## Acceptance criteria

'road trip with friends' continues without the failure message; a named film still gets its question.

## Test steps

1. In the app, Create → special request "road trip with friends" → Continue: after the short check it goes straight on, no "We could not work out what to film" card. The render's special request is the words as typed.
2. Same with "golden hour, 90s film look".
3. "make it Dhurandhar style" still shows "Like Dhurandhar how?" with options.
4. A look that does get a suggested version (try "dreamy pastel summer") may still show "What we aim for" with Use this / Keep my words; that is unchanged.
Regression sheet row TC-093.

## Thread
2026-11-19T13:11:35+05:30 aquib N: created ticket, status: - -> open
2026-11-19T18:39:04+05:30 aquib N: status: open -> approved
2026-11-19T18:42:04+05:30 aquib N: Built. normalizeSpecialV1: a reading that is not a name (aesthetic, genre, era) and came back with neither a question nor a recommendation now returns kind 'plain', which the app already treats as 'go on as written' (brief.tsx settle('')). Named titles, people and brands are unchanged and still get their question or the failure card. Step 3, why the model writes nothing: the prompt's recommendation 'reason' explains why we describe a NAME instead of using it; a look in plain words has no name, so the model often writes no recommendation at all. Left the prompt alone: the normaliser guarantees the outcome whatever the model does. Live-checked: 'road trip with friends' and 'golden hour, 90s film look' -> plain; 'make it Dhurandhar style' -> 1 question. No mobile change needed.
