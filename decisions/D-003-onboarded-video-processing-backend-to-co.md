---
id: D-003
title: Onboarded video-processing-backend to coordination
date: 2026-10-19
status: active
superseded_by: 
repos: video-processing-backend
tickets: 
---

## Context

pip + Python 3.11 + FastAPI + Uvicorn + ffmpeg + faster-whisper + GCS (Demucs optional); 94 source files, pytest + ruff, Dockerfile-built. It owns the three ordered clip-stitching workflows, the job-state endpoints callers settle against, and the caption style/font/preview endpoints. It calls no other repo: SERVICE_ASSERTION_SECRET is inbound verification of assertions minted by the creator API, and the one outbound call (CREATOR_CALLBACK_URL) has no receiving endpoint in any onboarded repo and is off unless configured.

## Options considered

—

## Decision

video-processing-backend joins the platform registry; it owns video-stitching, video-jobs and video-captions. depends_on is empty. /api/v1/health was deliberately not registered as a contract.

## Reason

creater-ai-backend, music-jetkreate-backend and music-jetkreate-frontend all call it in production, and iris runs a vendored copy of it, but it had no board row, no status file and no published contract. Changes to its request shapes were invisible to the repos that depend on them.

## Consequences

Cross-repo changes to video-processing-backend now go through tickets. The contract stubs are descriptions, not sources of truth, until the owner fills them in. The iris fork at apps/iris/services/video-processing is still unlinked and will drift; the reverse depends_on rows on the four calling repos are not yet set.
