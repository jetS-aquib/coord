---
id: JET-220
title: Send the device locale, so generated copy is in the reader's language instead of the song's
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-29T16:54:21+05:30
updated: 2026-10-29T17:04:05+05:30
decisions: 
---

## Request

Send the device's language on two calls. On POST /api/v1/music-videos/brief add language (e.g. 'en', 'hi', or a full tag like 'en-GB' — we reduce it). On POST /api/music-videos add the same as language on the project body; the field exists on the model already. Both optional, both default to English if absent.

## Understanding

A live render today produced a brief entirely in Latin, and every input on the Direction screen was filled with it. Not a mobile bug — ours, and the cause is worth stating plainly because it changes what we are asking you for.

Whisper hallucinated the opening of an English track ('Sasada tat, ica vada') and reported the song's language as 'la'. briefV1 and treatmentV1 both read that and instructed the model to write in it, so the brief came back as 'Homo superbus cum grege fidelium vestitu luxurioso' and the logline followed. The prompts and the look bible were untouched — 7.5 already pins anything feeding an image to English — so the damage landed exactly where the design said human-facing text goes.

We have fixed the dangerous half already: the song no longer gets a vote. displayLanguageV1 takes a caller-supplied code and anything it does not recognise becomes English, so the worst case today is an English screen rather than a Latin one. D-039.

WHAT WE CANNOT DO WITHOUT YOU is get it right rather than merely safe. Nothing on our side knows what language the person reads. Until you send it, every brief and every logline is English — including for a song genuinely in another language, which is a real regression against 7.5's intent and is why this ticket exists rather than being left.

ASSUMPTIONS:
 - You have the device locale available and it is the right source. If the app has its own language setting, send that instead — we want what the person reads, not what the phone defaults to.
 - A full BCP-47 tag is fine. We take the language part, lowercase, and ignore the region: 'en-GB' and 'pt_BR' become 'en' and 'pt'.
 - Anything that is not exactly two letters becomes English on our side, including three-letter codes. Deliberate: three letters also admits the word 'not' out of a malformed tag, and a wrong language here is a screen nobody can read.
 - MusicVideo.language is already in our schema, so the project half needs no change from us.
 - We are NOT asking you to translate anything or to ship locale files. The model writes in whatever we pass it.

## Plan

1. File this. Our half is committed and safe without it — English rather than Latin.
2. Nothing else from us on this. When it lands, a brief for a Hindi song on a Hindi phone comes back in Hindi, which is what 7.5 asked for in the first place.

## Reason

Today every person sees an English brief regardless of who they are, and this morning one saw a Latin one. The language a form is written in is a property of its reader, and the client is the only thing that knows it.

## Related files

mobile: src/lib/generation.ts (createProject, the brief call), src/app/(create)/brief.tsx. Ours, done: src/services/render/languageV1.ts, briefV1.ts, treatmentV1.ts, src/models/MusicVideo.ts, musicVideoV1.routes.ts

## Acceptance criteria

A brief fetched from a device set to a non-English language comes back with its hints, placeholders and suggestions in that language and in its own script. A device set to English is unchanged. Starting a render from that project produces a logline in the same language. An unsupported or missing locale produces English rather than an error.

## Test steps

1. Set the phone to a non-English language (Settings - General - Language & Region on iOS), then reopen the app and start a new video.
2. On the Direction step, the examples and hints under the four questions come back in that language and in its own script. The four LABELS stay English — they are ours, not the model's (D-037).
3. Start the render. The logline and treatment come back in the same language.
4. Set the phone back to English and repeat: everything is English, unchanged from today.
5. Check the request bodies: POST /api/v1/music-videos/brief and POST /api/music-videos both carry `language` as the full device tag, e.g. "en-GB".
6. A locale the backend cannot reduce to two letters produces an English screen, never an error.

## Thread
2026-10-29T16:54:21+05:30 aquib N: created ticket, status: - -> open
2026-10-29T17:02:01+05:30 aquib N: status: open -> approved
2026-10-29T17:03:54+05:30 aquib N: status: approved -> in_progress — sending the device locale on both calls
2026-10-29T17:03:54+05:30 aquib N: Built. One thing worth your sign-off, one thing worth knowing.

SOURCE IS THE DEVICE LOCALE, via Intl.DateTimeFormat().resolvedOptions().locale — no new dependency. Hermes ships DateTimeFormat from platform ICU, so the tag is real; it is wrapped in a try/catch anyway because an Intl throw at module scope takes a whole route down with it (this app has been bitten by RelativeTimeFormat, which Hermes does NOT ship). On a throw it sends 'en', which is what you default to regardless. There is no in-app language setting today, so the device is the only thing that knows; if one is ever added, it replaces this one constant.

WHAT GETS SENT is the full tag, not the reduced one — 'en-GB', 'pt-BR', 'zh-Hans-CN' — since you said you reduce. Checked every shape Intl can produce against your displayLanguageV1 and they all land on a two-letter code or English, including the script subtag case ('zh-Hans-CN' -> 'zh').

ON POST /api/music-videos it is sent on EVERY save, not just the first, for the same reason showLyrics and includeClipAudio are: that route $sets what it is given and defaults what it is not, and Phase A rewrites the record after every shot. Omitting it would have reset the project to English roughly thirty times a render.
2026-10-29T17:04:05+05:30 aquib N: status: in_progress -> review — built, unrun on device — needs a phone set to a non-English locale
