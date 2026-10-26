---
id: JET-202
title: Send clips to stitching in segments as they finish, instead of one call at the end
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-26T13:04:41+05:30
updated: 2026-10-26T13:50:17+05:30
decisions: D-022
---

## Request

Stitch each group of consecutive clips as it completes and passes its seam check, rather than holding every clip until the end. The final step joins the finished segments, which is a remux and costs almost nothing.

## Understanding

stitchPlanV1 collects every done clip and makes one call. That call is 59s on a 31-clip, 248s song (measured), and it starts only after anchors, clips and seam verification have all finished — by which time this service has been idle for about 4 minutes.

Nothing requires that. xfade needs both clips of a boundary, so it needs consecutive clips, but it does not need ALL of them. Clips 1-6 can be stitched while 7-12 are still being generated.

The join is the part worth getting right. Segments encoded with identical codec, resolution, fps and pixel format concatenate with -c copy — no re-encode, effectively free. The cost is the transition across a segment boundary, which xfade cannot do after the fact.

Assumptions, and the third is the one I most want corrected:
1. Clips complete roughly in order. They are fanned out 6 at a time, so a segment of 6 should close fairly promptly. If completion order is wildly out of order, segments stall and this buys nothing.
2. A clip's seam score must be final before its segment is stitched, or a re-render would invalidate an already-encoded segment. That means segments close only behind the verification, not behind generation — which is still well before the end.
3. Segment boundaries lose their crossfade unless something is done. Options: align segments to scene boundaries where a cut is natural; carry one clip of overlap into the next segment; or accept a hard cut at 4-5 points in the song. I do not know which is acceptable to you and would rather not guess — this is the decision the ticket really needs.

The endpoints do not exist yet; they are mine to build once the shape and the boundary question are settled.

## Plan

Mine to build:
1. A segment stitch endpoint taking an ordered group of clip URLs plus a segment index, returning a stored segment rendered to a fixed target.
2. A finalise endpoint taking the segment list in order, concatenating with -c copy, muxing the master audio, and burning captions if lyrics are on.
3. Both keep the current single-call endpoints working untouched, so nothing that uses them has to move.

Yours:
4. Track which clips are verified and group them into ordered segments.
5. Post each segment as it closes; post finalise when the last one does.
6. Fall back to the existing single call if any segment fails, so a bad segment costs a slower render and not a failed one.

## Reason

You asked whether clips can be batched to this service so it is not sitting idle while the model works. They can, and this is the shape. It is worth about 59s directly, which is the smallest of the wins I found — JET-199 and JET-200 are worth minutes each and should come first. Its real value is that it removes stitching from the critical path entirely, which matters more once the song gets longer.

## Related files

src/services/render/renderOrchestratorV1.ts (runPlanV1, stitchPlanV1), src/modules/video/video-api.service.ts

## Acceptance criteria

A song's stitching finishes within a few seconds of its last clip being verified, rather than ~59s after. The output is equivalent to today's single-call render except at the segment joins, in whatever way we agree those should behave. The existing single-call endpoints still work and the orchestrator can still fall back to them.

## Test steps

1. Render a song and confirm segment stitch calls appear in the service logs during clip generation, not after it.
2. Compare total time from last clip verified to final URL, before and after.
3. Play the result and watch each segment join specifically.
4. Force a segment to fail and confirm the render falls back to the single call and still completes.

## Thread
2026-10-26T13:04:41+05:30 aquib N: created ticket, status: - -> open
2026-10-26T13:07:15+05:30 aquib N: status: open -> approved
2026-10-26T13:18:57+05:30 aquib N: Taking your assumption 3 as the thing to settle, since you asked for it to be corrected rather than guessed at.

Align segments to scene boundaries. Every clip already carries sceneIndex (RenderPlanV1.deriveClipsV1), and a scene boundary is where the storyboard itself changes shot — a cut there is what a music video does anyway, and it is the one place in the song where a hard cut is not a defect. Carrying a clip of overlap into the next segment means re-encoding it twice and paying for the xfade twice; cutting at an arbitrary every-6 boundary puts a hard cut in the middle of a continuous shot, which is exactly the jump cut the whole seam check exists to prevent. Scene boundaries cost nothing and land the cuts where a viewer expects them.

One correction to assumption 1: clips do NOT reliably complete in order. They are fanned out 6 at a time through runCappedV1, which is a lane queue with no ordering guarantee, and a clip that is refused goes through salvageRefusedClipV1 (a second full generation) while its neighbours finish. A scene-aligned segment closes when every clip of its scenes is verified, so a slow clip stalls its own segment and nothing else — which is fine, but it means segment posting has to be driven by 'this group is complete' and not by 'six more have finished'.

Not starting my half: it is a third of the win of JET-199/200, both endpoints are yours and unbuilt, and the boundary question above is the human's to confirm, not mine to assume. Confirm scene-aligned and I will build the grouping against whatever contract you write.
2026-10-26T13:50:17+05:30 aquib N: linked decision D-022 (Segments are jobs of their own; the finalise call is the one that settles the attempt)
2026-10-26T13:51:26+05:30 aquib N: Scene-aligned confirmed and built. Both endpoints are in; the shape is .coord/contracts/video-segments.md, decision D-022.

POST /api/v1/segment-stitch { clips, segmentIndex, quality } -> a normal job. Rendered to the same frame a full stitch uses. Two clips minimum: a one-clip scene joins the scene next to it, which is still a scene boundary and costs neither of us any code.

POST /api/v1/segment-concat { segments: [job ids, in play order], audioUrl, showLyrics, caption fields } -> a normal job, and the one that produces the customer's video.

Job ids rather than URLs: you already hold them from polling, they do not expire, and I can check each one belongs to your workspace before I read it instead of handing out download URLs for a bucket that holds other people's renders.

Two things to know before you write the grouping:

1. A segment is NOT an attempt. There are several per render, so segment calls are not deduplicated against the attempt and report nothing to the creator API — a retry renders a second segment and you post whichever job id you hold. The finalise call is attempt-scoped, carries the measurement and settles, exactly as a stitch call does today. One attempt, one settlement, no billing change.

2. Every segment of one song must be in the same frame. They will be, unless ENABLE_PORTRAIT_OUTPUT changes mid-render. A mismatch fails the finalise rather than producing a master whose second half is the wrong shape — ffmpeg stream-copies that without complaining, which is why I check.

Your fallback works: if a segment fails, call clip-stitching-with-lyrics with all the clips as you do now. Those three endpoints are untouched.

One consequence I could not remove: a join keeps the crossfade overlap a single call would have spent, so the joined video runs about one transition longer per boundary and the final mux trims that off the end of the last clip. On a four-boundary song that is a second or two.
2026-10-26T14:00:08+05:30 aquib N: Built, scene-aligned, with the single call as the fallback.

segmentClipsV1 is pure and tested: groups consecutive clips by sceneIndex, never splits a scene across two segments, never emits a one-clip segment (a lone scene pairs with its neighbour, a lone trailing clip merges backwards), and always returns every clip in order. stitchInSegmentsV1 posts all segments in parallel, polls each, then posts segment-concat with the job ids in play order. Any failure anywhere falls back to clip-stitching-with-lyrics with the whole song — a bad segment costs render time, not the render.

ONE THING I HAD TO GUESS, and extra=forbid makes a wrong guess a 422. Your contract says everything after 'segments' is 'the lyrics stitch request you send today: same audioUrl, same caption fields, same defaults', and the example shows camelCase (audioUrl, showLyrics, captionStyle, captionFont) while the lyrics stitch itself takes snake_case (audio_url, lyrics_display). I am sending:

  { segments, audioUrl, showLyrics, language, lyricsDisplay, ...captionSettings }

language because the transcription contract says it must match the stitch call or Whisper runs twice, and the concat IS the stitch call now. lyricsDisplay because we send lyrics_display: 'english' today and dropping it would silently change the captions. If either name is wrong, or neither field exists on the concat model, tell me and it is a one-line fix — but it will not blow up a render in the meantime, it will just quietly fall back to the single call every time and we would lose the whole feature without noticing. A line in the contract naming the exact accepted fields would close it for good.

Deliberate narrowing, so it is on the record rather than discovered later: segments close AFTER verifySeamsV1 rather than as each one is verified, so they are all posted at once. That gets the parallel encodes and the free concat — most of the 59s — without touching the rendering or verifying loops. It does NOT get the overlap with generation you were really after. Interleaving means merging phases 2 and 3 so a segment closes the moment its own clips are scored, and it is worth maybe a further 15s on a 31-clip song. Marked in the code as the upgrade path, worth doing when songs get long enough that the longest segment stops being small.

Also noted your crossfade-overlap consequence — a second or two off the end of the last clip on a four-boundary song. Nothing on my side can shorten it and it is not worth a plan field.
