---
id: JET-273
title: Ask, don't guess: understand the special request and return guided questions plus a filmable recommendation
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:23:56+05:30
updated: 2026-11-09T23:31:12+05:30
decisions: D-077
---

## Request

Classify the optional special request into { kind: named_title|genre|era|aesthetic|person|brand|plain, reference, wants: title_itself|genre|look|unsure }. When wants is unsure, return needs: [{ key, question, options[], recommended }] (e.g. 'Like Dhurandhar how?' [look and colour, action and pace, spy-thriller genre, all of it]). Once clear, return a recommendation: the reference described as filmable ingredients (palette, setting, pacing, wardrobe, camera feel) with no names, plus a one-line plain reason ('video models cannot copy a named film'). Brief and treatment may also return needs[] for other ambiguity (cast conflicts with the chosen cast size, unclear language). Nothing is charged while needs are open; hold at the review gate when it is a render.

## Understanding

Today every LLM failure falls back silently and sanitizePromptsV1 rewrites named films/people without telling anyone. The owner wants the system to notice when it is unsure, tell the user plainly, and offer guided options with a recommendation they can accept, edit or skip. ASSUMPTIONS: (a) one text call does classification + recommendation; (b) needs are answered by option id or edited text and resent; (c) only the accepted ingredients, never the name, reach any prompt; (d) sanitizePromptsV1 stays as backstop and its warnings are reported (narration request).

## Plan

1. classifySpecialRequestV1 (one call, JSON schema).
2. needs[] + recommendation on the brief response; an endpoint to answer needs.
3. Treatment may emit needs; render holds at review.
4. Accepted ingredients stored on the project, used by the baked direction (JET-272).
5. Contract update.

## Reason

Accuracy and trust: the user learns early, in plain words, why a reference cannot be used as-is and gets a version that works.

## Related files

src/services/render/briefV1.ts, treatmentV1.ts, promptSafetyV1.ts, renderOrchestratorV1.ts, routes, contract

## Acceptance criteria

'make it Dhurandhar style' returns needs with 4 options; answering 'look and colour' returns ingredients without the name; the render prompts contain the ingredients and not the title.

## Test steps

—

## Thread
2026-11-09T03:23:56+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
2026-11-09T23:31:12+05:30 aquib N: status: open -> approved
2026-11-10T00:18:41+05:30 aquib N: Mobile half built (uncommitted): a written 'Anything special?' is read on Continue via special/understand, once per wording. Plain or understood:false or a network error: goes straight on with the request as written. needs: inline card with the one question, recommended option preselected, plus 'Or say it in your words' (<=200), then calls again with answer. recommendation: shows the reason and 'What we aim for' with Use this / Edit (<=600) / Keep my words. Accepted text is saved as direction.ingredients, and only while the special text is unchanged since the check.
