# Timing and Quality Logging

> 17 nodes

## Key Concepts

- **ffmpeg_engine.py** (32 connections) — `app/processors/ffmpeg/ffmpeg_engine.py`
- **caption_processor.py** (20 connections) — `app/processors/lyrics/caption_processor.py`
- **time** (17 connections)
- **emit_timing()** (16 connections) — `app/core/timing.py`
- **timing.py** (15 connections) — `app/core/timing.py`
- **caption_generator.py** (9 connections) — `app/processors/lyrics/caption_generator.py`
- **log_quality()** (8 connections) — `app/core/timing.py`
- **log_timing()** (6 connections) — `app/core/timing.py`
- **timed()** (4 connections) — `app/core/timing.py`
- **math** (4 connections)
- **TimingCallback** (1 connections)
- **Print a standardized API #3 profiling line. Format matches the required…** (1 connections) — `app/core/timing.py`
- **Log an API #3 timing line and optionally mirror it to a collector.** (1 connections) — `app/core/timing.py`
- **Print a standardized API #3 quality-diagnostic line.** (1 connections) — `app/core/timing.py`
- **Time a block of code and immediately log it via log_timing(). This is purely…** (1 connections) — `app/core/timing.py`
- **# IMPORTANT:** (1 connections) — `app/processors/lyrics/caption_processor.py`
- **# IMPORTANT:** (1 connections) — `app/processors/lyrics/caption_processor.py`

## Relationships

- [Module Wiring and Downloads](Module_Wiring_and_Downloads.md) (22 shared connections)
- [Caption Positioning and Font Resolution](Caption_Positioning_and_Font_Resolution.md) (10 shared connections)
- [Caption Text Processing](Caption_Text_Processing.md) (6 shared connections)
- [Whisper Model Loading](Whisper_Model_Loading.md) (5 shared connections)
- [Caption Font Catalog and Layout](Caption_Font_Catalog_and_Layout.md) (5 shared connections)
- [Devanagari Transliteration](Devanagari_Transliteration.md) (5 shared connections)
- [FFmpeg Filter and ASS Rendering](FFmpeg_Filter_and_ASS_Rendering.md) (4 shared connections)
- [Kinetic Word Timing](Kinetic_Word_Timing.md) (4 shared connections)
- [Caption Generator and Wrapping](Caption_Generator_and_Wrapping.md) (3 shared connections)
- [Settings and App Startup](Settings_and_App_Startup.md) (3 shared connections)
- [Lyric Wave Animation](Lyric_Wave_Animation.md) (3 shared connections)
- [Caption Preview Service](Caption_Preview_Service.md) (2 shared connections)

## Source Files

- `app/core/timing.py`
- `app/processors/ffmpeg/ffmpeg_engine.py`
- `app/processors/lyrics/caption_generator.py`
- `app/processors/lyrics/caption_processor.py`

## Audit Trail

- EXTRACTED: 111 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*