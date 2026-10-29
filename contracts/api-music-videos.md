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
- `GET /api/v1/music-videos/:id/song-read` — what the song is doing: `bpm`,
  `beatsPerBar`, `downbeats[]`, `energy[]` (one per bar, 0-1) and `sections[]` with
  their timed lines. The same read the planner cuts to, so a screen showing it and a
  render using it cannot disagree. `404` for an instrumental or when the read is
  unavailable — there is nothing to draw, and the render falls back to duration
  packing. JET-206.
- `POST /api/v1/music-videos/song-read` — the same read keyed on the audio instead of
  a project. Body `{ audioUrl }`. For the screen between upload and the brief, where
  no project exists yet and creating a draft one would put a row in the Library for
  every abandoned file. POST, not GET: a signed audio URL does not belong in a query
  string or an access log. Same body and same `404` as the route above. JET-214.
- `POST /api/v1/music-videos/transcript/warm` — `202` and nothing else. Body
  `{ audioUrl }`. Not project-scoped, because the point is that it is called at
  **upload**, before a project exists. Fire and forget: nothing depends on it, nothing
  waits for it, and it never fails the caller. JET-208.

#### Warming the transcript

Whisper costs 99s of cold model load the first time a process touches it, and 6.2s
after. There are three triggers for it now, each only making the next cheaper:

1. this route, at upload — minutes before a render, while the user reads the brief
2. the render's own prefetch, at `startRenderV1` (JET-201)
3. the stitch, inline, which is where it was before any of this

A client that never calls the first is identical to today. Calling it twice for the
same audio runs Whisper once: the transcript is cached on the audio's bytes (D-021).
It warms unconditionally, since `showLyrics` is not known at upload time — one
Whisper run against a 24h cache is the better side of that trade.

The words themselves are kept when the transcription answers, in `TranscriptV1` keyed
on the audio URL, and copied onto `MusicVideo.lyrics` when a render is planned for a
project that has none of its own (D-030). video-processing-backend's copy is a cache —
24 hours, 64 entries — so this is the durable one. Anything the user typed wins; this
only fills a gap.

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
  "worstSeamScore": 5.4, "seamThreshold": 9.0,   // null until verifying
  "estimatedCostUsd": 24.80,
  "discardedSeconds": 4.0,       // generated, then cut off at assembly (D-027)
  "finalVideoUrl": "", "error": "", "resumable": false,
  "plateUrl": "https://…",      // the reference sheet the stills were drawn against
  "clips": [{ "index": 0, "sceneIndex": 0, "status": "done", "state": "finalized",
              "durationSeconds": 8, "videoUrl": "https://…",
              "openingFrameUrl": "https://…",   // the still this clip opens on
              "sectionLabel": "chorus", "startSeconds": 41.74, "musicalSeconds": 5.217,
              "seamScore": 5.4, "seamScores": [8.1, 5.4], "attempts": 2,
              "error": "" }],
  "warnings": [{ "sceneIndex": 3, "reason": "…", "rewritten": "…" }],
  "updatedAt": "2026-10-23T…" }
```

Clip status is `pending | generating | done | regenerating | failed | refused`, and
`state` is what to actually put on a tile: `queued | generating | checking |
regenerating | finalized | failed | refused`. Use `state`, not `status` — `done` means
the clip has a video, not that it is finished, because a bad seam re-renders it.
Deriving that in each client is how two clients come to disagree.

On a `refused` clip, `error` is written for the person who wrote the prompt, not for a
developer — show it.

### Pictures before there is video

A render draws every anchor still before it renders a single clip, which is minutes of
a progress sentence and nothing else. Those stills are already paid for, so they are on
the wire (JET-205):

- `plateUrl` — one six-panel reference sheet of the cast and the location for the whole
  song, drawn first and used to keep every still consistent (JET-203).
- `clips[].openingFrameUrl` — the still that clip was pinned to open on. Anchor `i` is
  clip `i`'s opening still; the mapping is done here so no client repeats it.

Both are `""` until drawn. A still is what the shot is **aiming at**, not what
rendered — replace it with the clip's own frame once `videoUrl` lands.

### Cuts come from the song now

A render plans its clips from the song's own structure when one can be read: a scene
is a section, a clip is a whole number of bars chosen by that bar's energy, and the
opening shot of the loudest section holds a bar longer. `durationSeconds` is what the
model was asked to generate; `musicalSeconds` is how much of it the music wants, and
the difference is trimmed at assembly (D-031, D-027). `sectionLabel` is a guess and
`startSeconds` is not — show the boundaries, be careful with the names.

Both are `null`, and `sectionLabel` `""`, on a render cut the old way: an instrumental,
a song whose read was unavailable, or a plan made before this existed. That fallback
is deliberate — the musical cutting can fail without the render failing.

`discardedSeconds` is video that is generated and then trimmed away, because the
music asks for lengths no model offers. It is part of what the render costs, so it is
reported rather than hidden — that was the condition D-027 was taken under. Measured
on a real 4:16 track at 80 BPM: 259s generated for 255s of music, so 4s. `0` on a
render cut by duration.

`seamScore` is a continuity measurement and only exists where continuity is wanted.
A clip whose next clip starts a new **scene** is not pinned to that scene's opening
still and is not scored against it — two shots that match across a cut read as a jump
cut, and asking a four-second clip to arrive at the next scene then charging it for a
re-render when it does not is money spent making the video worse (JET-210). The
distance across the cut is still measured and stored on the plan as `breakScore`, but
nothing acts on it yet and it is not on the wire: there is no measured band for "too
similar across a cut", and picking a threshold before measuring one is what the old
4.0 cost.

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
