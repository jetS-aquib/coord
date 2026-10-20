# Hindi ASR Correction

> 12 nodes

## Key Concepts

- **HindiCorrector** (8 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.correct_word()** (5 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.correct_words()** (4 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.should_review()** (4 connections) — `app/processors/lyrics/hindi_corrector.py`
- **CorrectionResult** (2 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.is_hindi_text()** (2 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.normalize_text()** (2 connections) — `app/processors/lyrics/hindi_corrector.py`
- **.__init__()** (1 connections) — `app/processors/lyrics/hindi_corrector.py`
- **Process Whisper word objects while preserving timestamps.** (1 connections) — `app/processors/lyrics/hindi_corrector.py`
- **Generic Hindi ASR correction layer. Important: - No song-specific vocabulary. -…** (1 connections) — `app/processors/lyrics/hindi_corrector.py`
- **Decide whether a word deserves further correction. This does NOT automatically…** (1 connections) — `app/processors/lyrics/hindi_corrector.py`
- **Conservative correction entry point. The current implementation intentionally…** (1 connections) — `app/processors/lyrics/hindi_corrector.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (2 shared connections)

## Source Files

- `app/processors/lyrics/hindi_corrector.py`

## Audit Trail

- EXTRACTED: 17 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*