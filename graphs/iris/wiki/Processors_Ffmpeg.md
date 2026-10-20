# Processors Ffmpeg

> 38 nodes

## Key Concepts

- **FFmpegEngine** (24 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_transition_video()** (13 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_final_video()** (10 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **Path** (10 connections)
- **VideoFilterBuilder** (9 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **._probe_duration()** (6 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_video_with_audio()** (6 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.build()** (5 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **._create_glow_ass()** (5 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._probe_video_info()** (5 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.render_direct_final_video()** (5 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.execute()** (4 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._has_audio_stream()** (4 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._probe_pix_fmt_and_audio()** (4 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._run()** (4 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._clip_filter_chain()** (3 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **._safe_transition_duration()** (3 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **._validate_transition()** (3 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **._load_json()** (3 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._parse_srt()** (3 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._escape_ass_text()** (2 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.__init__()** (2 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **._srt_to_ass_time()** (2 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- **.__init__()** (1 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- **rate()** (1 connections) — `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`
- *... and 13 more nodes in this community*

## Relationships

- [App Pipeline](App_Pipeline.md) (7 shared connections)
- [Processors Lyrics](Processors_Lyrics.md) (5 shared connections)

## Source Files

- `apps/iris/services/video-processing/app/processors/ffmpeg/builders/video_filter_builder.py`
- `apps/iris/services/video-processing/app/processors/ffmpeg/ffmpeg_engine.py`

## Audit Trail

- EXTRACTED: 75 (93%)
- INFERRED: 6 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*