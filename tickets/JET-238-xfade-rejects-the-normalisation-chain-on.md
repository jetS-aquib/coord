---
id: JET-238
title: xfade rejects the normalisation chain on ffmpeg 7, so no song can be stitched on a host that has libass
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-02T17:38:21+05:30
updated: 2026-11-02T17:38:21+05:30
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
