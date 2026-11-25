---
id: JET-443
title: Song read: take Demucs off the read path (pieces from the mix) or swap it for an in-process vocals-only ONNX model, gated on the lyric eval
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-25T12:57:57+05:30
updated: 2026-11-25T15:17:50+05:30
decisions: 
---

## Request

Demucs htdemucs is the long pole of a cold read (74-78s on the Mac, minutes on staging per JET-441). Remove it from song read without losing accuracy.

## Understanding

Two steps, the second only if the first fails the eval. (a) A PIECE_SOURCE constant in gemini_transcriber ('stem' | 'mix'); with 'mix' the 30s pieces and their cut points come from the mix (energy/VAD on the existing 16k decode instead of _sung_frames on the stem). If word_accuracy and line_recall hold over 3 runs on the eval set, Demucs leaves the read path. (b) Otherwise replace the demucs.separate subprocess with an in-process htdemucs_ft vocals-only ONNX model on onnxruntime, loaded once and preloaded at startup, behind SEPARATOR=onnx|demucs. Per the dev's call, no new local models beyond this swap, no new vendors, server only. Depends on JET-270: grow eval/lyrics to ~12 songs, record baseline.json, and add --no-stem-cache to scripts/lyric_eval.py so timings include separation. May change words, so READ_VERSION may bump, which needs a Node SONG_READ_CACHE_V1 request (D-038).

## Plan

1. JET-270: refs to ~12 songs (hi/pa/en), baseline.json, --no-stem-cache
2. PIECE_SOURCE=mix + cut points from the mix; eval --runs 3 --jobs 1 --compare baseline
3. If it holds: default mix, Demucs off the read path; decision record
4. If not: ONNX vocals-only separator behind SEPARATOR, weights baked or volumed, preload; eval + timing; decision record (new dependency)
5. READ_VERSION bump if words change; file the Node request

## Reason

Separation is ~1.5x the track length on CPU. Jam-ALT found separation usually doesn't help lyrics ASR; D-073/JET-265 kept it because a single whole-mix Gemini call dropped verses, but today's 30s pieces may not need the stem for that.

## Related files

app/processors/lyrics/gemini_transcriber.py,app/processors/lyrics/lyric_extractor.py,app/main.py,Dockerfile,requirements.txt,scripts/lyric_eval.py,eval/lyrics/

## Acceptance criteria

Eval: word_accuracy and line_recall not lower than baseline over 3 runs. Staging: [READ-PERF] uncached total under 90s p50 for a 4-min song.

## Test steps

—

## Thread
2026-11-25T12:57:57+05:30 aquib N: created ticket, status: - -> open
2026-11-25T15:17:50+05:30 aquib N: status: open -> approved
