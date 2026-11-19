---
id: JET-366
title: Release: production config check — dev bypasses, R&D flags and dead routes
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-19T12:27:11+05:30
updated: 2026-11-19T17:34:49+05:30
decisions: 
---

## Request

One pass that makes sure nothing meant for dev or R&D is live in production, and fails boot loudly if it is.

## Understanding

Several switches are safe on a dev machine and dangerous in production: CAPTCHA_BYPASS_CLIENT (JET-244), flags.limits.generationLimit (D-071), the dev quota bypass, and the render R&D flags on feat/director-rnd (all on locally). src/routes/dbBrowser.ts can list and delete any document; it is commented out of src/index.ts, but one uncomment exposes the whole database. Assumption: a boot-time log banner plus a single test is enough; no new config system.

## Plan

1. Delete src/routes/dbBrowser.ts and its commented import.
2. A boot banner listing every non-default flag and any bypass that is set, at warn level.
3. Set the render flags to the values the eval renders pick before merging feat/director-rnd.
4. A test that the shipped flags.ts matches the release list.
5. Document the production env checklist in the release sheet.

## Reason

—

## Related files

—

## Acceptance criteria

Boot log shows every bypass/flag that is on; dbBrowser.ts is gone; flags.ts matches the agreed release values.

## Test steps

1. Start the server with production settings (NODE_ENV=production, PostHog keys set, no CAPTCHA_BYPASS_CLIENT): after "Server running", only one [release] line, "render flags on: … | off: scriptWriter, shotPins". No ⚠️ lines.
2. Start it with CAPTCHA_BYPASS_CLIENT=mobile, or without POSTHOG_SECRET_KEY, or with NODE_ENV removed: one "[release] ⚠️" line names each.
3. With NODE_ENV removed (as in the container): POST /api/auth/firebase-verify with idToken "MOCK_FIREBASE_ID_TOKEN_12345:someone@x.com" -> 401 (it no longer passes the dev shortcut, when Firebase is unconfigured); an unknown 500 answers "Internal server error", not the raw message; no verification code in the log on register.
4. src/routes/dbBrowser.ts is gone; GET /db-browser -> 404.
5. Change any render flag in flags.ts -> npm test fails in src/config/releaseCheck.test.ts until RELEASE_V1 there is changed too.
6. Release sheet → Release Checklist: the new Backend rows (boot log, NODE_ENV, PostHog keys and flags, JWT secrets, GCS/Firebase, Gemini billing alert).

## Thread
2026-11-19T12:27:11+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:31:22+05:30 aquib N: status: open -> approved
2026-11-19T17:34:49+05:30 aquib N: Built. (1) dbBrowser.ts deleted with its commented mount. (2) Boot: after 'Server running', a [release] ⚠️ line per wrong-for-production setting (NODE_ENV not production, CAPTCHA_BYPASS_CLIENT, launch limits off, PostHog keys missing, GCS_DISABLED, generationLimit null) and one line of render flags on/off (src/config/releaseCheck.ts). (3) Release values = flags.ts as it stands (16 render flags on; scriptWriter off per D-082, shotPins off, replaced by motionPins). No eval picked different values; CONFIRM OR CHANGE before merge — change flags.ts and RELEASE_V1 in releaseCheck.test.ts together. (4) releaseCheck.test.ts pins render/posthog/launch/limits/videoService. (5) Release Checklist sheet: 7 Backend rows; the JET-363 row notes A5 covers it. Also fixed, same class: four gates used NODE_ENV !== 'production', which env.ts warns is TRUE in the container (NODE_ENV unset): the mock Firebase token (reachable only with Firebase unconfigured), OTP codes logged on register/login, and raw error messages in 500 bodies. All now IS_DEV_MACHINE. NOT done: deleting the captcha bypass code (D-065). The app sends no captcha token, so removing it now locks mobile out of login wherever it is set; it stays JET-244's, which needs attestation first. The banner names it at every boot.
2026-11-19T17:34:49+05:30 aquib N: status: approved -> in_progress
2026-11-19T17:34:49+05:30 aquib N: status: in_progress -> review — Built and tested; release flag values need your confirmation (see note). Not committed.
2026-11-19T17:53:14+05:30 aquib N: Decided: the release ships the current flags.ts render values (16 on; scriptWriter and shotPins off). Render flags stay in code: no render-* flags in PostHog, to keep the flag list to the kill switches. Turning one off in production = change flags.ts + RELEASE_V1 and deploy. Added a P0 Release Checklist row: film 2-3 songs on the release build with all flags on before launch.
