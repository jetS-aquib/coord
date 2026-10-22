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

**Known gap (JET-196):** the preview is always rendered on a landscape canvas and
takes no orientation. Since a stitch can now produce a portrait master, a preview
shown next to a portrait job does not represent what that job will output. The
styles and fonts it reports are correct either way; only the rendered preview's
shape is wrong. Not fixed here — it needs a field on the preview request, which
needs a client to send it.
