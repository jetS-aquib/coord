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
  `{ tier?, modelKey?, aspectRatio?, seed?, trim? }`, all optional; defaults come from
  the project. `202` with the state below plus `pollUrl` and `eventsUrl`.
  `tier` is `demo | standard | hero` — what the song is worth, in a producer's terms —
  and the server resolves it to a model and two spend caps. Omit it and the render
  behaves exactly as it did before tiers existed. `modelKey` stays an engineer's
  control and still wins over the tier; no client needs to know a model id or a price
  per second. JET-243.
  **Also `202 { status: 'reading_lyrics', message }` with no `jobId`** when the song
  has not been read yet and the read takes more than 20s: no render was started, ask
  again (same as brief and song-read, JET-258). Tell the two apart by `jobId`. JET-279.
- `GET /api/v1/music-videos/:id/render` — **the render running for this project, or
  the most recent one that could be picked back up**; `404` when there is neither.
  Same state payload, with `resumable` saying which of the two it is. Added for
  JET-198: a jobId is handed out once, so a client that loses it (reinstall, new
  device, a render started from the web) needs a supported way back to it.
- `POST /api/v1/music-videos/render/:jobId/resume` — `202`; picks a stopped render
  back up from its checkpoints. Valid on `cancelled`, `failed`, `blocked` and
  `paused`. Everything already rendered is kept, so it costs only what is left.
  **Valid the instant a render stops**, even though the shots already in flight keep
  landing for up to a couple of minutes: the resume is accepted (`202`), the payload
  reads `resumeQueued: true` with status still `paused` (or `cancelled`), and the render
  moves to `queued` by itself once they have landed. Repeating it is harmless; a
  `cancel` in that window withdraws it. JET-249.
- `GET /api/v1/music-videos/render/:jobId` — poll one by id.
- `GET /api/v1/music-videos/render/:jobId/events` — SSE, same payload per event.
  Mobile should poll: the stream drops when an app backgrounds.
- `POST /api/v1/music-videos/render/:jobId/cancel` — stops at the next clip boundary;
  work already in flight is paid for and kept. Ends the render.
- `POST /api/v1/music-videos/render/:jobId/pause` — `202`; same stop, but the render is
  **not** over: status becomes `paused` with `resumable: true`, and `…/resume`
  continues it from the per-clip checkpoints. Only while the render is drawing
  (`anchoring`, `rendering`, `verifying`) — `409` elsewhere, naming the status, because
  before that cancelling is free and after it every clip is already paid for. JET-242.
- `POST /api/v1/music-videos/render/:jobId/clips/:idx/rerender` — `202`; re-renders
  that one clip and re-stitches. Body `{ prompt? }` replaces that clip's prompt — the
  only way out of a refusal, since the provider refuses the same words again.
  **Or `{ action }` (JET-301)**: the creator's own line for what the shot shows, in the
  words the call sheet's `row.action` uses (cast names are fine, max 400 chars). Works
  on a `completed` render, for a shot that came out wrong: the shot's size, move and
  framing are kept, the line goes through the safety pass, its opening still is redrawn
  from the new words, then only that shot renders and the song is re-stitched. Costs one
  still and one clip. The render goes `queued` → … → `completed` with a new
  `finalVideoUrl`; the cut into that shot becomes a hard cut, since the previous shot
  still ends on the old still. Recorded as an override; no other shot changes.
- `PATCH /api/v1/music-videos/render/:jobId/clips/:idx` — `200`; changes one call-sheet
  row before filming, free. Body: any of `{ action, shotSize, lane, musicalSeconds }`.
  `action` (JET-301) replaces what the shot shows with the creator's words, as above,
  but nothing is drawn yet. If the safety pass had to rewrite it, the change is in
  `warnings` for that shot. `409` once filming has started: use `…/rerender` then.
  `GET …/call-sheet` rows carry `action` (the current line, in names) to pre-fill the box.
- `POST /api/v1/music-videos/render/:jobId/clips/fix` — `202`; fixes several missing
  shots of a `blocked` render in one go. Body `{ clips: [{ index, prompt }] }` (1–100).
  Sets each prompt, re-renders only those shots, then stitches as usual. `409` unless
  the render is `blocked`; `400` naming the shot if one is listed twice, does not exist,
  or is not missing (`refused`/`failed`) — re-doing a rendered shot is `…/rerender`.
  Only the listed shots are retried; a missing shot left out stays missing (JET-286,
  it used to retry every `failed` shot too). A listed shot whose words changed gets its
  opening still redrawn from the new words first. JET-250, JET-286.
- `POST /api/v1/music-videos/render/:jobId/stitch` — `202`; assembles a `blocked`
  render as it is, missing shots and all. Deliberate opt-in; `409` on any other status.
- `GET /api/v1/music-videos/:id/song-read` — what the song is doing: `bpm`,
  `beatsPerBar`, `downbeats[]`, `energy[]` (one per bar, 0-1) and `sections[]` with
  their timed lines. The same read the planner cuts to, so a screen showing it and a
  render using it cannot disagree. `sections` may be `[]` (JET-299): a short or wordless
  track where no words were heard still has a tempo, and answers `200` with its `bpm`,
  `downbeats` and `energy` — draw the tempo, and say plainly that no words were heard.
  `404` only when there is no read at all (no tempo found, or the read is unavailable).
  Either way the render falls back to duration packing when there are no sections.
  JET-206, JET-299.
- `POST /api/v1/music-videos/song-read` — the same read keyed on the audio instead of
  a project. Body `{ audioUrl }`. For the screen between upload and the brief, where
  no project exists yet and creating a draft one would put a row in the Library for
  every abandoned file. POST, not GET: a signed audio URL does not belong in a query
  string or an access log. Same body and same `404` as the route above. JET-214.
  Both song-read routes also return `edited: boolean` — true when this caller's
  corrected lyrics (below) replaced some lines. JET-266.
  Each line may also carry `roman`: the line in Roman letters, as the captions burn it
  (from video-processing-backend, JET-268). Absent for Latin-script songs, for reads
  made before it, and on any line the caller corrected — a correction replaces both
  `text` and `roman`. Sending a line back as its own `roman` is not a correction. JET-269.
- `GET /api/v1/music-videos/direction-options` — the guided choices the app draws:
  `{ story, cast, place, mood }`, each `[{ id, label }]`. The prompt text behind an id
  is ours and never sent. `look` is not here: it is the app's own visual-style id. JET-272.
- Guided direction on the project (`POST /api/music-videos`, the save). Optional
  `direction: { directorId?, story: performance|mixed|story, cast: solo|duo|band|crowd,
  place: city_night|nature|stage|home|road|fantasy, mood: euphoric|romantic|dark|
  nostalgic|defiant|calm, look: string<=64, special?: string<=300 }`; `null` clears it,
  absent keeps it, an unknown id is a 400. When present it replaces `directionPrompt`
  in the treatment, shot list, script and casting prompts, as fixed text per id (same
  object, same text); `story` sets the performance share and `cast` the cast size, over
  the director's defaults. A project with only `directionPrompt` renders as before. JET-272.
- `POST /api/v1/music-videos/brief` now also returns `ranked: { story, cast, place,
  mood }`, each the group's option ids, best fit for the song and director first (the
  first is the recommendation); always every id, catalogue order if the model did not
  rank. `questions` and `pitch` are unchanged. When a `pitch` is returned, the first id
  of each group is the option that pitch describes (the model declares it and we promote
  it), so a preselection never contradicts the director's sentence. Direction-option
  labels are the app's own wording (story: The artist performing / Performing and story /
  A story with actors; cast: Just one / Two / Three or four / A crowd); ids are the
  contract. JET-272.
- `POST /api/v1/music-videos/special/understand` — understands the optional special
  request before a render. Body `{ special (<=300), answer?: { key?, optionId?, text? (<=200) },
  language? }`. Returns `{ understood, kind: named_title|genre|era|aesthetic|person|brand|plain,
  reference, wants: title_itself|genre|look|unsure, needs: [{ key, question, options:
  [{ id, label }], recommended }], recommendation: { ingredients, reason } | null }`.
  A named title, person or brand whose intent is unclear returns ONE `needs` (3-4
  options, `recommended` is an option id) and no recommendation; call again with `answer`
  (an option id or the creator's own words) to get `recommendation`: the reference as
  filmable ingredients, never containing the name, plus a one-line plain reason. Anything
  else returns its `recommendation` at once, and `plain` returns neither. A named
  reference always gets a question or a recommendation: if the model's question is
  unusable, a fixed one comes back (`Like <reference> how?`, ids look_and_colour,
  action_and_pace, genre, all_of_it; English). `reference` is only words from the request.
  The call is output-capped, low-temperature and retried once on an unparsable answer. `understood:
  false` means the call failed and nothing was checked: the request goes as written
  and `promptSafetyV1` still rewrites names. Costs one text call, no render charge.
  The app stores the accepted text as `direction.ingredients` (<=600); when set it is
  baked in place of `special`, so the title never reaches a prompt. The brief/treatment
  `needs[]` and the render review hold are NOT built yet. JET-273.
- **Ownership (JET-278).** The legacy project routes (`GET /`, `GET /characters`, `GET /:id`,
  `POST /`, `DELETE /:id`) act only on the signed-in caller's projects. The caller is the
  token's user; a `userId` in the query or body is ignored. Someone else's project id answers
  `404` (like a missing one) on get, save and delete, and nothing is changed or removed; a
  save to another user's id is a `404`, not a takeover. `GET /` and `GET /characters` no
  longer accept `?userId=` for another user. Missing token is `401` (was `400 userId is
  required`). The share routes were already owner-only.
- `POST /api/v1/music-videos/estimate` — price per tier before anything is planned.
  Body `{ audioUrl | seconds, aspectRatio? }` (`seconds` wins; `aspectRatio` is
  accepted and changes nothing today). Returns `{ seconds, tiers: [{ tier, floor,
  ceiling, currency: 'USD' }] }` for demo, standard and hero. No LLM call, so cheap to
  call on every screen open. A plan's real range lands inside it for a typical cut; the
  call sheet's figure remains the one to quote once a plan exists. `202 reading_lyrics`
  as song-read when `audioUrl` is new; `422` when its length cannot be read. JET-271.
- `PUT /api/v1/music-videos/lyrics` — the creator's corrections to the read's words.
  Body `{ audioUrl, lines: [{ start, end, text }] }`, 0-400 lines, `text` 0-300 chars.
  Text only: each line carries the `start`/`end` the song read gave it, unchanged, and
  is matched back on those. `text: ''` removes the line; a read line not sent stays as
  heard. Stored on the song read as one entry per user (a library track is shared between people), so it
  never changes anyone else's read. From then on that user's song-read, brief and
  render (planner lines, `MusicVideo.lyrics`) use the corrected words. `lines: []`
  clears them. `404` if the song has not been read yet. Returns `{ success, edited, restitching }`.
  JET-266. Since JET-308 the captions burn them too: every render reads this user's
  corrections when it stitches, so a correction saved while it films is in the video.
  And every **finished**, captioned render of this user on that song is stitched again
  in the background with the new words (`restitching` = how many were queued; a render
  whose words did not change returns at once). No shot is re-filmed. The current
  `finalVideoUrl` stays until the new one lands, and stays if the re-stitch fails;
  the render state shows `captionsUpdating: true` meanwhile, then a new `finalVideoUrl`.
- `DELETE /api/v1/music-videos/lyrics` — body `{ audioUrl }`; back to what was heard.
  Returns `{ success, edited: false, restitching }`, re-stitching as above. JET-266, JET-308.
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
                                // | stitching | blocked | paused
                                // | completed | failed | cancelled
  "progress": 62,               // 0-100
  "captionsUpdating": false,     // true while a finished video is re-stitched with corrected lyrics (JET-308)
  "modelKey": "omni", "tier": "standard",   // demo | standard | hero
  "aspectRatio": "9:16", "concurrency": 6,
  "clipsTotal": 33, "clipsDone": 20, "clipsRefused": 0,
  "anchorsTotal": 34, "anchorsDone": 34,
  "worstSeamScore": 5.4, "seamThreshold": 9.0,   // null until verifying
  "estimatedCostUsd": 26.01,     // the floor: clips + stills, nothing re-done
  "costCeilingUsd": 31.84,       // the most this tier's allowances can add
  "discardedSeconds": 4.0,       // generated, then cut off at assembly (D-027)
  "finalVideoUrl": "", "error": "", "resumable": false,
  "resumeQueued": false,         // resume pressed, waiting on in-flight shots (JET-249)
  "plateUrl": "https://…",      // the reference sheet the stills were drawn against
  "clips": [{ "index": 0, "sceneIndex": 0, "status": "done", "state": "finalized",
              "durationSeconds": 8, "videoUrl": "https://…",
              "openingFrameUrl": "https://…",   // the still this clip opens on
              "sectionLabel": "chorus", "startSeconds": 41.74, "musicalSeconds": 5.217,
              "seamScore": 5.4, "seamScores": [8.1, 5.4], "attempts": 2,
              "error": "" }],
  "warnings": [{ "sceneIndex": 3, "reason": "…", "rewritten": "…" }],
  "stage": "filming", "stageCount": 12, "stageTotal": 31,
  "updatedAt": "2026-10-23T…" }
```

`anchoring` and `rendering` overlap (JET-296): a shot starts as soon as the two key
frames it is pinned to are drawn and checked, so the status turns `rendering` while
`anchorsDone < anchorsTotal`. Keep showing key-frame progress until they are equal.

Clip status is `pending | generating | done | regenerating | failed | refused`, and
`state` is what to actually put on a tile: `queued | generating | checking |
regenerating | finalized | failed | refused`. Use `state`, not `status` — `done` means
the clip has a video, not that it is finished, because a bad seam re-renders it.
Deriving that in each client is how two clients come to disagree.

On a `refused` clip, `error` is written for the person who wrote the prompt, not for a
developer — show it.

A `refused` clip also carries `refusal` (null on every other clip). JET-250:

```jsonc
"refusal": {
  "cause": "real-person",          // real-person | copyright | content
  "suggestedPrompt": "A pop singer in her thirties on a stadium stage, …"  // or null
}
```

`cause` is for picking an icon or a headline; `error` stays the sentence to show.
`suggestedPrompt` is a rewrite of the clip's `prompt` that changes as little as it can
to get past the provider — pre-fill an editable field with it, never send it unseen.
It is written when the render goes `blocked` (one text call for all refused shots), so
it may be null for a moment on a clip still refusing mid-render, and stays null when
no rewrite could be had: fall back to the current `prompt` then.

Every **missing** shot (`failed` or `refused`) also carries `failure` (null on every
other clip). It is the one object a fix screen needs, for both kinds. JET-286:

```jsonc
"failure": {
  "cause": "no_video",       // refused | timeout | no_video | quota | error
  "likelyReason": "The video service sent nothing back for this shot. …",  // show it
  "prompt": "close shot, slow push in. @image1 looks up at the rain. …",    // the line to edit
  "sentPrompt": "… the line, plus location, cast, look and fixed instructions",  // what the model got
  "suggestedPrompt": "close shot, slow push in. A young woman looks up …"   // or null
}
```

- `prompt` is what a fix replaces; pre-fill the editable box with `suggestedPrompt`.
- `sentPrompt` is read-only context ("what we asked for"); never send it back as the fix,
  it already contains text the server adds again.
- `suggestedPrompt`: for `refused` and `no_video` (usually a silent safety filter) a
  rewrite, or null while none has been written yet or none could be had; for `timeout`,
  `quota` and `error` the shot was fine as written, so it is `prompt` itself.
- On a `failed` clip `error` is now the same plain sentence as `likelyReason` (it used to
  be the provider's raw message). The raw message stays on the server.
- A fix that changes a shot's words also redraws its opening still from the new words
  before re-rendering it. Only the shots listed in `…/clips/fix` are retried; a failed
  shot left out of the list stays failed.

### Directors

`GET /api/v1/music-videos/directors?language=&audioUrl=&title=` → `{ defaultId, directors: [{ id, name, intro, knownFor, avatarUrl, traits }] }`.
Seven directors since JET-289: the three general ones (`stays-close`, `fills-floor`,
`holds-frame`) and four regional ones (`punjabi-pop` Jassi, `bollywood` Rohan,
`devotional` Gauri, `indie-hindi` Neel). Ids are stable. All seven have a portrait since JET-304
(512x512 webp); keep the monogram for `avatarUrl: ''`, which a future director may
still send before its art ships.

With `audioUrl` (the song picked, as sent to song-read; `title` optional), the list is
ordered for that song: the regional directors whose music it is first, then the general
three, then the other regional ones, and `defaultId` is the best match (pre-select it).
Only a song the server has already read is ranked. Since JET-305 the server works out
where the song is from as soon as it reads it, so this is normally instant once song-read
has answered (a few seconds after, the first time); otherwise, or if working out where
the song is from takes over 8s the first time, the plain order and `stays-close` come
back. The answer is cached per song, so asking again is instant.

### Where the song is from

The render summary carries `songContext` (JET-288): where the planner decided the song
comes from, researched once before casting. The cast, wardrobe and places are chosen to
fit it. Null until casting, or when nothing could be worked out (most English pop).

```jsonc
"songContext": { "language": "Punjabi", "region": "Malwa, Punjab", "community": "…", "confidence": "high" }
```

Show it on the call sheet ("Set in Malwa, Punjab"), only when `confidence` is not `low`.
If it is wrong, the fix is the creator's own direction text: what they ask for always wins.

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

`warnings` is on every state (not only `blocked`) and is `[]` until the direction pass
has run.

`stage`, `stageCount`, `stageTotal` say what the render is doing right now, for a
one-line narration (JET-274). `stage` is one of `reading_song`, `writing_shots`,
`casting`, `drawing_frames`, `filming`, `checking`, `cutting`, `lyrics`, `polishing`,
`uploading`; the names are ours and the app words them. A fresh render moves
`reading_song` → `casting` → `writing_shots` → `drawing_frames` → `filming` → `checking`
→ `lyrics` → `cutting`. `polishing` and `uploading` are reserved and never sent today:
the stitch is one remote call we cannot see inside. `stageCount` / `stageTotal` are
derived from the plan on every read: filming = clips done / clips, drawing_frames =
frames drawn / frames, writing_shots = null / shots; otherwise null. `stage` is `""` when
the render is `completed`, `failed`, `cancelled`, `review`, `blocked` or `paused`. Old
clients ignore all three.

### `blocked` — a song with holes is not a shorter song

Measured on the first live render: 20 of 31 shots were refused by the provider and the
remaining 11 were stitched anyway, producing a video that holds a frozen frame for
minutes against a full-length track. That looks like it worked, which is worse than
failing.

So a render that finishes with ANY shot missing now ends as `blocked` and is **not
assembled**. `error` names how many shots are missing and what to do. Everything that
did render is kept and paid for once. Three ways out, all the caller's choice:

- fix the missing shots with edited prompts, all at once (`…/clips/fix`) — each refused
  shot carries a cause and a suggested prompt to start from
- re-render one missing shot with an edited prompt (`…/clips/:idx/rerender` with `prompt`)
- assemble it as it is (`…/stitch`)
- cancel it

`blocked` is terminal for the workers — nothing resumes it on its own — but it is NOT
"finished": `GET /:id/render` still returns it, and starting a new render on that
project is refused with a `409` until it is dealt with, so a second render cannot
quietly abandon the first one's spend.

### Stopping is not discarding

`cancel` ends a render; `pause` holds it. Both stop dispatching at the next unit
boundary and both let the clips already in flight land and keep them, because that work
is paid for either way — the difference is what is true afterwards. A `paused` render is
one somebody is still watching: it is not terminal, nothing sweeps it, a deploy does not
restart it, and `…/resume` continues it for the price of the clips that were never
started. That is the whole point of it — watching a plan go wrong at shot 9 used to mean
cancelling, and the only thing on offer after cancelling was paying for all 45 again.
Starting a new render on that project is refused with a `409` while one is paused, for
the same reason `blocked` refuses it: resume it or cancel it first, so a second render
cannot quietly abandon the first one's spend.

A render cancelled at clip 8 of 31 still holds 30 anchor stills and 8 clips that were
paid for — on one real render, $6.40 of clips and every still. `cancelled` and
`failed` are terminal for the workers, but they are not finished business, so the
project lookup returns them with `resumable: true` and `POST …/resume` continues from
the checkpoints. Resuming that render costs $18.40; restarting it costs $24.80.

Starting a NEW render is never refused because of one of these — a render somebody
ended should not stop them starting another. Only an in-progress, `blocked` or `paused`
render does that.

### What a tier changes, and what it cannot

A song's base cost is its length times a price per second, and the length is the song's
— no tier makes a four-minute track shorter. What a tier sets is the only part of a
render whose size is a choice: what is spent checking the work and doing it again.

| tier | re-renders it will pay for | continuity checks | 31-clip song |
| --- | --- | --- | --- |
| `demo` | none | off | $26.01 flat |
| `standard` | a fifth of the clips, at least one | on | $26.01–$31.84 |
| `hero` | half the clips | on | $26.01–$39.04 |

`standard` is what every render did before tiers existed, down to the arithmetic, which
is what makes omitting `tier` safe.

**All three resolve to `omni` today.** It is the only model the v1 pipeline can render,
so the tier is not yet a choice of model — `demo` on a cheaper provider is where the
real difference in money is, and it needs that provider wired into the clip path
first. The field is read, not assumed, so the day a second model is renderable the
change is one row.

**Both numbers are available before anything is bought**, on the state payload and on
the call sheet the review gate shows (D-051): they are arithmetic over a plan that
already exists, not a forecast. `estimatedCostUsd` is a floor and `costCeilingUsd` is a
ceiling; on `demo` they are the same number.

### How the cost is arrived at

`estimatedCostUsd` **changed meaning on 2026-11-04** and went up by about a dollar a
song: it used to be the clips alone and it is now every line of the bill with a
published rate. The clips were 95% of a render, which is why one line passed for the
whole thing for so long. D-069.

The call sheet carries the itemised version as `cost`, and every line states where its
figure comes from:

| line | 31-clip song | basis |
| --- | --- | --- |
| clips | 248s at $0.10/s = $24.80 | `published` — provider rate × a count we know |
| stills | 36 images at $0.0336 = $1.21 | `published` — 32 anchors, 1 plate, 3 cast portraits |
| planning calls | 3 text calls | `metered` — per token, logged per call, not forecast |
| continuity checks | 63 vision calls | `metered` — same |
| song read, transcription, seams, stitch | — | `ours` — video-processing-backend (D-014) |

Only the `published` lines are in the totals, and `cost.excludes` names the ones that
are not, so a total is never read as the whole bill. The metered lines are deliberately
not estimated: they are priced per token, a long song costs several times a short one,
and a plausible-looking figure that turns out wrong is worse than a line that says
"measured, not predicted". Their call counts are exact, and every call is already
recorded with its real cost by `tokenLogger` into `GenerationLog`.

### Things a client has to know

- **A render is in progress for exactly the statuses that are not terminal.** The
  `409` from a second `POST …/render` and the `404` from `GET /:id/render` are driven
  by one query, so they cannot disagree. `blocked` and `paused` are the two
  non-terminal statuses with nothing actually running: both are waiting on a person,
  and both answer that `409` with what to do about it.
- **The SSE stream ends on `paused`**, as it does on the terminal statuses. The clips
  still in flight land on the plan afterwards; read them from the poll route. Streaming
  past a pause would send `rendering` events to a client that had just been told
  `paused`.
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
