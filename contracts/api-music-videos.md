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
- `GET /api/v1/music-videos/:id/render` — **the render running for this project, or
  the most recent one that could be picked back up**; `404` when there is neither.
  Same state payload, with `resumable` saying which of the two it is. Added for
  JET-198: a jobId is handed out once, so a client that loses it (reinstall, new
  device, a render started from the web) needs a supported way back to it.
- `POST /api/v1/music-videos/render/:jobId/resume` — `202`; picks a stopped render
  back up from its checkpoints. Valid on `cancelled`, `failed` and `blocked`.
  Everything already rendered is kept, so it costs only what is left.
- `GET /api/v1/music-videos/render/:jobId` — poll one by id.
- `GET /api/v1/music-videos/render/:jobId/events` — SSE, same payload per event.
  Mobile should poll: the stream drops when an app backgrounds.
- `POST /api/v1/music-videos/render/:jobId/cancel` — stops at the next clip boundary;
  work already in flight is paid for and kept.
- `POST /api/v1/music-videos/render/:jobId/clips/:idx/rerender` — `202`; re-renders
  that one clip and re-stitches. Body `{ prompt? }` replaces that clip's prompt — the
  only way out of a refusal, since the provider refuses the same words again.
- `POST /api/v1/music-videos/render/:jobId/stitch` — `202`; assembles a `blocked`
  render as it is, missing shots and all. Deliberate opt-in; `409` on any other status.

### The state payload

Identical from start, project lookup, poll and every SSE event, so a client needs one
parser.

```jsonc
{ "jobId": "mvr_…", "musicVideoId": "mv_…",
  "status": "rendering",        // queued | anchoring | rendering | verifying
                                // | stitching | blocked
                                // | completed | failed | cancelled
  "progress": 62,               // 0-100
  "modelKey": "omni", "aspectRatio": "9:16", "concurrency": 6,
  "clipsTotal": 33, "clipsDone": 20, "clipsRefused": 0,
  "anchorsTotal": 34, "anchorsDone": 34,
  "worstSeamScore": 3.2, "seamThreshold": 4.0,   // null until verifying
  "estimatedCostUsd": 24.80,
  "finalVideoUrl": "", "error": "", "resumable": false,
  "clips": [{ "index": 0, "status": "done", "durationSeconds": 8,
              "videoUrl": "https://…", "seamScore": 2.9, "error": "" }],
  "warnings": [{ "sceneIndex": 3, "reason": "…", "rewritten": "…" }],
  "updatedAt": "2026-10-23T…" }
```

Clip status is `pending | done | failed | refused`. On a `refused` clip, `error` is
written for the person who wrote the prompt, not for a developer — show it.

`warnings` lists scene prompts that were **rewritten before rendering** because the
provider would have refused them. Show them: a storyboard silently rewritten on
someone's behalf is worse than the refusal it prevented.

### `blocked` — a song with holes is not a shorter song

Measured on the first live render: 20 of 31 shots were refused by the provider and the
remaining 11 were stitched anyway, producing a video that holds a frozen frame for
minutes against a full-length track. That looks like it worked, which is worse than
failing.

So a render that finishes with ANY shot missing now ends as `blocked` and is **not
assembled**. `error` names how many shots are missing and what to do. Everything that
did render is kept and paid for once. Three ways out, all the caller's choice:

- re-render the missing shots with edited prompts (`…/clips/:idx/rerender` with `prompt`)
- assemble it as it is (`…/stitch`)
- cancel it

`blocked` is terminal for the workers — nothing resumes it on its own — but it is NOT
"finished": `GET /:id/render` still returns it, and starting a new render on that
project is refused with a `409` until it is dealt with, so a second render cannot
quietly abandon the first one's spend.

### Stopping is not discarding

A render cancelled at clip 8 of 31 still holds 30 anchor stills and 8 clips that were
paid for — on one real render, $6.40 of clips and every still. `cancelled` and
`failed` are terminal for the workers, but they are not finished business, so the
project lookup returns them with `resumable: true` and `POST …/resume` continues from
the checkpoints. Resuming that render costs $18.40; restarting it costs $24.80.

Starting a NEW render is never refused because of one of these — a render somebody
stopped should not stop them starting another. Only an in-progress or `blocked`
render does that.

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
- **Scene prompts are checked and rewritten before any still is drawn.** The provider
  refuses real people's names and likenesses, and the anchor stills are generated from
  these prompts, so a likeness in the text becomes a likeness in the images and then
  every clip pinned to them is refused. Surface `warnings` so the author knows what
  changed.

## Notes

Request and response shapes are not documented yet. All paths mount under `/api`
(`src/index.ts`). Unless noted above, each requires a valid JWT (`requireAuth`) and a
valid HMAC-SHA256 request signature (`requireSignature`).
