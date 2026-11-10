---
id: D-082
title: Story writer off: a blind judge preferred shot lists without it in 5 of 6 pairs
date: 2026-11-10
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-285, JET-262
---

## Context

JET-262 added a writer call before the treatment. Aquib saw no better stories, only more time. JET-285 measured it.

## Options considered

1) Keep it. 2) Merge script and treatment into one call. 3) Turn it off (flag), keep the code for a rerun.

## Decision

Option 3: flags.render.scriptWriter = false. The treatment writes the story itself, as before JET-262.

## Reason

scripts/rnd/storyAB.ts, 3 songs (Punjabi, Hindi, English) x 2 runs, same cast and cut, judged blind in both orders: writer on 29.0/40 avg, off 33.5/40; off won 5 of 6 pairs and both orders agreed every time. The writer added 4-20s per plan. The judge's repeated complaint: stories reset halfway and repeat early shots, which is the writer's per-section moments. Merging would keep the moments problem in one call, so it was not tried.

## Consequences

Planning is 4-20s faster. The writer's code stays behind the flag. Fixes made in the same request still apply with the writer off: the hook is marked by the loudest section rather than by a label every section shares. If the writer is revisited, drop the per-section moments first and rerun storyAB.ts.
