# Whisper Model Loading

> 13 nodes

## Key Concepts

- **lyric_extractor.py** (25 connections) — `app/processors/lyrics/lyric_extractor.py`
- **WhisperModelManager** (9 connections) — `app/processors/lyrics/whisper_model_manager.py`
- **whisper_model_manager.py** (8 connections) — `app/processors/lyrics/whisper_model_manager.py`
- **.get()** (5 connections) — `app/processors/lyrics/whisper_model_manager.py`
- **test_whisper_model_is_loaded_once_for_concurrent_same_configuration()** (4 connections) — `tests/test_lyric_processing.py`
- **._load_whisper_model()** (2 connections) — `app/pipeline/stitch_pipeline.py`
- **._load_whisper_model()** (2 connections) — `app/processors/lyrics/lyric_extractor.py`
- **faster_whisper** (2 connections)
- **load_model()** (1 connections) — `tests/test_lyric_processing.py`
- **WhisperModel** (1 connections)
- **Load Whisper once per process and reuse it across jobs.** (1 connections) — `app/processors/lyrics/whisper_model_manager.py`
- **inspect** (1 connections)
- **sys** (1 connections)

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (8 shared connections)
- [Devanagari Transliteration](Devanagari_Transliteration.md) (7 shared connections)
- [Timing and Quality Logging](Timing_and_Quality_Logging.md) (5 shared connections)
- [Caption Text Processing](Caption_Text_Processing.md) (4 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (4 shared connections)
- [Stitch Pipeline Orchestration](Stitch_Pipeline_Orchestration.md) (2 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (1 shared connections)
- [Creator Measurement Callback](Creator_Measurement_Callback.md) (1 shared connections)

## Source Files

- `app/pipeline/stitch_pipeline.py`
- `app/processors/lyrics/lyric_extractor.py`
- `app/processors/lyrics/whisper_model_manager.py`
- `tests/test_lyric_processing.py`

## Audit Trail

- EXTRACTED: 43 (91%)
- INFERRED: 4 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*