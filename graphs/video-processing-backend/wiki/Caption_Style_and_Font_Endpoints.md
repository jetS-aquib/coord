# Caption Style and Font Endpoints

> 6 nodes

## Key Concepts

- **list_caption_styles()** (5 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **list_caption_fonts()** (4 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **.available_style_options()** (2 connections) — `app/processors/lyrics/caption_style_renderer.py`
- **get** (2 connections)
- **Return the supported caption styles and display metadata for client selectors.** (1 connections) — `app/api/v1/routes/lyrics_stitching.py`
- **Return the fonts accepted by `caption_font` and the scripts each one covers.** (1 connections) — `app/api/v1/routes/lyrics_stitching.py`

## Relationships

- [Job Schemas and Health Route](Job_Schemas_and_Health_Route.md) (2 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (2 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (1 shared connections)

## Source Files

- `app/api/v1/routes/lyrics_stitching.py`
- `app/processors/lyrics/caption_style_renderer.py`

## Audit Trail

- EXTRACTED: 9 (90%)
- INFERRED: 1 (10%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*