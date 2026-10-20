# Lyric Text Normalization

> 17 nodes

## Key Concepts

- **TextNormalizer** (10 connections) — `app/processors/lyrics/text_normalizer.py`
- **.normalize_text()** (7 connections) — `app/processors/lyrics/text_normalizer.py`
- **.normalize_caption()** (5 connections) — `app/processors/lyrics/text_normalizer.py`
- **.normalize_word()** (4 connections) — `app/processors/lyrics/text_normalizer.py`
- **.detect_script()** (3 connections) — `app/processors/lyrics/text_normalizer.py`
- **.normalize_captions()** (3 connections) — `app/processors/lyrics/text_normalizer.py`
- **.normalize_english()** (3 connections) — `app/processors/lyrics/text_normalizer.py`
- **.urdu_to_hindi()** (3 connections) — `app/processors/lyrics/text_normalizer.py`
- **.__init__()** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Estimate the dominant writing system.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Basic Urdu-script -> Devanagari conversion. This is intentionally conservative.…** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Do not translate the lyric. For English ASR output we only normalize whitespace.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Normalize one lyric string.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Normalize a single word while preserving all timing and probability metadata.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Normalize caption text and its word metadata. Timing remains unchanged.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Normalize a complete caption list.** (1 connections) — `app/processors/lyrics/text_normalizer.py`
- **Normalize ASR text into the desired caption script. Current modes: native Keep…** (1 connections) — `app/processors/lyrics/text_normalizer.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (1 shared connections)

## Source Files

- `app/processors/lyrics/text_normalizer.py`

## Audit Trail

- EXTRACTED: 24 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*