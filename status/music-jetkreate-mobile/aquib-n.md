# music-jetkreate-mobile — aquib N

- **Current task:** JET-216 built and handed back (review). Uncommitted on branch `v1-render-and-design-pass`. Still waiting on one live render to verify the whole v1 path, JET-216 included.
- **Status:** waiting on human
- **Blockers:** nothing in code. The v1 path is still UNRUN — one live render verifies JET-213, JET-216 and the render integration together.
- **Last updated:** 2026-10-29T12:40:00+05:30

> Note: this per-person file had not been written since 2026-10-21 and the
> entries below it are auto-generated. The substantive handoff notes for
> 2026-10-21 and 2026-10-22 — durable runs, retry, resume, the design pass,
> JET-194/196 — went to `.coord/status/music-jetkreate-mobile.md` instead.
> Read that one too; the two should probably be reconciled.

## Handoff notes

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

