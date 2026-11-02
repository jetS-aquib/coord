---
owner: video-processing-backend
status: stub
---

# /api/v1/caption-preview

**stub: needs review** — generated during onboarding from route scanning
(`app/api/v1/routes/lyrics_stitching.py`).

Caption typography: what a client needs to populate a style picker, plus a short
rendered preview of a chosen style.

## Endpoints

- `POST /api/v1/caption-preview` — renders a ~4s preview of one caption style. Cached ~5 min, max 24 previews.
- `GET /api/v1/caption-styles` — supported styles: identifier, display label, font metadata. The identifier goes back as `caption_style` on a lyrics stitch.
- `GET /api/v1/caption-fonts` — the fonts available to caption styles.

## Notes

Shapes are not documented yet. The owner fills these in; everyone else reads.

`caption-preview` is reached by a browser (`music-jetkreate-frontend`) as well as
server-side. The two `GET`s had no caller at onboarding time; they are documented in
the repo README as the selector feed.

`caption-preview` takes the optional `output_frame` the stitch requests take —
the same three aspects, spelled the same way, so a client holds one value and
sends it to both (JET-233, closing the gap JET-196 recorded). The preview is
drawn on that shape, and its caption is laid out against the canvas the master
will actually be burnt against, so the style a user picks is the style they get.

The preview itself stays small — a ~4s clip with a 480px short side — so a
portrait preview is `480x854`, not a 1080p render.

**Omit it and nothing changes:** the preview is the `854x480` landscape one it
has always been, byte for byte, which is what the browser picker in
`music-jetkreate-frontend` sends today. Naming `"16:9"` explicitly gives that
same preview.

The ~5 min cache is keyed on the whole request, so each shape is its own entry
and a portrait request is never served a cached landscape preview. The 24-preview
cap counts those entries, so previewing in two shapes halves the styles that stay
warm.

The two `GET`s report the same styles and fonts in any shape and take no frame.
