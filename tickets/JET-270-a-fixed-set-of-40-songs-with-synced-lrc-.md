---
id: JET-270
title: A fixed set of 40+ songs with synced .lrc references, and one script that scores the Gemini lyrics path on all of them
from: video-processing-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-09T01:38:53+05:30
updated: 2026-11-09T01:38:53+05:30
decisions: 
---

## Request

Stop tuning lyrics one song at a time; measure every change on a fixed song set

## Understanding

Build an eval harness in this repo: eval/lyrics/ (songs.json, refs/*.lrc in Roman, README), scripts/lyric_eval.py running the production Gemini path (StitchPipeline._gemini_extractor) N times per song with constant overrides via --set, and eval/lyrics/score.py (word accuracy with loose Hinglish spelling, line recall, chant recall, invented lines, timing vs .lrc, gaps). Audio stays out of git. Collecting the 40+ .lrc references is the dev/team's work; I build the harness and seed the three songs already debugged. No production code changes. Assumes AI cost is not a concern (dev said so).

## Plan

1. eval/lyrics/score.py + tests/test_lyric_eval_score.py
2. scripts/lyric_eval.py: --songs/--tag, --runs, --jobs, --set, --compare; per-run JSON in eval/lyrics/runs/
3. songs.json seeded with Lutt Putt, Oye Hoye, Stay With Me; README on adding songs and the keep/drop rule
4. .gitignore for audio, cache, runs
5. After JET-264/265 are committed: baseline.json on the full set

## Reason

Each fix (D-073, JET-264, JET-265) made one song work with no way to see what it did to others; story writing and direction depend on lyric quality

## Related files

scripts/lyric_eval.py,eval/lyrics/score.py,eval/lyrics/songs.json,eval/lyrics/README.md,tests/test_lyric_eval_score.py,.gitignore

## Acceptance criteria

Score tests pass; a run on the seeded songs writes a table and JSON; --compare against itself reports no regressions; SHEET_CALLS=1 shows lower chant recall on Lutt Putt

## Test steps

—

## Thread
2026-11-09T01:38:53+05:30 aquib N: created ticket, status: - -> open
2026-11-09T01:46:48+05:30 aquib N: Harness built (uncommitted): eval/lyrics/{score.py,songs.json,README.md,refs/}, scripts/lyric_eval.py, tests/test_lyric_eval_score.py (14 pass, suite 647). Plumbing verified on Lutt Putt with a throwaway ref (deleted): 2 reads 2.9 min cold, 1.6 min with the cached stem; --set applies and rejects unknown names; --compare prints deltas and regressions. Blocked on references: no .lrc is committed yet; songs.json seeds 3 songs with local paths. Baseline waits on the JET-264/265 commit.
2026-11-09T01:59:42+05:30 aquib N: Sources: lyrics from LRCLIB (lrclib.net, free open API, synced) via new scripts/lyric_eval_fetch.py (closest-duration hit, Gemini text-only romanization to Hinglish, rules as fallback); audio from the app's own GCS uploads (gs://jetkreate/project_live/audio/, ~34 named files, most full songs are repeats; ik-vaari-aa, gehra-hua, lahore, love-me-like-you-do, saagar-kinare are 13-40s clips, no usable ref). 4 draft refs pulled: lutt-putt-gaya, oye-hoye-kya-scene-hai, stay-with-me-akcent, timeless-the-weeknd. First (dirty, JET-265) numbers: word acc Lutt ~0.72 after ref fix, Oye 0.67, Stay 0.65-0.93, Timeless 0.60 (line recall 0.31, to investigate). Drafts still need hand-checking (Lutt's LRCLIB file has no 'dhum chik pak dhum').
