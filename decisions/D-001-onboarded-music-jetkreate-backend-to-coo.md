---
id: D-001
title: Onboarded music-jetkreate-backend to coordination
date: 2026-10-19
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

npm + TypeScript + Express + Mongoose + Firebase Admin + Google GenAI + GCS + ffmpeg. 102 source files, no CLAUDE.md, no Node pinning, no lint or typecheck script. It serves 12 route groups, all mounted under /api by registerRoutes() in src/routes/index.ts. Its only real outbound HTTP client is video-api.service.ts, which calls an unregistered video-processing service at VIDEO_API_BASE_URL; music-jetkreate-frontend, its likely consumer, is discovered but not onboarded.

## Options considered

Register the 12 route groups the preflight scanner proposed; or read src/routes/index.ts and register what is actually mounted.

## Decision

music-jetkreate-backend joins the platform registry. It owns /api/auth, /api/users, /api/video, /api/image, /api/ai, /api/jobs, /api/podcasts, /api/music-videos, /api/assets, /api/elements, /api/user-settings and /api/health, each with a stub contract in .coord/contracts/. All 12 preflight candidates were rejected and the list was derived by reading the mounts instead.

## Reason

Across two preflight runs the scanner proposed 24 candidate route groups and 9 dependency edges; none survived checking. It ignores mount prefixes, counts commented-out routers (youtube.ts, dbBrowser.ts, the legacy draft_videos and optimized_videos blocks), misattributes routes to the wrong file, and caps at 12 so the list re-ranks when anything in the corpus changes. Registering it as scanned would have put music-jetkreate-backend on /channel, /video and /user, which creater-ai-backend already owns.

## Consequences

Cross-repo changes to music-jetkreate-backend now go through tickets. The 12 contracts are stubs describing routes, not generated artifacts, so they will drift; contracts/README.md asks for a generated schema instead and this repo already validates with zod. depends_on in repos.json is wrong: refreshDeps() wrote creater-ai-backend and iris in despite the evidence, and added music-jetkreate-backend to creater-ai-backend's and creater-ai-frontend's rows. There is no CLI command to remove a depends_on entry. music-jetkreate-frontend and the video-processing service are onboarded later; that is what resolves these edges properly.
