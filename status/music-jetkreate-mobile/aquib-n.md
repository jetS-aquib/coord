# music-jetkreate-mobile — aquib N

- **Current task:** 7B is scoped and closed out for now — D-041, no mobile work, no ticket. Session is on the live end-to-end render, which needs a person with the phone.
- **Status:** waiting on human
- **Blockers:** the render itself. Both backends, Metro and the tree are ready; it needs a tap on the device and a short track. Still unanswered until then: the `[reel]` lines that say WHY the reel stalls, and whether the black strip tiles are a decode failure or a genuinely black frame at SAMPLE_AT = 1.
- **Last updated:** 2026-10-29T17:58:00+05:30

> Note: this per-person file had not been written since 2026-10-21 and the
> entries below it are auto-generated. The substantive handoff notes for
> 2026-10-21 and 2026-10-22 — durable runs, retry, resume, the design pass,
> JET-194/196 — went to `.coord/status/music-jetkreate-mobile.md` instead.
> Read that one too; the two should probably be reconciled.

## Handoff notes

### 2026-10-29T17:58:00+05:30 — 7B scoped, answered and closed. D-041. Nothing built.

**7B needs nothing from this repo yet, and that is the finding, not a punt.**
The 18:05 note's scoping question was asked and answered: show nothing. No
ticket was filed to music-jetkreate-backend and no gate field was asked for.
The reasoning is **D-041**; read that rather than re-deriving it.

Three things settled it, two of which the earlier note had not checked:

1. **The gate has never run live.** `music-jetkreate-backend/aquib-n.md` at
   17:50 today: built, unit-tested, uncommitted, never run on a render. So the
   distribution D-040 and JET-222 step 2 both wait on does not exist, and the
   18:05 note's own test — "if it fires on two anchors in forty-six, (1) is
   right" — has no reading yet.
2. **The wire claim holds.** `api-music-videos.md` lines 88-110 carry
   `anchorsTotal/anchorsDone` and per clip `state`, `openingFrameUrl`,
   `seamScore`, `sectionLabel`, `error`. No gate field in any contract.
3. **Option 2 was framed against the wrong phase.** 7B.1 runs inside
   `renderAnchorsV1`, during status `anchoring`, before any clip renders. So a
   redraw is not "a shot quietly takes three times as long" — the strip is fed
   by `state.clips` from the first poll, every tile sits on the `clock` glyph
   through that whole phase anyway, and a redrawn anchor is just a tile whose
   still arrives late under "Setting the look. N of 46 key frames." That is a
   far quieter symptom than assumed, which is what made option 1 cheap.

D-041 also records the part worth carrying forward: **7B.2/7B.3 may need no new
field at all.** They act on clips during `rendering`/`verifying`, where
`checking` and `regenerating` already exist on the wire and the strip already
draws both. What would be missing there is a reason, not a state.

**Revisit trigger, named so nobody re-asks:** the first render with
`RENDER_FRAME_GATE` on. Whoever runs it brings the fire rate back to D-041.

#### Where the session went after that: the live render

Everything that can be ready without a phone is ready. Verified, not assumed:

- **music-jetkreate-backend up on :5006**, running natively (not Docker —
  `docker ps` is empty). `/api/health` ok, mongo connected;
  `/api/health/providers` has google and magicroll configured, byteplus not.
- **video-processing-backend up on :5005**, also native. `/api/v1/health` 200.
  Note this re-opens **JET-196** differently: its blocker was "the container on
  :5005 is a pre-fix image", and there is no container — it is running from
  source. ffprobe a new master for 1080x1920 and it can probably be closed.
- **Metro already running on 8081** (pid 17200, not started by this session, so
  its `[reel]` output goes to whoever owns that terminal — watch it there). I
  started a second one by mistake, it took 8082, and I killed it. One Metro.
- **Tree clean, `npx tsc --noEmit` silent, 12 commits ahead of `main`,
  nothing pushed.** `.env.local` points the device at `192.168.2.173:5006`,
  which still matches this Mac's en0 — no stale-IP problem.
- `coord devsetup --hooks` is **still not run** — the sandbox refuses to
  install git hooks. One command, yours to run; commits keep landing without
  the ticket prefix until it is.

**What the render has to answer, in the order it answers them** — the 18:05
note's items 1-3 all fall out of one good run:
planning -> stills -> strip -> collage -> finished video autoplaying; then
whether `[reel]` shows a clip finishing with no `playToEnd` (an expo-video
platform bug worth a decision record); then whether shots 9/10 come back black
with no `[thumbnail]` warning, which would make `SAMPLE_AT = 1` in
`lib/thumbnails.ts` too early. Do not move that constant on a hunch.

Use a short track. A full song is ~31 shots and ~$24.80; the backend's own
estimate for a 30s trim across a section boundary is $2-3.

### 2026-10-29T18:05:00+05:30 — START HERE FOR BATCH 7B

**Do not write any code in your first hour. 7B has no mobile scope yet — work
that out, agree it, and file the tickets. The rest of this note is what you
need to do that and nothing more.**

#### What 7B is

A continuity supervisor in the render pipeline. It is the backend's batch, not
ours; the question for this repo is what a person on a phone is shown of it.
The rows, read off the backend source rather than a plan document (there is no
7B doc on the board — `grep -rn "7B\." music-jetkreate-backend/src` is where
they live):

| Row | What it does | State |
|---|---|---|
| 7B.1 | a vision model reads every anchor STILL against that shot's stated constraints before a clip is pinned to it | **shipped** 2026-10-29, `frameGateV1.ts` |
| 7B.2 | samples 2-3 frames of each FINISHED clip and judges them the same way | not built; wants JET-222 |
| 7B.3 | compares the person in shot N against shot N-1 | not built |
| 7B.4 | one redraw with the failure sentence appended to the prompt | in 7B.1 |
| 7B.5 | every verdict written to `RenderPlanV1.anchors[].gate` | in 7B.1 |
| 7B.6 | the redraw spend is capped per render | in 7B.1 |

Read **D-040** before anything else — it is the whole philosophy of the gate
(spend on what you can count, record what you can only judge) and it tells you
which verdicts are real decisions and which are just data. Then **JET-222**
(backend -> video-processing-backend, filed, not yet approved), which is the
clearest statement of where 7B is going next.

#### The one thing I checked that decides our scope

**Gate verdicts do not reach the client.** 7B.5 records five verdicts per
anchor on `RenderPlanV1`, and the v1 render state this app polls carries
`state`, `seamScore`, `error`, `openingFrameUrl` and `sectionLabel` per clip —
no gate field at all. So today a still can be judged wrong and redrawn and the
person watching the strip sees nothing: the shot simply takes longer.

That is the scoping question, and it is a product question before it is a
technical one. **Do not answer it alone — ask.** The honest options:

1. Show nothing. The gate is quality control and silent success is correct.
2. Show the redraw while it happens, in the strip, the way shot state already
   is. Needs a field on the wire -> a ticket to music-jetkreate-backend.
3. Show the verdicts after the fact, somewhere like `blocked-decision.tsx`,
   which already exists for clips the provider refused and is the closest
   thing we have to this.

My read, for what it is worth and not as a decision: (2) is the one that fits
what this screen is for — someone watches the strip for twenty minutes and a
shot that quietly takes three times as long is the most confusing thing on it.
But the backend has not run a render with the gate on yet, so nobody knows how
often it fires. **If it fires on two anchors in forty-six, (1) is right and we
should not build anything.** Wait for that distribution before filing; D-040
says it is coming and JET-222's plan step 2 is the render that produces it.

#### How to start, in order

1. `coord show JET-222`, read D-040, D-034, D-037. Skim
   `music-jetkreate-backend/src/services/render/frameGateV1.ts` — the file
   header is the best description of 7B that exists.
2. Ask the dev which of the three options above we are doing, and whether the
   gate has been run live yet. Do not guess; this is the kind of thing that
   gets built twice.
3. **File the tickets then, and only then.** Anything that needs a field on
   the wire is a ticket to music-jetkreate-backend before any screen work —
   `coord new --from music-jetkreate-mobile --to music-jetkreate-backend`,
   with Understanding and Plan filled in. Do not start the screen while the
   ticket is waiting.
4. Nothing in 7B blocks us, so if the answer is "wait", pick up the unfinished
   business below instead. That is the better use of the session.

#### Unfinished business in this repo, in priority order

1. **THE LIVE RENDER HAS STILL NOT HAPPENED END TO END.** Everything in 7A is
   committed and unverified. Six requests are sitting in review waiting on it:
   JET-213, JET-216, JET-217, JET-218, JET-220, JET-221. One good render on a
   device closes most of them. This is the highest-value thing in the repo and
   it has been next for four days.
2. **The reel logs.** `shot-reel.tsx` now prints `[reel] ...` in dev. We added
   a watchdog so it can no longer freeze, but we never learned WHY `playToEnd`
   stops arriving on iOS when an Android emulator is fine. One render with
   Metro attached answers it. If the logs say the clip finished and no event
   came, that is an expo-video platform bug worth writing down as a decision.
3. **Black strip tiles.** Shots 9 and 10 rendered black while unrendered shots
   showed their stills. If there is no `[thumbnail]` warning for them, the
   decode worked and returned a genuinely black frame — `SAMPLE_AT = 1` in
   `lib/thumbnails.ts` is then too early. One constant, but confirm from the
   logs rather than moving it on a hunch.
4. **JET-214 and JET-194** are ours, filed, still waiting on the backend.
   JET-194 in particular is the root of every media bug this week.

#### What landed today, so you do not re-read the diffs

`v1-render-and-design-pass`, 9 commits ahead of main, nothing pushed:
`ad12f33` JET-216 (four inputs — note: no ticket prefix, the
prepare-commit-msg hook is not installed here, run `coord devsetup --hooks`),
`ee2b027` JET-218+JET-217, `7bb20c9` dev-build config, `4077ed5` JET-220,
`dfa3233` JET-221, `f320ed4` the three device bugs.


### 2026-10-29T17:30:00+05:30

First real device run (iPhone 15 Pro, dev build) found three bugs, all fixed,
none of them where the symptom pointed.

- REEL FROZE AT 2/28. `replaceAsync` has no deadline and the "already loaded"
  mark is set before the await, so the documented stall-instead-of-fail of this
  media host retired the reel permanently. Now raced against
  PLAYBACK_TIMEOUT_MS, which turns a hang back into a retry.
- NO SOUND. The app never called `setAudioModeAsync`, so iOS used its own
  default `soloAmbient` — silenced by the ring switch, which on a 15 Pro is the
  Action Button. One call at the root with `playsInSilentMode: true`.
- EMPTY ASSEMBLY COLLAGE. It only used decoded video frames; the shot strip has
  always had a `thumb ?? openingFrameUrl` fallback and was full of pictures in
  the same screenshot. The collage now takes `shots` and does the same.

JET-220: device locale on the brief and project calls, from
`Intl.DateTimeFormat().resolvedOptions().locale` — no new dependency, guarded,
sent as the full tag since the backend reduces it.

JET-221 (ours, filed and already done by the backend): `MusicVideo.posterUrl`,
a 63KB WebP written from the first anchor. Read in music-videos.ts, passed to
MediaSlot as `stillUrl`; when set, nothing decodes at all. Existing records were
backfilled, so the Library has pictures without a new render. MediaSlot also no
longer gates the thumbnail on `completed`, so a rendering card shows its own
footage.

Next: commit this lot, then the live render that still has not happened.

### 2026-10-29T14:05:00+05:30

JET-218 (7.10) and JET-217 together, since 218 is most of 217's fix.

`brief()` in generation.ts calls POST /api/v1/music-videos/brief at mount on the
Direction screen — once per track, with the title as it stands then. The four
Fields are now a `QUESTIONS` constant in brief.tsx: the screen keeps its own
labels, order and which one is multiline (D-037 fixes the same four keys on the
backend), and takes only placeholder and hint from the response. Suggestions
stay greyed out rather than pre-filling; `withSuggestions()` in create-context
substitutes a blank field's suggestion at submit, just before buildDirection().
Changing the track clears the brief so one song's suggestions can never be sent
against another.

JET-217's one-liner is in `createStoryboard` unchanged, but it is now only
reached by an instrumental: no read means no suggestions, so directionPrompt
really is empty and the v0 storyboard route would 400. `directionPrompt` on the
project is still left empty either way.

Next: still the one live render — and a second on an instrumental, which is the
only path the title fallback covers. Nothing in 216/217/218 has run on a device.

### 2026-10-29T12:40:00+05:30

JET-216: the Direction box on `(create)/brief.tsx` is now four plain questions —
Who's in it / Where / What happens / Look — with an optional Note behind "Add a
note". The draft holds them as `answers` and the context derives `prompt` from
them, so `working/[id].tsx` and `saveProject` are untouched: the same
`directionPrompt` field goes out, now as labelled lines with blanks omitted.
Nothing is required any more — `isReady` is the track alone. The style chip row
was also called "Look"; it is `visualStyle.prompt`, a different field, so it is
labelled "Style" now.

Next: still the one live render. It verifies JET-213 and JET-216 at once — check
the logline names what was typed in Who and What happens. Backend's 7.10 will
later fill these fields' placeholders from the song read with no UI change.

### 2026-10-26T17:22:28+05:30

Session ended. Touched: src/app/(app)/video/[id].tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-10-24T15:26:18+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-24 — session end: committed, unverified, here is where to start

**Where the code is.** Branch `v1-render-and-design-pass`, 4 commits ahead of
`main`, nothing pushed. Working tree clean, tip typechecks, `npm run
check:retry` passes. Merge with `git merge --ff-only` when you want it on main.

One wart: the deletion of `src/app/(create)/working.tsx` landed in the
reliability commit (e460e21) instead of the route-restructure one (58cc55e).
The tree is right at the tip; only the per-commit tidiness is off. Also, only
the tip is guaranteed to build — the four commits are thematic groupings, not
bisectable states.

**START HERE: nothing in the v1 path has executed.** Not the render call, not
polling, not re-attach, not the blocked decision, not the finished-video
autoplay. The backend's own plan records its batches as built and unit-tested
but never run end to end either. Use a ONE-SCENE project, about $0.80; a full
song is ~31 shots and ~$24.80. The order I would test in:

1. One tap renders a song, and the hero shows planning -> shots -> collage ->
   the finished video autoplaying with a toast.
2. Background the app mid-render and return. Then force-quit and reopen the
   project from the Library — it must re-attach, not offer to start (that is
   JET-198 doing its job, and the thing most likely to be subtly wrong).
3. A direction naming a real person, to reach `blocked`. Under 4 refusals you
   should get per-shot prompt editing; at 4+ the screen should blame the
   direction instead.
4. `docker restart` the backend mid-render; the phone should keep polling.

**Things I would look at first if something is off**
- The reel-to-collage-to-finished handoffs are three animations swapping in
  one slot; I have never seen them run together.
- After a re-render or stitch from the blocked screen I optimistically flip to
  `running` with a locally-patched status and let the next poll correct it. If
  the backend 202s without leaving `blocked`, expect a bounce.
- The warnings panel is capped at 180px expanded and shows 2 reasons collapsed.
  Untested with many warnings; the sanitizer has never run live.

**Open requests, all waiting on a person**
- JET-194 media host (fixes "Could not reach the media host" for good)
- JET-196 portrait output — IMPLEMENTED but the container serving :5005 was
  running a pre-fix image. `docker compose up -d --build`, then ffprobe a new
  master for 1080x1920 before closing it.
- JET-193 captcha — implemented, needs closing once you have seen mobile sign in.

**Unverified beyond v1:** light mode, 1.3x font scale, and the orb field's cost
on a low-end device (three animated views per screen, never profiled).

**One open question for the backend:** `POST /api/video/music-storyboard` still
takes `videoModel`, and Batch 0.3 ("re-point mobile's hardcoded MODEL_KEY") is
unstarted. We now send `undefined` rather than the retired `'lite'`. If that
route needs a real model name to size scenes, step one of every render has a
gap. Not filed — it is the kind of thing to ask before filing.

`coord check` warns this file has more than 5 handoff notes; `coord archive`
trims it. I have not run it.

### 2026-10-24T15:23:17+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T18:17:01+05:30

Session ended. Touched: src/lib/generation.ts. Nothing committed. (written automatically — no one said what is next)

