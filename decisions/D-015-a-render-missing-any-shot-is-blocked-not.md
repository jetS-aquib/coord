---
id: D-015
title: A render missing any shot is blocked, not stitched; prompts are checked before any still is drawn
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-198
---

## Context

First live v1 render, 2026-10-23. 20 of 31 clips came back 400 'Input blocked: we cannot create videos with real people's names or likenesses'. The 11 that rendered were stitched anyway and the output holds a frozen frame for minutes against a full-length track. THE MEASUREMENT THAT SETTLED THE CAUSE: the refusal fallback re-asked each clip with a prompt containing no names at all, and was refused with the identical message 20 times out of 20. Two calls, one carrying the original wording and one not, same refusal. The only thing they shared was the two anchor stills, so the refusal is image-side. But the anchors are generated FROM the storyboard prompts, so the likeness reached the images through the text.

## Options considered

Filter prompts at render time only; stitch whatever rendered and let the client decide; retry refusals with backoff; or check prompts before any still is drawn and refuse to assemble an incomplete song.

## Decision

Scene prompts are checked and rewritten at plan time, before anchoring, by one text-model call over the whole storyboard, touching only provider-refusal causes and never mood, camera or structure. A render finishing with ANY shot missing ends as blocked and is NOT stitched. Re-rendering a clip accepts a replacement prompt. The refusal fallback now drops the anchor stills and keeps the text.

## Reason

The prompt is the root cause and the only point where it can be fixed: cleaning the text before any still is drawn prevents both the bad stills and the refusals; cleaning it afterwards prevents neither. A song with holes is not a shorter song — stitching it produces a file that looks finished, which is worse than failing. Refusals are deterministic: the first run spent 40 calls proving that.

## Consequences

What was rewritten comes back as warnings and must be shown; a storyboard silently rewritten on someone's behalf is worse than the refusal it prevented. A rewrite dropping more than 60 percent of a prompt is discarded. If the check itself fails the render proceeds unchanged, since a safety pass that can block a render is worse than the refusals it prevents. blocked is terminal for the workers but not 'finished': the project lookup still returns it and a new render on that project is refused, so a second render cannot quietly abandon the first one's spend. Three ways out: re-render the missing shots with edited prompts, assemble it as it is, or cancel.
