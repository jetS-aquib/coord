---
id: D-002
title: Onboarded music-jetkreate-frontend to coordination
date: 2026-10-19
status: active
superseded_by: 
repos: music-jetkreate-frontend
tickets: 
---

## Context

React + Vite + TypeScript SPA (Redux Toolkit, React Query, Tailwind, Firebase), 130 source files. Owns no contracts: it is a browser client with no server. It has exactly two HTTP bases, both in src/config/api.ts — VITE_API_URL, whose paths match music-jetkreate-backend's mounts one for one, and VITE_VIDEO_PROCESSING_API_URL, which reaches video-processing-backend (discovered, not onboarded, so not recordable yet). Preflight also proposed iris and creater-ai-backend; both were dropped after reading the evidence — the creater-ai-backend /video hits are media-URL and MIME string tests plus a React Router path, and the iris /api/ideas calls go through the same apiFetchJson base as /api/assets, never to iris.

## Options considered

—

## Decision

music-jetkreate-frontend joins the platform registry as an active repo. It owns no contracts and depends_on music-jetkreate-backend.

## Reason

Its backend was onboarded the same day; leaving the client discovered meant the pair's cross-repo work had no board row, no status file and no ticket path.

## Consequences

Cross-repo changes to music-jetkreate-frontend now go through tickets. The video-processing-backend edge stays unrecorded until that repo is onboarded. Two open items were found during preflight and deliberately not fixed: src/services/ideasService.ts calls /api/ideas, which music-jetkreate-backend does not mount, and .env is untracked but not gitignored while holding GEMINI_API_KEY and VITE_REQUEST_SIGNING_KEY.
