# CaptionProcessor

> God node · 27 connections · `app/processors/lyrics/caption_processor.py`

**Community:** [Caption Text Processing](Caption_Text_Processing.md)

## Connections by Relation

### calls
- test_caption_grouping_preserves_separate_word_data() `EXTRACTED`
- .process_captions() `EXTRACTED`
- test_singer_change_keeps_zero_duration_words_for_caption_repair() `EXTRACTED`

### contains
- caption_processor.py `EXTRACTED`

### imports
- stitch_pipeline.py `EXTRACTED`
- test_lyric_processing.py `EXTRACTED`
- test_whisper_chunk_length.py `EXTRACTED`

### method
- .run() `EXTRACTED`
- .clean_text() `EXTRACTED`
- .build_captions() `EXTRACTED`
- .collect_words() `EXTRACTED`
- .display_text() `EXTRACTED`
- .caption_text() `EXTRACTED`
- .make_caption() `EXTRACTED`
- .build_from_segments() `EXTRACTED`
- .merge_short_captions() `EXTRACTED`
- .repair_words() `EXTRACTED`
- .romanize_text() `EXTRACTED`
- .should_split() `EXTRACTED`
- .save() `EXTRACTED`
- .repair_zero_duration_words() `EXTRACTED`
- ._log_timing() `EXTRACTED`
- .__init__() `EXTRACTED`

### rationale_for
- Convert Whisper word timestamps into readable, synchronized lyric captions.… `EXTRACTED`

### uses
- [StitchPipeline](StitchPipeline.md) `INFERRED`
- LyricCorrector `INFERRED`
- test_extractor_passes_chunk_length_and_keeps_repeated_words() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*