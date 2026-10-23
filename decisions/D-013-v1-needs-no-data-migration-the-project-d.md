---
id: D-013
title: v1 needs no data migration: the project document stays the source of truth
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-frontend, music-jetkreate-mobile
tickets: 
---

## Context

v1 introduces a new collection, RenderPlanV1. Asked: must the web team migrate v0 data to keep seeing existing work? v0 has no render collection. Its entire per-clip record is MusicVideo.storyboard[i].clipUrl and .status, plus finalVideoUrl, and both clients read exactly those (frontend MusicToVideo.tsx, mobile lib/generation.ts).

## Options considered

Backfill one RenderPlanV1 per existing MusicVideo and dual-read for a period; or keep the project document authoritative and have v1 write the same fields.

## Decision

The project document remains the source of truth; RenderPlanV1 stays derived and disposable. The orchestrator mirrors each finished scene back to storyboard[i].clipUrl, .clipUrls and .status as it lands.

## Reason

RenderPlanV1 duplicates nothing v0 persists; it holds orchestration state v0 never had. A backfill would create two writers for the same facts and force every client into a dual read, to gain nothing: no screen needs a historical plan for a render that already finished.

## Consequences

Old projects need no backfill. v1 renders are readable by clients that have never heard of v1 — adopting it is pointing at a new endpoint. A plan can be deleted and regenerated from the storyboard. Known limit: clipUrl holds one URL, so a legacy scene longer than the render model's cap gets the first of its clips there, with the full set in the new clipUrls array.
