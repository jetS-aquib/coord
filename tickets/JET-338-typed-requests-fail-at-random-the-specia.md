---
id: JET-338
title: Typed requests fail at random: the special-request and edit calls get cut-off JSON because thinking eats their token cap
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-17T18:19:28+05:30
updated: 2026-11-17T18:23:21+05:30
decisions: 
---

## Request

Make the special-request reader and the plain-words edit interpreter reliable. In the E2E run, 'Make it like DDLJ, the mustard field scene' failed twice (no card, went through as written) and 'Make it night with fireflies' failed once in the editor ('The editor could not read that just now').

## Understanding

Reproduced: understandSpecialRequestV1 returned 'Unterminated string in JSON' on both tries for the longer phrasing; the short 'Make it like DDLJ' worked. Both calls set maxOutputTokens (1024 / 4096) but no thinkingConfig, and on gemini-3.5-flash thinking tokens count against that cap, so the JSON is cut off. The four other JSON calls (script, safety, shot list, treatment) set a thinkingLevel and do not fail this way. Also seen: 'Dhurandhar style' comes back with reference '' (the name is not masked/kept). Assumption: a low thinking level is enough for both tasks.

## Plan

1. specialRequestV1 and editsV1: set thinkingConfig { thinkingLevel: low } (via flags.render.thinking like the others) and raise the caps.
2. editsV1: one retry on an unparsable answer, as specialRequestV1 already has.
3. Look at the empty reference for 'X style' phrasings in inRequestV1.
4. Test: the DDLJ mustard-field phrasing returns a card 5/5; 'make it night' returns a diff 5/5.

## Reason

Both are headline demo features; a random 'could not read that' or a silently skipped card makes them look broken.

## Related files

src/services/render/specialRequestV1.ts, src/services/render/editsV1.ts, src/config/flags.ts

## Acceptance criteria

Five runs each of the long DDLJ request and of 'Make it night with fireflies' all succeed; no 'Unterminated string' in logs.

## Test steps

1. On the Direction screen type "Make it like DDLJ, the mustard field scene where they run to each other in the train station climax" five times → the "Like … how?" card appears every time; nothing goes through as written.
2. Type "make it Dhurandhar style" → a card naming Dhurandhar (not an empty reference).
3. In the studio, pick 3 shots and type "Make it night with fireflies" five times → a dry run listing the shots every time, never "The editor could not read that just now".
4. Server log: no "Unterminated string" from [SpecialV1] or [EditV1].

## Thread
2026-11-17T18:19:28+05:30 aquib N: created ticket, status: - -> open
2026-11-17T18:23:21+05:30 aquib N: status: open -> approved
2026-11-17T19:01:13+05:30 aquib N: Live check against gemini after the fix: long DDLJ request 5/5 understood (named_title, question card); 'make it Dhurandhar style' 5/5 with a reference (1x 'Dhurandhar style', 4x 'Dhurandhar' — the model reads it as a person, likely because the film is newer than it knows; the question card still works); 'Make it night with fireflies' 5/5 three-shot diffs. Before: 2/2 and 1/1 failures. No API change, so nothing for mobile. Known leftover: on the long DDLJ phrasing the model copies the whole sentence as the reference, so the card reads 'Like DDLJ, the mustard field scene… how?' — cosmetic.
