---
owner: music-jetkreate-backend
status: active
---

# /api/music-videos

The v1 rendering section below is written by hand and is current. The project
endpoints above are still the onboarding scan — a *description*, not a source of
truth — and their shapes remain undocumented.

## Endpoints — the project

- `GET /api/music-videos`
- `GET /api/music-videos/:id`
- `POST /api/music-videos`
- `DELETE /api/music-videos/:id`

Also mounted at `/api/v1/music-videos`.

## Endpoints — v1 rendering

`/api/v1` **only**, and additive: none of the above changed. The server renders a
whole song from one call, instead of the client calling a clip endpoint per scene.

- `POST /api/v1/music-videos/:id/render` — start one. Body
  `{ modelKey?, aspectRatio?, seed?, trim? }`, all optional; defaults come from the
  project. `202` with the state below plus `pollUrl` and `eventsUrl`.
- `GET /api/v1/music-videos/:id/render` — **the render running for this project**, or
  `404` when none is. Same state payload. Added for JET-198: a jobId is handed out
  once, so a client that loses it (reinstall, new device, a render started from the
  web) needs a supported way back to it.
- `GET /api/v1/music-videos/render/:jobId` — poll one by id.
- `GET /api/v1/music-videos/render/:jobId/events` — SSE, same payload per event.
  Mobile should poll: the stream drops when an app backgrounds.
- `POST /api/v1/music-videos/render/:jobId/cancel` — stops at the next clip boundary;
  work already in flight is paid for and kept.
- `POST /api/v1/music-videos/render/:jobId/clips/:idx/rerender` — `202`; re-renders
  that one clip and re-stitches.

### The state payload

Identical from start, project lookup, poll and every SSE event, so a client needs one
parser.

```jsonc
{ "jobId": "mvr_…", "musicVideoId": "mv_…",
  "status": "rendering",        // queued | anchoring | rendering | verifying
                                // | stitching | completed | failed | cancelled
  "progress": 62,               // 0-100
  "modelKey": "omni", "aspectRatio": "9:16", "concurrency": 6,
  "clipsTotal": 33, "clipsDone": 20, "clipsRefused": 0,
  "anchorsTotal": 34, "anchorsDone": 34,
  "worstSeamScore": 3.2, "seamThreshold": 4.0,   // null until verifying
  "estimatedCostUsd": 24.80,
  "finalVideoUrl": "", "error": "",
  "clips": [{ "index": 0, "status": "done", "durationSeconds": 8,
              "videoUrl": "https://…", "seamScore": 2.9, "error": "" }],
  "updatedAt": "2026-10-23T…" }
```

Clip status is `pending | done | failed | refused`. `refused` means the model declined
it on content grounds and it could not be salvaged; the song still finishes without it.

### Things a client has to know

- **A render is in progress for exactly the statuses that are not terminal.** The
  `409` from a second `POST …/render` and the `404` from `GET /:id/render` are driven
  by one query, so they cannot disagree.
- **Clips complete out of order.** Six render at once; `clips[]` is index-ordered,
  arrival is not.
- **Per-scene progress is also written to the project**, as
  `storyboard[i].clipUrl`, `.clipUrls` and `.status`, which is what v0 clients already
  read. A client can follow a v1 render without reading `clips[]` at all, and no data
  migration is needed to adopt v1 (D-008).
- The storyboard must be saved on the project **before** rendering: the plan is
  derived from it, along with `showLyrics` and `includeClipAudio`.
- One song is ~33 clips and ~$24.80. A one-scene project exercises every phase for
  about $0.80.

## Notes

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
