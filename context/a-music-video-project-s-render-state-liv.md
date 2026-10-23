---
title: A music video project's render state lives on the project document, not in a render collection
added: 2026-10-23
updated: 2026-10-23
by: aquib N
---

True across music-jetkreate-backend, -frontend and -mobile.

There is no 'renders' collection in v0. Per-scene render state is stored inside the storyboard array on the MusicVideo document:

  MusicVideo.storyboard[i].clipUrl   the scene's rendered clip
  MusicVideo.storyboard[i].status    'idle' | 'done'
  MusicVideo.finalVideoUrl           the assembled song

POST /api/music-videos $sets every field it is given and keys on 'id', so a partial save is a silent overwrite — always send the whole record. Both clients rely on this: frontend MusicToVideo.tsx draws the storyboard grid, the per-scene player and the Re-render button from scene.clipUrl/status; mobile lib/generation.ts treats the absence of clipUrl as 'resume here'.

Anything new that renders clips must write those fields back, or the project looks unrendered in every existing screen. The v1 pipeline (RenderPlanV1 + renderOrchestratorV1) does, and additionally writes storyboard[i].clipUrls — the full list, for a scene that needed more than one clip. See D-008.
