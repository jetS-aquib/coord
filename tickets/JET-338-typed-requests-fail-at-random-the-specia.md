---
id: JET-338
title: Typed requests fail at random: the special-request and edit calls get cut-off JSON because thinking eats their token cap
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-17T18:19:28+05:30
updated: 2026-11-17T18:19:28+05:30
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

—

## Thread
2026-11-17T18:19:28+05:30 aquib N: created ticket, status: - -> open
