---
id: JET-217
title: A brief with every field left blank cannot start a render — the storyboard call 400s
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-10-29T13:20:54+05:30
updated: 2026-10-29T13:20:54+05:30
decisions: 
---

## Request

In createStoryboard only, send the title when the four answers are all blank: prompt: input.prompt || input.title || 'a music video for this song'. Keep directionPrompt itself empty on POST /api/music-videos — the treatment is supposed to know that nothing was said. One line, in src/lib/generation.ts.

## Understanding

JET-216 shipped and the wiring is correct — I traced it: buildDirection() labels and joins the non-blank answers, working/[id].tsx passes it as prompt, and generation.ts sends it as directionPrompt. Our side reads it in the treatment, the shot list and the cast, and all three handle an empty string deliberately. So four partly-filled answers work exactly as intended.

The all-blank case does not, and the screen promises it will — it says 'Anything you leave blank, the song decides'.

WHERE IT BREAKS, and it is before any of the new code runs:
  buildDirection({}) returns '' (every key is filtered out)
  -> createStoryboard posts /api/video/music-storyboard with prompt: ''
  -> video.controller.ts:524  if (!audioUrl || !prompt) return 400 'audioUrl and prompt are required'
  -> withRetry retries, fails, and the user sees 'The storyboard came back empty. Try a different direction.'
A user who trusts the hint and leaves all four blank gets an error telling them to change a direction they deliberately did not give.

WHY WE ARE ASKING YOU RATHER THAN FIXING IT HERE. The check is in video.controller.ts, which is on the v1 do-not-touch list — several devs push to it and the web path depends on it. We are not relaxing that validation without a conversation. If you would rather we did it on our side, say so on this ticket and we will ask whoever owns that file; the other option is a v1 storyboard route of our own, which is more than this is worth today.

ASSUMPTIONS:
 - The title is always present — your own screen defaults it to 'Untitled' — so there is always something to send.
 - Sending the title to the STORYBOARD while leaving directionPrompt empty is what we want. The storyboard's job in a v1 render is now mostly to supply @imageN tags and a fallback prompt; the real direction comes from the treatment, which reads the song, the lyrics, the title and the style and is written to handle 'nothing was said'. Putting a stand-in phrase into directionPrompt would make the treatment think the artist asked for something they did not.
 - You may already be defaulting this and we read the code wrong. If so, close it.

## Plan

1. File this and carry on; everything else in Batch 7 works with a partly-filled brief.
2. Not working around it here. The clean version of this is 7.10 — the brief's questions, defaults and examples derived from the song read — which also means a 'blank' brief stops being blank, because the defaults are real answers. That is ours and it is next.
3. Re-check the all-blank path when 7.10 lands; it may make this moot.

## Reason

The four-input screen is specifically there so somebody who does not know what to write can still get a video, and today the one person it was built for is the one person it fails. It is also a one-line fix on your side against a conversation about a shared file on ours.

## Related files

mobile: src/lib/generation.ts (createStoryboard). For context: music-jetkreate-backend src/modules/video/video.controller.ts:524 (do-not-touch), src/services/render/treatmentV1.ts

## Acceptance criteria

Opening the Direction screen, typing nothing in any of the four fields and the note, and pressing Start filming produces a render rather than an error. The resulting plan comes back with shotSource 'shot-list' and a logline that reflects the song rather than a stand-in phrase. A brief with one field filled behaves exactly as it does today.

## Test steps

—

## Thread
2026-10-29T13:20:54+05:30 aquib N: created ticket, status: - -> open
