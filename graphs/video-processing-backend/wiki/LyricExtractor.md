# LyricExtractor

> God node · 26 connections · `app/processors/lyrics/lyric_extractor.py`

**Community:** [Caption Text Processing](Caption_Text_Processing.md)

## Connections by Relation

### calls
- .extract_lyrics() `EXTRACTED`
- test_extractor_passes_chunk_length_and_keeps_repeated_words() `EXTRACTED`
- test_singer_change_keeps_zero_duration_words_for_caption_repair() `EXTRACTED`

### contains
- lyric_extractor.py `EXTRACTED`

### imports
- stitch_pipeline.py `EXTRACTED`
- test_lyric_processing.py `EXTRACTED`

### method
- .run() `EXTRACTED`
- .split_timestamped_text() `EXTRACTED`
- .preprocess_audio() `EXTRACTED`
- .split_timestamped_words() `EXTRACTED`
- ._extract_vocals_with_demucs() `EXTRACTED`
- .__init__() `EXTRACTED`
- ._log_timing() `EXTRACTED`
- ._clean_transcription_text() `EXTRACTED`
- ._valid_word_timing() `EXTRACTED`
- ._resolve_transliteration_language() `EXTRACTED`
- ._grapheme_count() `EXTRACTED`
- ._run_ffmpeg() `EXTRACTED`
- ._extract_vocals_with_demucs_impl() `EXTRACTED`
- ._load_whisper_model() `EXTRACTED`

### rationale_for
- Extract multilingual lyrics with accurate word-level timestamps. Design goals:… `EXTRACTED`

### uses
- [StitchPipeline](StitchPipeline.md) `INFERRED`
- WhisperModelManager `INFERRED`
- test_unspaced_text_is_not_guessed_or_split() `INFERRED`
- test_whitespace_merged_words_split_inside_parent_interval() `INFERRED`
- test_auto_language_uses_reliable_detected_hindi_or_marathi() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*