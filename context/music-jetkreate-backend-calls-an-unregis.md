---
title: music-jetkreate-backend calls an unregistered video-processing service
added: 2026-10-19
updated: 2026-10-19
by: aquib N
---

music-jetkreate-backend's src/modules/video/video-api.service.ts is its only real outbound HTTP client. It calls VIDEO_API_BASE_URL (default http://localhost:5005) at /api/v1/jobs/:id, /api/v1/clip-stitching, /api/v1/clip-stitching-with-audio, /api/v1/clip-stitching-with-lyrics and /api/v1/caption-preview.

That service is NOT in the registry and is NOT iris. iris only reimplements the same idea: apps/iris/app/api/ideas/stitch/route.ts runs JetKreate's StitchPipeline inside a Vercel Sandbox and says so in its own header comment. iris is a sibling consumer, not the provider.

The video-processing service will be onboarded later; onboarding it is what resolves this dependency properly. Until then music-jetkreate-backend's registry depends_on does not name it.
