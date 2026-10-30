---
id: JET-225
title: The director list endpoint, and directorId on the brief and the project — the shape mobile is building against
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-30T12:01:57+05:30
updated: 2026-10-30T12:03:17+05:30
decisions: 
---

## Request

Three things, in the order they block the screen:

1. GET /api/v1/music-videos/directors?language=<BCP-47>
   Not project-scoped, for the same reason /song-read and /brief are not: the
   screen sits between upload and the brief, before a project exists.
   Response, 200, always (never 404 — this is in front of a person):
     { defaultId: string,
       directors: [ { id, name, intro, knownFor, avatarUrl } ] }
   - id        stable, lowercase, never renamed once shipped. It is what the
               bundled fallback art and the static list are keyed on.
   - name      the director's name, already in the requested language.
   - intro     one line, <= ~90 chars. The ticket is right that the trust comes
               from this naming a craft choice ('holds the shot through the
               hook'), so it should be the arithmetic in plain words.
   - knownFor  <= ~40 chars, the chip under the name.
   - avatarUrl absolute and on the backend's own host (JET-194). A third-party
               host is a blank card on a device; we repair loopback and nothing
               else.
   - defaultId named explicitly rather than 'the first one'. 8.12 says doing
               nothing picks a director; the client should not infer which from
               array order.

2. POST /api/v1/music-videos/brief accepts an optional directorId, and echoes
   the one it actually used back as directorId on the response. Unknown or
   missing id resolves to the default and still returns 200 — same posture as
   today. The echo is what lets the brief screen say 'your director chose
   these' honestly rather than on faith.

3. POST /api/music-videos (the v0 upsert mobile saves with) accepts and
   persists directorId, and the v1 render resolves the profile from it. Mobile
   sends the whole record on every save, so it travels with the rest.

Nothing else. No per-director preview, no 'compare two directors' call, no
avatar animation.

## Understanding

This is the API half of JET-223, filed from this side so 8.9 lands into a shape rather than us waiting to hear one. JET-223 says the backend will send the shape when 8.9 lands and that nothing blocks us until then — so this ticket is that message in the other direction: here is what the screen needs, correct it rather than build around it.

What I read in JET-223 and in Batch 8 of the delivery plan, in my own words:
- A director is a parameter set over the grammar that already exists (8.9-8.11), not prompt text. Mobile does not see any of that and should not: the client's whole model of a director is a card and an id.
- The id travels: picked on the director screen, sent on the brief so the four answers come back in that director's voice (8.13), sent on the project so the render bakes it into the plan (8.14).
- 8.12 says static art first and animation must not gate it. Agreed, and I am not asking for animation.

Assumptions I am making, which are cheaper to correct now than after the screen is built:
- Three directors, and three fits on one screen without a carousel at 375pt. I will confirm against the real strings once they exist; if the intro line has to go, I will say so rather than add scrolling.
- The ids will be stable strings I can bundle fallback avatar art against. If you would rather not commit to ids, say so and I will key the fallback on array position and accept it being wrong after a reorder.
- language is a query param carrying the device locale we already send on /brief (JET-220). If you would rather read it off a header or the body, say which.
- Until the endpoint exists the screen ships against a static list of the three directors from the Batch 8 R&D table. Sending directorId to /brief before it is read is harmless — zod strips unknown keys — so I will start sending it immediately and it becomes live the day you read it.
- No 'no director' path, as the ticket says. Doing nothing picks the default.
- The render does NOT need directorId on POST /:id/render: it reads it off the project, which is where every other render setting already lives.

## Plan

1. Build app/(create)/director.tsx between audio and brief, against a static list of three directors with the ids this ticket names.
2. Carry directorId in the create draft, send it on POST /brief and on the project upsert from day one.
3. Re-frame the brief's four fields as 'your director chose these — tap to change' once the brief echoes a directorId.
4. Swap the static list for GET /directors when it lands; the static list stays as the offline and failure fallback, which is why the ids matter.
5. No screen reads a director's parameters. If two directors are indistinguishable in the cut, that is 8.10/8.11's problem and not visible here.

## Reason

Batch 8 is the batch that makes everything in 6, 7 and 7B legible. The mobile half is cheap and can start today, but it hardcodes three ids and a card shape the moment it does. Agreeing the shape before the screen exists costs one ticket; disagreeing after it exists costs the screen, the fallback art and the draft plumbing.

## Related files

backend: src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/directorsV1.ts, src/services/render/briefV1.ts, src/models/MusicVideo.ts; mobile: src/app/(create)/director.tsx, src/app/(create)/brief.tsx, src/features/create/create-context.tsx, src/lib/generation.ts

## Acceptance criteria

GET /api/v1/music-videos/directors returns three directors with stable ids, a defaultId, and avatar URLs a phone on the LAN can actually load. POST /brief with a directorId comes back with that id echoed and visibly different suggestions for two different directors on the same song. A project saved with a directorId renders with that director's grammar on the plan (8.14).

## Test steps

—

## Thread
2026-10-30T12:01:57+05:30 aquib N: created ticket, status: - -> open
2026-10-30T12:03:17+05:30 aquib N: status: open -> approved
2026-10-30T12:11:53+05:30 aquib N: Picking it up. Your six assumptions, answered in order, then one correction.

1. Three directors, and I am committing to the ids now so your bundled art can key
   on them: `stays-close`, `fills-floor`, `holds-frame` — the three R&D rows in the
   artifact, in that order. They name the craft choice rather than the genre, so the
   arithmetic can move without the id lying.
2. defaultId is `stays-close`, named explicitly as you asked. The reason, so you can
   argue with it rather than inherit it: it is the 0.15 lane ratio, and until Batch 10
   exists every performance shot is a mouth that does not match the words. The
   lowest-performance director is the one that renders best today. If that reads wrong
   on the screen, say so — it is one field.
3. `language` as a query param carrying the same device locale you send on /brief.
   Agreed, not a header, not the body.
4. Sending directorId to /brief before it is read is harmless and it goes live the day
   this lands. Agreed, keep doing it.
5. No "no director" path. Agreed — doing nothing resolves to defaultId.
6. The render reads directorId off the project, not off POST /:id/render. Agreed, and
   that is how I am building it.

THE CORRECTION IS avatarUrl, and it is half mine and half nobody's.

JET-194 is still `waiting`, which is the "on our host" half — I have noted there that
your two tickets have turned it from a nice-to-have into a prerequisite. The other half
is simpler and worse: there is no avatar art in this repo and I cannot draw it. Those
are two different problems and only the first is an engineering one.

So what you get: avatarUrl is served from this backend at a stable path per id, and it
is EMPTY STRING until someone drops a real image in. Keep your bundled fallback and
treat a non-empty avatarUrl as the override, not the other way round — the ids are
stable precisely so that works. The moment art exists it is a file drop and your cards
change without a release on either side.

8.12 says the trust comes from the intro naming a real craft choice and not from the
picture, and I would rather ship that sentence true than ship a grey square that
technically loads.
