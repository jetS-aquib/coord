# Devanagari Transliteration

> 21 nodes

## Key Concepts

- **test_lyric_processing.py** (25 connections) — `tests/test_lyric_processing.py`
- **transliterate()** (18 connections) — `app/processors/lyrics/transliterator.py`
- **transliterator.py** (17 connections) — `app/processors/lyrics/transliterator.py`
- **unicodedata** (10 connections)
- **normalize_roman_spelling()** (5 connections) — `app/processors/lyrics/transliterator.py`
- **_delete_hindi_final_schwa()** (4 connections) — `app/processors/lyrics/transliterator.py`
- **_delete_final_schwa()** (3 connections) — `app/processors/lyrics/transliterator.py`
- **_has_final_inherent_vowel()** (3 connections) — `app/processors/lyrics/transliterator.py`
- **_romanize_orthography()** (3 connections) — `app/processors/lyrics/transliterator.py`
- **_to_common_roman_spelling()** (3 connections) — `app/processors/lyrics/transliterator.py`
- **transliterate_hindi()** (3 connections) — `app/processors/lyrics/transliterator.py`
- **test_auto_language_uses_reliable_detected_hindi_or_marathi()** (2 connections) — `tests/test_lyric_processing.py`
- **test_fast_bhajan_uses_plain_roman_spelling_without_schwa_suffixes()** (2 connections) — `tests/test_lyric_processing.py`
- **test_hindi_transliteration_examples()** (2 connections) — `tests/test_lyric_processing.py`
- **test_marathi_transliteration_examples()** (2 connections) — `tests/test_lyric_processing.py`
- **test_transliteration_handles_script_features_and_language_schwa()** (2 connections) — `tests/test_lyric_processing.py`
- **Romanize original Devanagari into common, plain Roman spelling. Final inherent…** (1 connections) — `app/processors/lyrics/transliterator.py`
- **Backward-compatible Hindi transliteration entry point.** (1 connections) — `app/processors/lyrics/transliterator.py`
- **Normalize Roman text without discarding meaningful transliteration marks.** (1 connections) — `app/processors/lyrics/transliterator.py`
- **indic_transliteration** (1 connections)
- **indic_transliteration_sanscript** (1 connections)

## Relationships

- [Caption Text Processing](Caption_Text_Processing.md) (9 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (7 shared connections)
- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (5 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (5 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (4 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (3 shared connections)
- [Caption Generator and Wrapping](Caption_Generator_and_Wrapping.md) (1 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/transliterator.py`
- `tests/test_lyric_processing.py`

## Audit Trail

- EXTRACTED: 71 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*