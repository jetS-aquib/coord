---
id: D-012
title: v1 render orchestrator is standalone, not a jobService job type
date: 2026-10-23
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

Batch 2 of the v1 pipeline needed a server-side worker for whole-song renders. jobService declares a 'music_video' job type that executeJob has never handled.

## Options considered

Implement the declared music_video type inside services/jobs/jobService.ts; or build a standalone orchestrator whose plan document is its own job record.

## Decision

Standalone orchestrator: src/services/render/renderOrchestratorV1.ts with RenderPlanV1 as both plan and job record, its own EventEmitter for SSE, and its own startup resume. jobService is not touched.

## Reason

Using the declared type meant editing a file several devs push to, and fitting ordered clips, per-clip checkpoints and resume into executeVideoGeneration's single-task poll loop, which has none of that shape. Deliberately NOT copied: recoverJobsOnStartup fails jobs older than 25 minutes, which would destroy a 45-minute render and its spend on every deploy.

## Consequences

v1 resumes from the last finished clip at any age. jobService keeps serving v0 unchanged. The music_video job type stays declared and unhandled; anyone implementing it later should know v1 does not use it.
