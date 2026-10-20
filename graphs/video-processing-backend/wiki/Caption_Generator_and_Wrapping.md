# Caption Generator and Wrapping

> 19 nodes

## Key Concepts

- **CaptionGenerator** (17 connections) — `app/processors/lyrics/caption_generator.py`
- **.run()** (9 connections) — `app/processors/lyrics/caption_generator.py`
- **.generate()** (6 connections) — `app/processors/lyrics/caption_generator.py`
- **.format_timestamp()** (5 connections) — `app/processors/lyrics/caption_generator.py`
- **.validate_caption()** (5 connections) — `app/processors/lyrics/caption_generator.py`
- **.wrap_text()** (5 connections) — `app/processors/lyrics/caption_generator.py`
- **.clean_text()** (4 connections) — `app/processors/lyrics/caption_generator.py`
- **.load_captions()** (4 connections) — `app/processors/lyrics/caption_generator.py`
- **._log_timing()** (3 connections) — `app/processors/lyrics/caption_generator.py`
- **.print_preview()** (3 connections) — `app/processors/lyrics/caption_generator.py`
- **.__init__()** (2 connections) — `app/processors/lyrics/caption_generator.py`
- **TimingCallback** (1 connections)
- **Wrap long captions into multiple lines. Words are never split in the middle.…** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Load already-processed captions. No timing modification happens here.** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Validate one processed caption. Timing is preserved exactly unless the data is…** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Generate SRT from processed captions.** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Convert seconds into SRT timestamp format. Example: 12.345 -> 00:00:12,345** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Convert processed caption JSON into an SRT subtitle file. Input:…** (1 connections) — `app/processors/lyrics/caption_generator.py`
- **Normalize whitespace while preserving Unicode.** (1 connections) — `app/processors/lyrics/caption_generator.py`

## Relationships

- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (3 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (3 shared connections)
- [Caption Text Processing](Caption_Text_Processing.md) (1 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (1 shared connections)
- [Devanagari Transliteration](Devanagari_Transliteration.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/caption_generator.py`

## Audit Trail

- EXTRACTED: 38 (95%)
- INFERRED: 2 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*