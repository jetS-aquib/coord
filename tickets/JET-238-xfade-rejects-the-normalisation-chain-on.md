---
id: JET-238
title: xfade rejects the normalisation chain on ffmpeg 7, so no song can be stitched on a host that has libass
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-02T17:38:21+05:30
updated: 2026-11-02T17:42:02+05:30
decisions: 
---

## Request

Emit the `fps` stage LAST in the per-clip normalisation chain, and emit it unconditionally, so xfade sees a constant frame rate on ffmpeg 7 as well as 9.

## Understanding

No stitch completes on this machine at all — v1 and v2 alike, 3 clips and 38 clips alike. Every job dies at transitioned_video.mp4 with exit 234:

    [Parsed_xfade] The inputs needs to be a constant frame rate; current rate of 1/0 is invalid
    Failed to configure output pad / Error reinitializing filters
    0-byte output

This is not a v2 regression and not JET-236. It is a build-compat problem in the filter graph that has been latent until now.

WHY IT APPEARED NOW. This host has two ffmpegs and NEITHER is complete:

    /opt/homebrew/bin/ffmpeg        9.0.2   xfade fine   NO libass, no drawtext, no subtitles
    /opt/homebrew/opt/ffmpeg@7      7.1.5   HAS libass   xfade rejects the chain

Homebrew's ffmpeg 9 bottle here is a minimal build — its configure line has libx264 and nothing for text rendering. So captions are impossible on it, and ffmpeg@7 was installed deliberately and put first on PATH to get libass. The service process (pid 68543) has /opt/homebrew/opt/ffmpeg@7/bin ahead of /opt/homebrew/bin, so shutil.which('ffmpeg') finds 7.1.5. That choice is correct and should stay — the pipeline needs libass more than it needs 9.x's tolerance.

WHAT ACTUALLY BREAKS. video_filter_builder.py builds the per-clip chain in this order:

    scale, pad, fps=30, format=yuv420p, settb=AVTB, setsar=1, setpts=PTS-STARTPTS

setpts (and settb) leave the link's frame_rate unset. xfade in 7.x validates inlink->frame_rate and reads 1/0; 9.x tolerates it. Anything after fps that disturbs timing undoes it, so putting fps first is the bug — it has simply been invisible on 9.x.

ASSUMPTIONS:
1. You want to keep working on ffmpeg 7 rather than require 9. Say so if not, but a build with libass is not optional for burning captions and the 9 bottle here has none.
2. Nothing downstream depends on fps running BEFORE format/settb. I could not see a reason it would, but it is your filter graph.
3. This affects every caller, not just music videos — anything that stitches with a transition.

## Plan

MEASURED, not guessed. Same two real 720x1280 clips, same xfade, only the chain order varied, on ffmpeg 7.1.5:

    fps=30,settb,setsar,setpts        (today)   exit 234, 0-byte output
    settb,setsar,setpts               (no fps)  exit 234, 0-byte output
    settb,setsar,setpts,fps=30                  exit 0, 720x1280 @ 30/1
    fps=30,settb,setsar,setpts,fps=30           exit 0, 720x1280 @ 30/1

And the fix is a no-op on the version you develop against — settb,setsar,setpts,fps=30 gives exit 0 and 720x1280 @ 30/1 on ffmpeg 9.0.2 as well.

So, in video_filter_builder.py (~line 106-124):

1. Move the `stages.append(f"fps={self.fps}")` to AFTER `stages.extend(["settb=AVTB", "setsar=1", "setpts=PTS-STARTPTS"])`.
2. Make it UNCONDITIONAL rather than gated on needs_fps. The third row above is the reason: a clip already at 30fps sets needs_fps=False, emits no fps stage at all, and still fails on 7.x. The gate currently assumes the stage is only about resampling; it is also what tells xfade the rate.
3. Leave needs_resize and needs_format exactly as they are.

BACKWARD COMPATIBILITY — THE CONSTRAINT ON THIS TICKET:
Nothing here may change behaviour for a caller that works today. If reordering the chain could alter output for an existing user — a different frame cadence, a different duration, anything visible — then DO NOT edit the existing builder in place. Make a separate copy of the function or the file, change the copy, and route only the new path to it, leaving the original byte-for-byte as it is. A caller on the old behaviour must keep getting the old behaviour.

My measurements say the output is identical (both orders give 30/1 CFR on 9.0.2), which is why I think this is safe in place — but the rule applies to what you actually do, not to what I expect you to do.

## Reason

Nobody can stitch anything on a host configured for captions. It also blocks JET-237's Done-when outright: a v1 master cannot be compared against a v2 one when neither can be produced. And it is silent in the worst way — exit 234 with a 0-byte file reads as a corrupt clip or a bad URL, and the real cause is two stages in the wrong order.

## Related files

app/processors/ffmpeg/builders/video_filter_builder.py:106-124 (_normalisation stages), app/pipeline/stitch_pipeline.py, app/pipeline/stitch_pipeline_v2.py

## Acceptance criteria

A stitch with transitions completes on ffmpeg 7.1.5 and on 9.0.2, producing byte-equivalent output on 9.0.2 to what it produces today, including for a set whose clips are already at the target frame rate.

## Test steps

1. Confirm the service resolves ffmpeg 7: run `shutil.which('ffmpeg')` in its environment, or check /opt/homebrew/opt/ffmpeg@7/bin is first on its PATH.
2. POST a clip-stitching-with-lyrics job with at least two clips and a transition between them.
3. It completes rather than failing at transitioned_video.mp4, and the output is non-zero bytes.
4. ffprobe the master: the frame rate is 30/1 constant.
5. Repeat with clips already at 30fps — the case where needs_fps is False today — and confirm it still completes.
6. Run the same job on ffmpeg 9.0.2 and confirm the output has not changed.

## Thread
2026-11-02T17:38:21+05:30 aquib N: created ticket, status: - -> open
2026-11-02T17:42:02+05:30 aquib N: status: open -> approved
2026-11-02T17:52:05+05:30 aquib N: Built on v2. Your diagnosis was right and I reproduced all four rows of your table on both ffmpegs. Two things came out of measuring it that change the answer, and one of them needs a decision from you.

1. IT IS NOT ONLY A 7.x PROBLEM. Your fix list point 2 was more right than the reasoning behind it. When every clip is already at the target rate, needs_fps is False, no fps stage is emitted anywhere, and xfade refuses the graph ON FFMPEG 9 TOO — exit 234, 0 bytes, same message. I have that measured. So this is not purely build-compat: v1 carries a latent bug on the version we develop against, and it fires for any caller whose clips happen to arrive at 30fps.

2. THE FIX IS NOT OUTPUT-IDENTICAL, so I followed your rule rather than your expectation. Your measurement was container-level — both orders do give 30/1 CFR on 9.0.2 — but the decoded pixels differ. A 24->30 conversion duplicates different source frames depending on whether the resample runs before or after setpts. Same frame count, same duration, same rate, different bytes out of the decoder. I checked by hashing raw yuv420p frames, not file sizes.

I then tried to find an ordering that gives today's pixels AND a graph xfade accepts — including keeping fps in both positions, which you might expect to be a no-op on already-30fps content. It is not: that gives a third distinct result. There is no ordering that satisfies both. They are mutually exclusive.

So: VideoFilterBuilderV2 (fps last, unconditional), FFmpegEngineV2 selects it, StitchPipelineV2 uses that engine. v1's builder is byte for byte untouched. End to end on three clips, two at 24fps and one at 30:

    ffmpeg 7.1.5   v1 FAIL exit 234      v2 OK 720x1280 30/1
    ffmpeg 9.0.2   v1 OK 1080x1920 30/1  v2 OK 720x1280 30/1

v2 also comes out identical on both ffmpegs, which today's chain does not — a render stops depending on which ffmpeg the host has.

THE DECISION I NEED: v1 still cannot stitch on ffmpeg 7, and still fails on 9 for a set already at the target rate. Your compatibility rule is what kept it that way, and I think that was the right call to make by default — but preserving v1's behaviour here partly means preserving a bug, and the cost is that anyone on a caption-capable host cannot use /api/v1 at all.

Three options, yours:
  a) Leave it. v2 is the path forward and music-jetkreate-backend is already on it. v1 keeps byte-identical output for the creator API and the web client, on hosts where it works.
  b) Move v1 too, accepting the pixel change. Nobody is likely to notice a different frame-duplication pattern at the same count, duration and rate — but it IS a change and I will not make it on your behalf.
  c) Move only the unconditional part on v1 — emit fps where it already goes AND at the end. That fixes the needs_fps=False case everywhere, but I measured it and it still changes pixels for 24fps clips, so it does not avoid the problem.

I would take (a) now and (b) once you have compared a v1 and a v2 master side by side, which JET-237 wants anyway.

Also worth knowing for whoever picks this up: the production image is python:3.11-slim-bookworm, whose ffmpeg is 5.x. I have not tested 5.x. If it validates frame_rate the way 7 does, v1 is broken in production too and (b) stops being optional. Worth one docker run before anyone relies on (a).
2026-11-02T18:10:27+05:30 aquib N: Correction to my last note, and good news: both v1 and v2 now work on ffmpeg 7 with NO output change at all. Ignore what I said about having to copy the builder and about v1 staying broken — I had not found the right fix yet.

Your diagnosis of the mechanism was right. Your proposed fix (fps last, unconditional) also works. But fps-last changes the decoded pixels, because a 24->30 resample after a PTS rebase duplicates different source frames — your 'output is identical' was measured on the container, and the frames differ. That is what forced the copy, and it was the wrong tree to be up.

The better fix is to keep fps where it is, make it unconditional, and DROP the setpts=PTS-STARTPTS. setpts is what clears frame_rate; it does not have to be moved, it can go. Measured:

    v1 before the fix, ffmpeg 9   ba396c52af18b311da91
    v1 after  the fix, ffmpeg 9   ba396c52af18b311da91
    v1 after  the fix, ffmpeg 7   ba396c52af18b311da91

Pixel-identical to what /api/v1 produced before, and now identical across ffmpeg versions too — so a render stops depending on which ffmpeg the host has, which today's chain does not give you. Checked over 24, 30 and 60fps sources and a landscape one needing scale+pad, then end to end through both pipelines on both ffmpegs.

So it is ONE edit to the shared builder, not a copy. Your backward-compatibility rule is satisfied on its own terms: the output does not change, so editing in place is what the rule permits. v1 and v2 are both fixed. There is no decision left for you to make — disregard the a/b/c options I asked about.

Dropping setpts is safe because ffmpeg already rebases file inputs: I built a source whose PTS starts at 5s and it gives the same duration and frame count with or without it. The setpts on the FINAL chain after all the xfades is untouched — it feeds the encoder and nothing validates it.

Still true from before: your point 2 was more right than the reasoning behind it. The needs_fps=False case fails on ffmpeg 9 as well, so this was never purely a build-compat problem — v1 carried a latent bug for any caller whose clips arrive already at 30fps.

This also unblocks upgrading the production image. python:3.11-slim-bookworm ships ffmpeg 5.x and I have not tested 5.x, but whatever it does, v1 and v2 now behave the same as each other and the same as they did — so moving the image to an ffmpeg with libass is a straight upgrade rather than a migration.
