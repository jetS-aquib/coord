---
id: D-069
title: A render's cost is itemised, and the lines we cannot predict are counted rather than guessed
date: 2026-11-04
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-243
---

## Context

estimatedCostUsd was one line of arithmetic — seconds of video times a price per second — and it was quoted as what a render costs. It never counted the stills (32 anchor frames, a reference plate and a cast portrait each, about $1.21 on a 31-clip song), the planning calls, or the continuity checks. Asked how we arrive at the figure, the honest answer was 'the clips, and we never added the rest'.

## Options considered

(a) leave the clip figure and document what it omits; (b) estimate every line, including the per-token LLM calls, and report one bigger number; (c) itemise, total only the lines with a published rate, and report the rest as exact call counts with no dollar figure.

## Decision

(c). renderCostV1(plan) returns one line per thing a render buys, each with a basis: 'published' (a provider rate times a count we know exactly — clips and stills; these are the only lines in the totals), 'metered' (real costs we record per call in GenerationLog but cannot predict, because they are per-token and vary several-fold with song length — reported as exact call counts, usd null), 'ours' (video-processing-backend: song read, transcription, seam comparisons, stitch — no per-render bill). estimatedCostUsd now means the floor of the published lines and costCeilingUsd the same with every re-render and redraw the tier allows, so both went up by about a dollar. The call sheet carries the itemisation as cost, with cost.excludes naming what no total covers.

## Reason

(a) leaves a number in front of a producer that is 5% low and cannot be explained without a caveat nobody reads. (b) is the original mistake one layer down: a treatment call on a long song costs several times one on a short song, and a plausible figure that turns out wrong is worse on a screen that asks for money than a line that says measured-not-predicted. The counts are knowable even where the dollars are not, and 63 vision calls a song is worth seeing before it is worth pricing. The per-image price is derived from tokenLogger's MODEL_PRICING rather than copied, so one table stays the source.

## Consequences

estimatedCostUsd changed meaning and value — $24.80 to $26.01 on a 31-clip song — which mobile shows; it is the same field, more honest, and the direction is upward so nobody is under-quoted. renderCostCeilingV1 was deleted, since two ways to compute money is how two screens come to disagree. The metered lines stay unpriced until actuals can be summed per render: GenerationLog records every call with its real cost but carries no jobId, so a render's actual spend cannot be reconciled against its estimate today. Summing by userId over the render's own window would answer it without touching a call site; worth its own request.
