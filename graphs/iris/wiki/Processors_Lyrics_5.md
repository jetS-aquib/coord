# Processors Lyrics

> 17 nodes

## Key Concepts

- **CaptionGenerator** (14 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.run()** (9 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.generate()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.format_timestamp()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.validate_caption()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.wrap_text()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.clean_text()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.load_captions()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.print_preview()** (3 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **.__init__()** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Wrap long captions into multiple lines. Words are never split in the middle.…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Load already-processed captions. No timing modification happens here.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Validate one processed caption. Timing is preserved exactly unless the data is…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Generate SRT from processed captions.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Convert seconds into SRT timestamp format. Example: 12.345 -> 00:00:12,345** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Convert processed caption JSON into an SRT subtitle file. Input:…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`
- **Normalize whitespace while preserving Unicode.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (4 shared connections)
- [App Pipeline](App_Pipeline.md) (3 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/processors/lyrics/caption_generator.py`

## Audit Trail

- EXTRACTED: 33 (94%)
- INFERRED: 2 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*