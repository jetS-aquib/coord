---
id: JET-233
title: Caption preview renders on a landscape canvas whatever the job is, so the style a user picks is not the style they get
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-01T02:35:14+05:30
updated: 2026-11-02T12:00:02+05:30
decisions: 
---

## Request

Let POST /api/v1/caption-preview take the output frame, the same one JET-232 adds to the stitch requests, and render the preview in that shape. An absent frame keeps today's landscape preview.

## Understanding

Your own contract already records this as a known gap: the preview is always rendered on a landscape canvas and takes no orientation, so a preview shown next to a portrait job does not represent what that job will output. We are about to make that visible rather than theoretical. We are building a caption style picker for the music video flow, every one of our 41 v1 render plans is 9:16, and the picker's whole job is to show someone what their lyrics will look like before a ~$25 render burns them in. A landscape preview of a portrait master puts the text at a size and a position neither of which is what ships. ASSUMPTIONS: (1) the styles and fonts the GETs report are correct in any shape and only the rendered preview is wrong — that is what your contract says, and we are relying on it; (2) this is the same frame vocabulary as JET-232, so a client holds one value and sends it to both; (3) the ~5 min cache and the 24-preview cap key on the request, so adding a field splits the cache by shape rather than breaking it. Tell us on the thread if the cache key is built by hand and needs the field adding explicitly.

## Plan

1. Add the optional output frame field to CaptionPreviewRequest, spelled the same way as on the stitch requests in JET-232.
2. Render the preview on that canvas, with the caption laid out against it the way the real burn will be.
3. Absent means today's landscape preview, unchanged.
4. Make sure the field is part of the preview cache key, so a portrait and a landscape preview of the same style are two entries and not one.
5. BACKWARD COMPATIBILITY IS THE CONSTRAINT. music-jetkreate-frontend calls this endpoint from a browser today and its CaptionPalette is a working, shipped picker. If the renderer cannot take a canvas size without changing the path that browser hits, do not change that path — copy the function or the file, change the copy, and route only requests naming a frame through it. A second code path is fine. A changed shared one is not.

## Reason

9.4 in the render pipeline delivery plan. It is only worth doing because 9.8 is landing — before a style picker existed in the music flow, nobody saw the preview next to a portrait job. Pairs with JET-232: the same field, the same vocabulary, filed separately because the stitch one blocks two batches and this one blocks one screen. Your contract names this gap already (recorded there against JET-196).

## Related files

yours: app/services/caption_preview.py (CaptionPreviewRequest, render_caption_preview, get_cached_caption_preview), app/api/v1/routes/lyrics_stitching.py, app/processors/lyrics/caption_style_renderer.py. ours: src/modules/video/video-api.service.ts (captionPreview), src/modules/video/video.controller.ts is on our do-not-touch list so the v1 caller is a new one. contracts: .coord/contracts/video-captions.md — yours to update, and its Known gap note can come out.

## Acceptance criteria

A preview requested as 9:16 comes back portrait with the caption positioned as it will be on the master. A preview requested with no frame comes back exactly as it does today, same bytes. The style and font GETs are unchanged. The browser picker in music-jetkreate-frontend keeps working untouched.

## Test steps

1. POST /api/v1/caption-preview with the body the web picker sends today, no frame field. Same ~4s landscape MP4 as before.
2. The same body naming 9:16. A portrait MP4, caption inside the frame and at the size it will burn at.
3. Request the same style twice in each shape. The X-Preview-Cache header reports MISS then HIT per shape — a portrait request does not serve the cached landscape one.
4. Open the existing CaptionPalette in music-jetkreate-frontend against the deployed service and step through the styles. Unchanged.

## Thread
2026-11-01T02:35:14+05:30 aquib N: created ticket, status: - -> open
2026-11-02T12:00:02+05:30 aquib N: status: open -> approved
