---
id: D-034
title: The shot grammar is arithmetic in code; only what is in the frame is a model call
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

Batch 7.3. Prompts for a v1 render still came from v0's generateMusicStoryboard — a 32-scene blob generated from a duration in seconds, before the song was ever read. Replacing it raises the question of how much of a shot a model should decide. A 4:16 song is 44 clips; asking a model for 44 shots risks 44 unrelated images, and asking it to 'vary the shot sizes' varies them randomly.

## Options considered

1. One model call per clip, everything decided by the model. Rejected: a per-clip call cannot know what the other clips did, which is the incoherence the batch exists to fix. 2. One batch call, everything decided by the model, including shot size, lane and lyric mode. 3. One batch call for the CONTENT only, with the grammar computed in code. 4. Everything in code, no call — no content, so no video.

## Decision

Option 3. shotListV1.ts computes shot size (by position in the section), lane (D-033), lyric-to-image mode (amplify by default, illustrate where the hook line falls, disjunctive at the bridge), camera move (varied by how many times that section label has been seen) and aspect framing — all pure, deterministic and unit-tested with no render. One batched model call then writes a single line per shot saying what is in the frame. The composed clip prompt stays one short line; the place, light, people and grade reach the model through the stills, from the look bible. A second prompt-safety pass runs over what the shot list wrote, because those words are new and partly the artist's own. Every stage falls back to the storyboard prompts that exist today.

## Reason

The grammar is arithmetic, not taste, and arithmetic that can be tested for free is the only kind that can be trusted on a  render — the shot progression, the lane split and the lyric mode are now checked by 24 tests that need no API key. Leaving them to a model makes them unverifiable and silently variable per run. The content genuinely needs a model and genuinely needs to be one call, so that shot 31 knows what shot 4 did. Keeping the final prompt short is not style: 6 of 6 pins held on a short prompt and 0 of 28 on a 200-word one. The second safety pass is one text call against the measured 20-of-31 refusal that a likeness in the text caused.

## Consequences

Two text calls are added at plan time, both of which fail soft to the previous behaviour. The clip record gains shotSize, lane, lyricMode, cameraMove, lyricLines and castTags, and the plan gains treatment, lookBible and shotSource — stored rather than recomputed, because a resumed render must be the same video and Batch 7B can only check a clip against the constraints that were actually used. A duration-packed plan (no song read) gets no grammar at all and renders exactly as it did before, with shotSource reporting 'storyboard'. @imageN tags are carried through the shot list rather than resolved, so real cast identity in 8.1 is a substitution and not a rewrite.
