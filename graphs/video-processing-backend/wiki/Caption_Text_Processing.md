# Caption Text Processing

> 65 nodes

## Key Concepts

- **CaptionProcessor** (27 connections) — `app/processors/lyrics/caption_processor.py`
- **LyricExtractor** (26 connections) — `app/processors/lyrics/lyric_extractor.py`
- **test_whisper_chunk_length.py** (16 connections) — `tests/test_whisper_chunk_length.py`
- **.run()** (13 connections) — `app/processors/lyrics/caption_processor.py`
- **.run()** (13 connections) — `app/processors/lyrics/lyric_extractor.py`
- **test_caption_grouping_preserves_separate_word_data()** (8 connections) — `tests/test_lyric_processing.py`
- **.build_captions()** (7 connections) — `app/processors/lyrics/caption_processor.py`
- **.clean_text()** (7 connections) — `app/processors/lyrics/caption_processor.py`
- **.caption_text()** (6 connections) — `app/processors/lyrics/caption_processor.py`
- **.collect_words()** (6 connections) — `app/processors/lyrics/caption_processor.py`
- **.display_text()** (6 connections) — `app/processors/lyrics/caption_processor.py`
- **.make_caption()** (6 connections) — `app/processors/lyrics/caption_processor.py`
- **test_extractor_passes_chunk_length_and_keeps_repeated_words()** (6 connections) — `tests/test_whisper_chunk_length.py`
- **.build_from_segments()** (5 connections) — `app/processors/lyrics/caption_processor.py`
- **.merge_short_captions()** (5 connections) — `app/processors/lyrics/caption_processor.py`
- **.preprocess_audio()** (5 connections) — `app/processors/lyrics/lyric_extractor.py`
- **.split_timestamped_text()** (5 connections) — `app/processors/lyrics/lyric_extractor.py`
- **test_singer_change_keeps_zero_duration_words_for_caption_repair()** (5 connections) — `tests/test_whisper_chunk_length.py`
- **.repair_words()** (4 connections) — `app/processors/lyrics/caption_processor.py`
- **.romanize_text()** (4 connections) — `app/processors/lyrics/caption_processor.py`
- **.should_split()** (4 connections) — `app/processors/lyrics/caption_processor.py`
- **._extract_vocals_with_demucs()** (4 connections) — `app/processors/lyrics/lyric_extractor.py`
- **.__init__()** (4 connections) — `app/processors/lyrics/lyric_extractor.py`
- **.split_timestamped_words()** (4 connections) — `app/processors/lyrics/lyric_extractor.py`
- **parametrize** (4 connections)
- *... and 40 more nodes in this community*

## Relationships

- [Devanagari Transliteration](Devanagari_Transliteration.md) (9 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (8 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (6 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (5 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (4 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (4 shared connections)
- [Lyric Corrections Dictionary](Lyric_Corrections_Dictionary.md) (3 shared connections)
- [Caption Generator and Wrapping](Caption_Generator_and_Wrapping.md) (1 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (1 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/__init__.py`
- `app/processors/lyrics/caption_processor.py`
- `app/processors/lyrics/lyric_extractor.py`
- `tests/test_lyric_processing.py`
- `tests/test_whisper_chunk_length.py`

## Audit Trail

- EXTRACTED: 136 (88%)
- INFERRED: 18 (12%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*