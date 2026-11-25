---
id: JET-443
title: Song read: take Demucs off the read path (pieces from the mix) or swap it for an in-process vocals-only ONNX model, gated on the lyric eval
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-25T12:57:57+05:30
updated: 2026-11-25T15:41:45+05:30
decisions: D-106
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
2026-11-25T15:41:45+05:30 aquib N: linked decision D-106 (Vocal stem stays; Demucs runs in-process on every vCPU, preloaded at startup)
2026-11-25T15:41:45+05:30 aquib N: Eval (5 songs x 3 runs, Gemini path): stem baseline word_accuracy 0.72, line_recall 0.67, consistency 0.67, timing_within_1s 0.89. Pieces cut from the mix with Silero VAD: 0.69 / 0.63 / 0.52 / 0.96; Lutt Putt 0.72 -> 0.57, Zaaya worst 0.65 -> 0.23. Fails the no-regression bar, so the stem stays and the experiment code is removed. Shipped instead: Demucs in-process (same Separator/save_audio as the CLI; stem matches within Demucs's own random shift), model preloaded at startup, torch threads = all vCPUs, subprocess as fallback, torch cache in a volume. Locally (10 cores) it is ~equal to the CLI (44-46s vs 46s on a 2:24 song); staging's gain is the thread count and the ~9s start, confirmed by '[DEMUCS] model loaded ... threads=' and [READ-PERF] demucs after deploy. ONNX swap (b) not done: needs an exported model validated here; file it if staging Demucs is still the pain. Also fixed scripts/lyric_eval.py, broken by JET-329 (extractor reads song_file).
2026-11-25T16:14:49+05:30 aquib N: R&D round 2 (all on the 5-song eval, 3 runs each, vs stem baseline 0.72 word accuracy / 0.67 line recall): (1) ONNX htdemucs_ft vocals (StemSplit export, MIT, 316 MB): 6-7x SLOWER than our in-process torch htdemucs on a 2:25 song (326s at 4 threads, 365s at 10, vs 51s) - the export replaces FFT with Conv/ConvTranspose and ONNX Runtime is slow on them; the '4x faster' claim is vs the 4-model ft bag we never ran. Dropped. (2) Sheet hinted by the whole-mix read only, so it could start beside Demucs: 0.72 -> 0.60, Oye Hoye 0.66 -> 0.36, invented lines 7 -> 15. Rejected. (3) Sheet at thinkingLevel=low: sheet call ~45s -> ~25s but 0.72 -> 0.66, Oye Hoye 0.66 -> 0.39. Rejected; kept as gemini_transcriber.SHEET_THINKING (default None). Remaining time per uncached song is Demucs (~2/3) + sheet (~1/5); the in-process all-vCPU Demucs from be10c69 still has to be measured on staging.
