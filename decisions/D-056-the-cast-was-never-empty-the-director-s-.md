---
id: D-056
title: The cast was never empty — the director's range sets the SIZE, and the storyboard's tags only set the ordinals
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-228
---

## Context

Supersedes D-052, which was built on a premise that is false and that one query would have caught. D-052 recorded that 'the cast is empty in practice' because resolveCastV1 opens with 'if (!tags.size) return []' and mobile sends no characterInfo. MEASURED IN MONGO, 36 stored plans and 43 projects: 33 of 36 plans carry a real cast of 2 to 4, every one of the last eight renders has 2 or 3 named members with full descriptions, 40 to 45 of 45 clips carry castTags, and 43 of 43 projects have @imageN in their storyboard prompts. The v0 storyboard generator writes those tags BY DEFAULT, not only when characterInfo is supplied, so the '(one unnamed subject)' branch has essentially never fired on a real project. What is true is the other half of the finding, and D-052 reached past it: casting is blind to the director. autoGenerateCast returns however many people it feels like, so Kabir — whose card says 'a single figure' and whose pitch promises one — has been rendering three. The contradiction between a director's own sentence and their video is real; the cause is not an empty cast.

## Options considered

1. Leave D-052 as built. Its clamp only fires when no tags are stated, which is 0 of 43 projects, so on every real render it does nothing at all and the directors still disagree with their own cards. 2. Apply the range only to newly minted casts and accept that existing projects keep their arbitrary cast size until the storyboard is retired. Costs nothing and fixes nothing anybody can see. 3. Let the director's range decide the SIZE whatever the storyboard stated, and let the stated tags decide only which ordinals are used. 4. Ask the storyboard generator for a specific number of people. It lives in videoService.ts, which is on the do-not-touch list.

## Decision

Option 3. The storyboard's tag count is noise and is treated as such: it was generated from a duration in seconds, before the song was read and before anyone chose a director, and it is not a statement of anybody's intent. So  is now OPTIONAL. A director that states a range clamps the cast to it whether or not tags were stated; a profile with no range — which is HOUSE_DIRECTOR_V1, and only it — takes exactly what the storyboard stated, which is today's behaviour unchanged. The user's own selectedCharacters still outrank both, because those ARE intent. Clamping down is safe on both render paths and that was checked rather than assumed: a shot-list render writes its lines against the cast it is handed, and substituteImageTagsV1 already degrades an unbacked @imageN to 'the subject' rather than letting it reach the model as literal text.

## Reason

The lesson this cost is the one already written down three times in this repo and it is worth stating again rather than filing quietly: MINE THE DATA BEFORE SPENDING. D-052's premise came from reading one line of code and following it to a conclusion, and 36 render plans sitting in Mongo said the opposite. The branch does exist and does return [] — it just never runs, because the thing that was assumed not to write @imageN tags writes them on every project.

Making the range optional rather than zero-valued is the part that keeps D-047 intact. A house profile of { min: 0, max: 0 } would have had to mean 'no opinion' while reading as 'cast nobody', and the first person to take it literally would have silently un-cast every pre-Batch-8 render. Absent means absent.

Why the director outranks the storyboard here at all, when D-046 says a director biases and never dictates: the thing being overridden is not the song and not the user. The song read still decides every cut and the brief still decides what the video is about. A generated tag count is neither, and deferring to it is deferring to the part of the pipeline Batch 7 exists to replace.

## Consequences

This is the change that makes the cast lever visible, and it changes what renders look like: Kabir now renders one person where he rendered three, Mira one or two, Dev two or three. That is the intended effect and it is also a real quality change that should be judged on a render rather than on this record. A render with no director is untouched and still takes the storyboard's count, so the baseline claim survives. The plate has fewer faces to hold for the two directors that narrow it, which should make it a better reference rather than a worse one. The measured numbers above are worth keeping for whoever reads this next: 105 sections across 36 renders, and separately 13 of those 105 are in the shot-ladder stub family D-054 fixes — which is 12 percent of sections, not the two-clips-in-forty it was described as.
