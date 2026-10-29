# music-jetkreate-mobile — aquib N

- **Current task:** JET-216/217/218 done; JET-220 and the three device bugs built; JET-221's mobile half wired. All in review, all uncommitted past `ee2b027` on `v1-render-and-design-pass`.
- **Status:** waiting on human
- **Blockers:** nothing in code. One open question needs a device: we never learned HOW the on-device MP4 frame decode fails (timeout or error) — it needs the `[thumbnail] ...` line out of Metro. JET-221 removes it from the Library's path; the strip and the reel still ride on it.
- **Last updated:** 2026-10-29T17:30:00+05:30

> Note: this per-person file had not been written since 2026-10-21 and the
> entries below it are auto-generated. The substantive handoff notes for
> 2026-10-21 and 2026-10-22 — durable runs, retry, resume, the design pass,
> JET-194/196 — went to `.coord/status/music-jetkreate-mobile.md` instead.
> Read that one too; the two should probably be reconciled.

## Handoff notes

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

