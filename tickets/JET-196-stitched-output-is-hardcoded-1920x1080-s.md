---
id: JET-196
title: Stitched output is hardcoded 1920x1080, so portrait clips come back pillarboxed
from: music-jetkreate-mobile
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-10-22T13:35:21+05:30
updated: 2026-10-22T13:40:05+05:30
decisions: 
---

## Request

Let the stitch output match the source clips' orientation. Either derive the target resolution from the input clips, or accept an explicit target (resolution / orientation / aspect ratio) on the clip-stitching-with-audio and clip-stitching-with-lyrics requests. A set of 720x1280 portrait clips should produce a portrait master, not a portrait image pillarboxed inside a landscape frame.

## Understanding

app/pipeline/stitch_pipeline.py around line 355 picks the render target:

    if self.workflow == WorkflowType.CLIP_STITCHING:
        target_width, target_height, target_fps = 1280, 720, 24
    else:
        target_width, target_height, target_fps = 1920, 1080, 30

CLIP_STITCHING_AUDIO (our path) and CLIP_STITCHING_LYRICS both fall into the else, so they are always landscape 1920x1080. The docstring says the fixed values are a product requirement, which I read as a decision made for a landscape product before a portrait client existed — so I am reporting a gap, not a bug you left behind.

Assumptions, which I would rather have corrected than guessed:
1. AudioStitchingRequest currently carries only audio_url on top of BaseJobRequest — no resolution, orientation or aspect field — so no client can ask for portrait today. Checked app/schemas/jobs.py.
2. Deriving the target from the first clip (or the modal size across clips) is probably better than a new parameter, since it cannot disagree with the material. But it is your call, and a parameter may be safer if mixed-orientation inputs are a real case.
3. Mixed-orientation input sets need a defined rule. I have no opinion on which; I just need it not to silently pick landscape.
4. I am NOT asking to change CLIP_STITCHING (API #1), only the audio and lyrics workflows.
5. Caption rendering is anchored to a 1920-wide reference canvas (caption_kinetic.py _REF_WIDTH, caption_style_renderer play_res_x/y). If the canvas can become portrait, captions likely need to scale with it — that is inside this change, not a follow-up.

music-jetkreate-backend needs no change if you derive from the clips; it would need a small one to pass a parameter through.

## Plan

1. Decide: derive the target from the source clips, or accept it on the request. Define the rule for mixed-orientation inputs either way.
2. Replace the hardcoded else-branch in stitch_pipeline.py for CLIP_STITCHING_AUDIO and CLIP_STITCHING_LYRICS.
3. Make the caption canvas follow the target rather than assuming 1920x1080.
4. If it becomes a request field, thread it through music-jetkreate-backend (video-api.service.ts, synthesis.service.ts) from the aspectRatio the client already sends.
5. Update the owned contracts: video-stitching.md, video-captions.md.
6. Decision record, since this changes a contract and affects both clients.

## Reason

Measured on a real completed project today. Source clips are 720x1280 portrait, as requested — mobile sends aspectRatio 9:16 and Veo honours it. The finished file is 1920x1080 landscape, so every clip is scaled down and pillarboxed with black bars either side, and roughly half the frame is wasted. On a phone this is severe: the player then fits that landscape frame into a portrait screen, and the video renders as a small rectangle in the middle of a black screen. The whole mobile product is portrait-first, so today it cannot produce a correct master at all.

## Related files

app/pipeline/stitch_pipeline.py, app/schemas/jobs.py, app/processors/ffmpeg/ffmpeg_engine.py, app/processors/ffmpeg/builders/video_filter_builder.py, app/processors/lyrics/caption_kinetic.py, app/processors/lyrics/caption_style_renderer.py, .coord/contracts/video-stitching.md, .coord/contracts/video-captions.md

## Acceptance criteria

Stitching a set of 720x1280 portrait clips with audio produces a portrait master (e.g. 1080x1920) with no pillarboxing. A set of landscape clips still produces 1920x1080 exactly as today. Captions stay correctly positioned and sized in both. ffprobe on the output reports the expected dimensions.

## Test steps

1. Submit clip-stitching-with-audio with portrait 720x1280 clips.
2. ffprobe the output: expect portrait (e.g. 1080x1920), not 1920x1080.
3. Play it — no black bars left and right, the frame fills.
4. Repeat with landscape clips: still 1920x1080, unchanged.
5. Repeat step 1 via clip-stitching-with-lyrics and confirm captions sit correctly on the portrait canvas.

## Thread
2026-10-22T13:35:21+05:30 aquib N: created ticket, status: - -> open
2026-10-22T13:40:05+05:30 aquib N: status: open -> approved
