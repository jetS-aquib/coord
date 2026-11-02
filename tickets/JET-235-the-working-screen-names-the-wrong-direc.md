---
id: JET-235
title: The working screen names the wrong director — it reads the local draft, not the render it is watching
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-02T13:51:20+05:30
updated: 2026-11-02T13:53:06+05:30
decisions: D-060
---

## Request

On the working/resume screen, show the director of THE RENDER being watched, from the API payload, instead of `draft.director` from the create context. The backend now sends it.

## Understanding

A render directed by Kabir showed "Mira is directing" for its whole run, with a blank medallion instead of a portrait.

Nothing was wrong with any API call. src/app/(create)/working/[id].tsx:458 draws the crew line from `draft.director`, which comes from useCreateDraft() — the in-memory create context (src/features/create/create-context.tsx:124), whose initial value is DEFAULT_DIRECTOR = DIRECTORS[0] = Mira (src/features/create/directors.ts:72, :46).

That context is the right source while a person is still choosing. It is the wrong source on a screen opened for a render that already exists: the draft is empty on a cold app open, so the screen falls back to the first name in the bundled list — and that will be Mira for everyone, on every resumed render, whoever actually directed it.

The portrait is blank for the same reason: the bundled Director entries carry `avatarUrl?` unset until the server list is fetched, which this screen never does, so DirectorAvatar draws the "M" initial.

ASSUMPTIONS, flagging them because I cannot see your side's intent:
1. The same screen serves a fresh render (draft is populated, correct today) and a resumed one (draft is empty or stale). I am asking only for the second to change.
2. You would rather read one field off the render payload than resolve an id against the bundled list. Both work — see the Plan for the id route if you prefer it.
3. Nobody is relying on the draft being shown here deliberately.

## Plan

1. GET /api/v1/music-videos/:id/render now returns `director: { id, name }` on the payload. It is the profile the render was MADE under, off the plan, not the project's current setting — a user who picks a different director tomorrow must not change who made yesterday's video.
2. On the working screen prefer that over `draft.director`; keep the draft as the fallback for a render that has not started yet and has no payload.
3. For the portrait: resolve the id against your bundled list for the name/fallback as you do today, and take `avatarUrl` from GET /api/v1/music-videos/directors. Those three URLs are now GCS objects, not backend routes — public, immutable, cached a year.
4. '' for id and name is a real answer and means the house style — nobody chose. Draw nothing, as the screen already does when `draft.director` is null.

## Reason

Every resumed render in the product currently attributes itself to the wrong person. It is the one thing on that screen making it read as somebody doing a job rather than a queue (JET-223), and it is lying.

## Related files

src/app/(create)/working/[id].tsx:458, src/features/create/create-context.tsx:124, src/features/create/directors.ts:72

## Acceptance criteria

Start a render with Kabir, force-quit the app, reopen it and resume that project: the working screen says "Kabir is directing" with his portrait, not Mira with an initial. A render with no director still shows no crew line.

## Test steps

1. Pick Kabir on the director screen and start a render.
2. Force-quit the app (not background — fully quit, so the create draft is empty).
3. Reopen the app and open that project from the library.
4. The resume card reads "Kabir is directing" and shows his portrait.
5. Start a fresh render without quitting and confirm the chosen director still shows correctly mid-flow.

## Thread
2026-11-02T13:51:20+05:30 aquib N: created ticket, status: - -> open
2026-11-02T13:52:51+05:30 aquib N: linked decision D-060 (Director portraits are served from GCS, not from this backend)
2026-11-02T13:53:06+05:30 aquib N: status: open -> approved
