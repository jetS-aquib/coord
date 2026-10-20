# Processors Lyrics

> 18 nodes

## Key Concepts

- **LyricExtractor** (14 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **.run()** (9 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **WhisperModelManager** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`
- **.preprocess_audio()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **._extract_vocals_with_demucs()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **._clean_transcription_text()** (3 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **._valid_word_timing()** (3 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **.get()** (3 connections) — `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`
- **._extract_vocals_with_demucs_impl()** (2 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **._run_ffmpeg()** (2 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **.__init__()** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **WhisperModel** (1 connections)
- **Remove artifacts commonly produced by ASR. Important: We remove "|" because it…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **Isolate vocals using Demucs. The original audio timeline is preserved.…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **Extract multilingual lyrics with accurate word-level timestamps. Design goals:…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **Prepare the audio used by Whisper. Priority: 1. Demucs vocal separation 2.…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **Validate Whisper timestamps.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- **Load Whisper once per process and reuse it across jobs.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (6 shared connections)
- [App Pipeline](App_Pipeline.md) (3 shared connections)
- [Infrastructure Callbacks](Infrastructure_Callbacks.md) (1 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/processors/lyrics/lyric_extractor.py`
- `apps/iris/services/video-processing/app/processors/lyrics/whisper_model_manager.py`

## Audit Trail

- EXTRACTED: 31 (91%)
- INFERRED: 3 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*