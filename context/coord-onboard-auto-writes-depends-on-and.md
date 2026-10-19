---
title: coord onboard auto-writes depends_on and never removes one
added: 2026-10-19
updated: 2026-10-19
by: aquib N
---

onboard.js refreshDeps() runs on EVERY onboarding. It re-scans every onboarded repo with the same detectDeps() heuristic that powers the preflight candidates, and auto-promotes anything it marks 'confirmed' straight into repos.json. Two consequences:

1. --depends-on on the apply command does not mean 'only these'. Passing it empty does not keep depends_on empty; refreshDeps adds its guesses afterwards.
2. The merge is a union: [...new Set([...e.depends_on, ...found])] (onboard.js:431). Nothing is ever subtracted, so a false positive is permanent and there is no CLI command to remove one.

detectDeps counts local relative imports and plain substrings as calls. Verified false positives when music-jetkreate-backend was onboarded on 2026-10-19: '../models/GenerationLog' read as a call to creater-ai-backend's /models contract; the Firebase error code string 'auth/user-not-found' read as a call to /user; imgUrl.includes('/video/') read as a call to /video; routes the repo SERVES (/video/text-to-video, /user/history in jobs.routes.ts) read as calls it MAKES; and ${BACKEND_URL}/api/youtube/auth/callback -- the repo's own OAuth redirect URI -- read as a call to iris's /api/youtube.

Read depends_on in repos.json as 'a scanner guessed this', not 'somebody checked this'. Check the evidence before relying on an edge.
