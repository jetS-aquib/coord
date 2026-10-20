# Processors Lyrics

> 28 nodes

## Key Concepts

- **CaptionProcessor** (20 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.run()** (8 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.clean_text()** (7 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.build_captions()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.caption_text()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.display_text()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.make_caption()** (6 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.build_from_segments()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.collect_words()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.merge_short_captions()** (5 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.repair_words()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.romanize_text()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.should_split()** (4 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.repair_zero_duration_words()** (3 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.save()** (2 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **.__init__()** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Fallback when word timestamps are unavailable. This is less precise than word-…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Validate Whisper word timestamps. The original timestamps are preserved…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Convert Whisper word timestamps into readable, synchronized lyric captions.…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Repair zero-duration Whisper words. Timing is inferred only from neighboring…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Flatten Whisper segments into one chronological word stream.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Convert Devanagari text to Roman/Latin text.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Build display text from a group of words.** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Create one caption from a group of words. The start is always based on the…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- **Decide whether adding the new word should create a new caption. Priority: 1.…** (1 connections) — `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`
- *... and 3 more nodes in this community*

## Relationships

- [Processors Lyrics](Processors_Lyrics.md) (5 shared connections)
- [App Pipeline](App_Pipeline.md) (3 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/processors/lyrics/caption_processor.py`

## Audit Trail

- EXTRACTED: 54 (96%)
- INFERRED: 2 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*