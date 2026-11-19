---
id: JET-370
title: Special request 'road trip with friends' answers 'could not work out what to film'
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T13:11:35+05:30
updated: 2026-11-19T13:11:35+05:30
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

—

## Thread
2026-11-19T13:11:35+05:30 aquib N: created ticket, status: - -> open
