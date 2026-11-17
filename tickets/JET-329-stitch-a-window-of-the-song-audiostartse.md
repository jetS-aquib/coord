---
id: JET-329
title: Stitch a window of the song: audioStartSeconds/audioEndSeconds on the audio, lyrics and segment-concat stitches
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-17T15:36:23+05:30
updated: 2026-11-17T15:40:31+05:30
decisions: D-083
---

## Request

Add optional audioStartSeconds and audioEndSeconds to clip-stitching-with-audio, clip-stitching-with-lyrics (v1+v2) and segment-concat. The master audio is cut to the window; captions are shifted by the start; the transcript/song-read cache stays keyed on the full song's bytes.

## Understanding

Today audio is always used whole from t=0 and the mux trims video to audio (-t / -shortest), so a window can't be rendered without the caller uploading a slice, which misses the transcript cache and offsets lyricLines. Assumptions: both fields optional, absent = today's behaviour; lyricLines stay in absolute song time and are shifted server-side; lines outside the window are dropped, a line crossing an edge is clipped.

## Plan

1. Schemas (app/schemas/jobs.py): add the two optional fields with start<end, within duration.
2. ffmpeg_engine / caption renderer: -ss/-t on the master audio input.
3. Transcribe/cache on the full audio, then shift and filter caption timings by start.
4. Same for segment-concat.
5. Update video-stitching(-v2) and video-segments contracts; tests for offset captions.

## Reason

music-jetkreate-backend needs to render only part of a song (window selector).

## Related files

app/schemas/jobs.py, app/services/ffmpeg_engine.py, app/services/caption_style_renderer.py, app/services/stitch_pipeline.py

## Acceptance criteria

A lyrics stitch with audioStartSeconds=60, audioEndSeconds=90 returns a 30s video whose audio is 60-90s of the song and whose captions match those lines; a second call reuses the transcript cache.

## Test steps

—

## Thread
2026-11-17T15:36:23+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
2026-11-17T15:40:31+05:30 aquib N: status: open -> approved
2026-11-17T16:00:16+05:30 aquib N: Video side done (uncommitted). audioStartSeconds/audioEndSeconds (+snake_case) on clip-stitching-with-audio, clip-stitching-with-lyrics, segment-concat, v1 and v2; either alone ok; end<=start is 422; start past the song fails the job. The pipeline keeps the whole song as song_file (transcribed, cache-keyed: a window shares the whole song's transcript) and cuts work/audio_window.wav as the render's audio_file, so every mux and the visual timeline follow the window with no engine change. Captions: lyricLines applied in song time, then words shifted by -start, outside dropped, edges clipped (app/processors/lyrics/audio_window.py). Contracts video-stitching.md + video-segments.md updated (v2 says same bodies as v1). 717 tests pass incl. tests/test_audio_window.py. TEST STEPS: 1) POST /api/v2/clip-stitching-with-lyrics with a warmed song, audioStartSeconds=60, audioEndSeconds=90; 2) log shows '[AUDIO] window 60s..90' and '[TRANSCRIPT] cache hit'; 3) output is 30s, audio = song 60-90s, captions on the words; 4) same body with audioEndSeconds=50 -> 422.
