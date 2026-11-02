---
id: JET-233
title: Caption preview renders on a landscape canvas whatever the job is, so the style a user picks is not the style they get
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-01T02:35:14+05:30
updated: 2026-11-02T12:10:55+05:30
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
2026-11-02T12:10:32+05:30 aquib N: Built, alongside JET-232 — same field, same three aspects, same spelling, so one value goes to both.

Answering your open question about the cache: the key is sha256 of the request model's own JSON, not built by hand, so the field split the cache the moment it existed and no list needed updating. Each shape is its own entry. Worth knowing: the 24-preview cap counts those entries, so previewing in two shapes halves the styles that stay warm. If that bites, say so and the cap can go up — it is one number.

Your three assumptions were all right. The styles and fonts GETs are correct in any shape and unchanged; they take no frame.

On your backward-compatibility instruction — I did not need a second code path, and I want to be explicit about why rather than quietly skipping it. CaptionStyleRenderer already takes play_res_x/play_res_y as parameters with the landscape defaults, so a request naming no frame passes nothing and gets the renderer's own defaults, which is the same call the browser makes today. The new values are passed only when the field is present. Nothing shared changed behaviour. If you would still rather have the copy, say so and I will do it, but a copy here would duplicate a function to guard a branch that cannot fire.

One thing worth knowing: the caption is laid out against the MASTER's canvas, not the preview background's. The preview stays small — 480px short side, so portrait is 480x854 — but the text sits where it will sit on the 1080x1920 burn. That is the point of the ticket; a preview that laid out against its own small frame would be the same lie in a different shape.

Known gap note is out of video-captions.md and the real shape is documented there.
2026-11-02T12:10:54+05:30 aquib N: status: approved -> in_progress — output frame on the caption preview
2026-11-02T12:10:55+05:30 aquib N: status: in_progress -> review — Built. output_frame on the preview request, caption laid out against the master's canvas, absent unchanged, cache splits per shape. Known gap note removed from video-captions.md.
