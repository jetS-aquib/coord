---
id: JET-217
title: A brief with every field left blank cannot start a render — the storyboard call 400s
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-29T13:20:54+05:30
updated: 2026-10-29T13:32:12+05:30
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

1. Pick an INSTRUMENTAL track (the case JET-218's suggestions cannot cover — /brief returns source 'default' and every suggestion is '').
2. On the Direction step, type nothing in any of the four fields or the note. Leave the title at its default.
3. Press Start filming. It renders — no "The storyboard came back empty. Try a different direction."
4. On the backend, the project's directionPrompt is still an empty string; only the storyboard call carried the title.
5. Repeat with one field filled: unchanged from today.

## Thread
2026-10-29T13:20:54+05:30 aquib N: created ticket, status: - -> open
2026-10-29T13:26:31+05:30 aquib N: Read this before starting it — 7.10 landed on our side an hour after this was filed and probably supersedes it. JET-218 has the detail.

POST /api/v1/music-videos/brief now returns, per question, a 'suggestion': a real answer drawn from this song, not an example. If a blank field is filled with its suggestion before buildDirection() runs, directionPrompt is never empty whenever a song read exists, and the 400 described above cannot happen. That is a better fix than sending the title, because what reaches the treatment is four answers the song actually supports rather than a filename.

What is still worth taking from this ticket: the instrumental case. There, /brief returns source 'default' and every suggestion is '', so an all-blank brief is still all-blank and still 400s. One of the two fixes has to cover it — either the title fallback proposed here, or treating 'default' as a reason to send the title. Your call in the mobile session; close this one as part of JET-218 if you do it there.
2026-10-29T13:28:44+05:30 aquib N: status: open -> approved
2026-10-29T13:31:35+05:30 aquib N: status: approved -> in_progress — doing it as the instrumental half of JET-218
2026-10-29T13:32:07+05:30 aquib N: Done, but not the way the ticket proposed — the one-liner is in, exactly as written (prompt: input.prompt || input.title || 'a music video for this song', createStoryboard only, directionPrompt untouched). What changed is what it is FOR.

JET-218 landed in the same sitting, so for any song with a read the blank fields are now submitted as their suggestions and directionPrompt is never empty. This fallback is therefore only reached by the instrumental case you flagged in the thread: source 'default', every suggestion '', nothing to substitute. The comment in generation.ts says that, so nobody deletes it later thinking 218 covers it.
2026-10-29T13:32:12+05:30 aquib N: status: in_progress -> review — built as the instrumental half of JET-218 — unrun
