---
id: D-006
title: Build the v1 render pipeline additively rather than migrating v0
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

Google shut down all three Veo 3.1 preview models on 2026-10-22; 'lite' is the default on web and hardcoded in mobile, so every Google video generation fails. Separately we are designing a parallel render pipeline. The first attempt at the migration rewrote generateVideoClipFromPrompt and generateVideoClipFromImage in place and remapped lite/fast/hq in VIDEO_MODEL_MAP.

## Options considered

Migrate v0 in place, so the outage fix and the new architecture land together; or add v1 alongside and leave v0 untouched.

## Decision

v1 is additive. New files only: config/videoModelsV1.ts and services/ai/omniVideoService.ts. No existing function, caller or model mapping is changed. config/aiModels.ts stays the source of truth for v0; videoModelsV1.ts is the source of truth for v1.

## Reason

Several devs are pushing to this repo concurrently and aiModels.ts is hot — four of the last six commits touched that area. Rewriting shared functions would both conflict with in-flight work and change behaviour under existing callers. The outage is owned by the devs maintaining the current system.

## Consequences

Production stays down on Google models until the maintainers switch callers; the switch is one line in synthesis.service.ts pointing the Google branch at generateClipV1. seedance-* keys still work on v0 as a no-code workaround. Two registries coexist until v0 is retired, which is deliberate duplication with a clear owner each.
