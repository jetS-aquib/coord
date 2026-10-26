---
title: Video assembly is not the bottleneck; Whisper is
added: 2026-10-26
updated: 2026-10-26
by: aquib N
---

Measured 2026-10-26 in video-processing-backend's own container on 4 CPUs.

Clip stitching runs at 0.23x realtime and scales LINEARLY with clip count: 96s of 1080p material in 21.7s, 256s in 59.3s. Inside that, the single libx264 pass is ~68%, OpenCV optical-flow analysis ~14%, the final mux ~8%. Burning captions (the second full encode) is a further 0.08x realtime. So the whole video path for a 4-minute song is about 0.32x realtime, roughly 80 seconds.

If a lyrics render takes far longer than that, the time is in transcription, not assembly. Whisper large-v3 on CPU int8 is a 2.9 GB download and 99s of cold start, and docker-compose had no cache volume, so it was paid again on every container recreate; with a named volume on /root/.cache/huggingface that drops to 6.2s. Other levers on the same path: beam_size=5/best_of=5, WHISPER_VAD_FILTER=false (no silence skipping) and WHISPER_TEMPERATURE_FALLBACK=true (re-decodes rejected windows), plus MAX_CONCURRENT_JOBS=1, which serialises every caller behind one render.

MoviePy was measured on the same 12-clip crossfade job: 0.92x realtime against the current 0.23x, i.e. 4x slower with audio disabled, because it composites frames in Python instead of handing one filter graph to ffmpeg. It is not a route to a faster pipeline.

Every phase already logs [API3-TIMING] <label>=<n>s, so a slow production job can be attributed from its own logs without new instrumentation.
