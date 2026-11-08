# music-jetkreate-mobile — aquib N

- **Current task:** D-077 P0 mobile-only audit fixes on top of JET-266/269 lyrics work. All uncommitted.
- **Status:** waiting on human
- **Blockers:** **A TestFlight build must point at STAGING.** D-065's bypass is keyed on `CAPTCHA_BYPASS_CLIENT`, staging sets it and production deliberately does not, so a production build still cannot sign in. JET-244 stays open for Play Integrity / App Attest. Still needs `coord approve`: JET-242, JET-243. `coord done 241`. Before any build: `eas init`, and the three `EXPO_PUBLIC_*` on the EAS environments, with the production profile's API URL pointed at staging until attestation lands.
- **Last updated:** 2026-11-09T04:00:00+05:30

## Handoff notes

### 2026-11-09T03:30:58+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md. Nothing committed. (written automatically — no one said what is next)

### 2026-11-09T04:00:00+05:30 (D-077 P0, mobile only)

Done: lyrics as a SectionList with "Play this part" (stops at the part's end) and
follow via scrollToLocation; "Part n" everywhere via partName() (song-read.tsx);
"Song catalogue" / "Browse songs"; working idle button "Start filming"; plan's Start
filming disabled when the sheet never loaded; Change the direction refills the draft
from the resumed project; share Alert -> link + file glyphs, inline error; visible
em-dashes gone; MOBILE-DESIGN.md glossary, stale leave rule fixed, delete removed
pending JET-278 (DELETE has no owner check). Next: P1 waits on JET-271/272.


### 2026-11-09T01:22:58+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-11-09T02:00:00+05:30 (JET-266, mobile half)

New `src/app/(create)/lyrics.tsx`: tap a line plays from it, playing line follows the
audio, Edit/Done turns lines into inline fields, cleared line = removed (struck
through, Undo). Continue PUTs every line via `saveLyrics` only when something changed
since the last save (`lyricsToSend`, checked in `npm run check:lyrics`). audio's
Continue goes here only when the read has words. Nav Read updated. Not run on a
device. Edits reach the call sheet now; the burnt captions wait on JET-267.


### 2026-11-03T16:44:10+05:30

Session ended while on JET-223. Touched: app.json, eas.json. Nothing committed. (written automatically — no one said what is next)

### 2026-11-03 (JET-244, the narrow half) — a TestFlight tester can sign in, on staging only

The backend's half is in and the contract is exact: header `X-Client`, value
compared with `.trim()` and no case folding against `CAPTCHA_BYPASS_CLIENT`,
read on login and register as `req.get('x-client')`.

Most of the mobile line was already written when I got here. What I changed is
that it was a **string literal in one of two header builders**. `api.ts` has
two: `buildRequest`, and `refresh()`, which deliberately bypasses `api()` so it
cannot recurse and was building its own headers without the client. Both now
spread one `CLIENT` constant. The drift that matters is not a missing header,
it is a letter: the backend matches exactly, so `Mobile` or `mobile ` would not
fail loudly, it would put one route back behind a captcha this client cannot
answer.

Deliberately NOT sent on the GCS upload in `uploads.ts` — that PUT goes to a
signed Google URL, not our host, and our client name has no business there.

`.env`'s note said production mobile auth was "not filed yet", which was true
when it was written. It now names JET-244 and spells out the part that bites:
**staging sets the flag, production does not**, so `EXPO_PUBLIC_API_URL` on a
TestFlight build has to be staging. The header is a hint, not a credential, and
anyone can send it — that is the trade D-065 records, taken for a closed test
group against a backend with no real users.

JET-244 stays open. Attestation is the actual fix and nobody has built it.

### 2026-11-03T15:58:40+05:30

Session ended while on JET-223. Touched: app.json, eas.json. Nothing committed. (written automatically — no one said what is next)

### 2026-11-03 (JET-241 answered) — the brief stays at two frames, and now for the right reason

Square is off, and the ticket is worth reading before anyone reopens this. The
spike came back free: `400 value '1:1' is not supported for
'response_format.aspect_ratio'` on gemini-omni-1.1-flash, never billed. Had
steps 2 to 6 been written first we would own a route that accepts '1:1' and a
generator that throws on it, several dollars of stills later.

**The reason I filed it with was wrong, which is why the comments changed.**
I wrote that the route's zod enum was what refused square. The enum is a
symptom. `omni` is the only model in the registry that supports an END frame,
and pinning both ends is what lets every clip render once and lands the seams
at 2.2 to 2.4. Every model that does offer 1:1 is start-frame-only, so a square
song would be serially generated with visible cuts: a worse video, not the same
video in a different shape. D-064 names the condition to revisit — a model that
takes an end frame AND 1:1 — and that is a provider release, not work here.

Touched only the two comments that were telling the wrong story
(`lib/generation.ts` on `Aspect`, `brief.tsx` on `ASPECTS`) and the plan's 9.1,
9.2 and ticket rows. No behaviour changed: the brief was already two segments,
which is the point. D-062 still holds; D-064 closes the clause in it that said
the third was coming.

### 2026-11-03T15:48:41+05:30

Session ended while on JET-223. Touched: app.json, eas.json. Nothing committed. (written automatically — no one said what is next)

