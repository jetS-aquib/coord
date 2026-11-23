# music-jetkreate-mobile — aquib N

- **Current task:** JET-413 (config client + Home blocks) and JET-409 (starter looks, Make another like this) implemented, uncommitted. JET-400/401/404/407 committed (6e5e007). Backend art in ../music-jetkreate-backend/assets/config uncommitted.
- **Status:** waiting on human
- **Blockers:** **A TestFlight build must point at STAGING.** D-065's bypass is keyed on `CAPTCHA_BYPASS_CLIENT`, staging sets it and production deliberately does not, so a production build still cannot sign in. JET-244 stays open for Play Integrity / App Attest. Still needs `coord approve`: JET-242, JET-243. `coord done 241`. Before any build: `eas init`, and the three `EXPO_PUBLIC_*` on the EAS environments, with the production profile's API URL pointed at staging until attestation lands.
- **Last updated:** 2026-11-24T01:00:00+05:30

## Handoff notes

### 2026-11-24T01:00:00+05:30

Drew and uploaded 20 config stills (backend draw-config-art), seeded all bundles into local Mongo. Built JET-413 + JET-409 (agent, verified: tsc, 11 checks incl. new check:config, Android export). Fixed timeline on long songs (fixed columns), lyrics preview redesign with real caption colours (video service luxury/gold look BGR-swapped -> blue; worth a ticket). Waiting: user makes sign-in video in app (I cut a 6s muted loop and bundle it); commit go-ahead; backend art commit.

### 2026-11-23T23:00:00+05:30

Built JET-400, 401, 404, 407 (three parallel agents, integrated and checked). tsc clean, all check:* pass, Android export bundles; not seen on a device. Stubs: resend code (JET-385), Google (JET-384), style stills / password rule / legal links (JET-413), lyric-look previews (JET-233), auth backdrop image. lib/waveform.ts kept for planning-stage. Next: device test, commit go-ahead, coord review.

### 2026-11-23T21:00:00+05:30

Implemented JET-399, 402, 403 against backend 23580cc (create-and-render, list thumbnailUrl/progress, plan failure, allowance, delete stops render). Film now is one server call; createStoryboard/saveProject removed from the app. tsc clean, all check:* pass (new check:title), Android export bundles. Not seen on a device. Test steps filled on all three. Skipped: long-press Rename (no partial-update endpoint). Next: device test, commit go-ahead, coord review.

### 2026-11-23T19:30:00+05:30

Implemented JET-411, 397, 398 (nothing committed; notes with full detail on each request). expo-updates added (D-094): existing dev builds must be rebuilt or the app crashes at import. tsc clean; Android export bundles. Not yet seen on a device. ESLint isn't installed, so `expo lint` can't run. Can't move the three to review: `coord review` needs Test steps and the CLI has no way to set them after `new`; test steps are in each thread. Next: user rebuilds the dev client, checks, and says commit; then V2-2/V2-3 screens (Working, video-studio panel, edit-bar bar still use old layouts).

### 2026-11-23T18:00:00+05:30

Remote config design note docs/ux-revamp-v2/REMOTE_CONFIG.md (OTA + versioned bundles behind PostHog 'ui-config' pointer + content-block renderer; no full server-driven UI). Filed JET-411/412/413. Revised unapproved JET-384 (adds Google sign-in), 396 (starters = bundle), 404, 407 (UI now, wiring in auth batch), 409, 410 (QA no longer waits on push). Deprioritised 384/385 to B7 pre-release auth, 393/408 to B9 last. Batches on the artifact with approve commands. Next: user approves B0/B1/B2.

### 2026-11-23T17:00:00+05:30

Locked Studio Ink (D-093). Filed backend JET-384 (Google ID token, security), 385 (send+resend verification code, mobile signups dead-end today), 386 song-read by content hash, 387 list thumbnail+progress, 388 delete cascade, 389 detail additions (castTags, video time, cast summary, recipe), 390 plan failure cause, 391 create-and-render one call, 392 manual lyrics, 393 push, 394 estimate typical+allowance, 395 director why, 396 starters. Mobile JET-397..410 with 'Depends on:' lines. Notes added to JET-371, JET-376. Next: user approves backend tickets, implement backend (384, 385 first), then mobile.

### 2026-11-23T15:30:00+05:30

V2 design language: 7 docs in `docs/ux-revamp-v2/` + artifact https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM. Direction Studio Ink (warm charcoal #121110, ivory #F2ECE4, cue coral #FF7759 for live states only, Instrument Serif + Geist + Geist Mono). Starter library judged feasible (draft prefill); backend request to file on approval. Next: user approves direction, then V2-0/V2-1.

### 2026-11-23T12:45:00+05:30

Pre-release UX audit, docs only: `docs/ux-revamp/` (README + 6 docs, 27 emulator screenshots). 46 findings (third pass: auth + one real render on dev, Zaaya Hook 27s, throwaway ux.audit.1123@example.com left unverified in dev DB): 7 P0 (incl. JET-371 memory kill reproduced: lowmemorykiller took the app when the file picker opened), ~5-6 days (iOS exits on call sheet/working, keep draft on failed start, song-read failure outcomes, stopped cause + delete, render_limit as final + allowance). 8 backend requests proposed, NOT filed (incl. BE-6 shots[].castTags on detail, BE-7 list thumbnailUrl) (BE-1 reuse song reads by content hash: `SongReadV1` keyed on audioUrl, so every re-upload re-transcribes). One real upload + song read of Zaaya.mp3 made; nothing filmed or deleted. Next: user reviews README, approves Phase 1, decides which BE requests to file.

### 2026-11-19T17:14:30+05:30

Session ended while on JET-376. Touched: JET-376-release-forgot-password-on-the-sign-in-s.md. Nothing committed. (written automatically — no one said what is next)

### 2026-11-17T18:39:11+05:30

Session ended while on JET-223. Touched: src/lib/generation.ts, src/app/(create)/brief.tsx, src/features/create/song-window-picker.tsx, src/app/(create)/audio.tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T00:42:14+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md, src/app/(create)/ready.tsx, src/features/create/direction.ts, scripts/direction-check.mts, src/features/create/special-check.tsx, src/features/create/narration.ts, +1 more. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T05:00:00+05:30 (JET-274, mobile half)

`features/create/narration.ts` (deck + `check:narration`); working detail line uses
`narrate()` while running, falls back to `describeRender` without a stage. Warnings
panel is one sentence + "Tap to see". Library row unchanged (no render state on list).


### 2026-11-10T00:18:54+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md, src/app/(create)/ready.tsx, src/features/create/direction.ts, scripts/direction-check.mts, src/features/create/special-check.tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T03:00:00+05:30 (JET-273, mobile half)

`features/create/special-check.tsx` (inline card), `understandSpecial` in generation.ts,
draft `understood: { for, ingredients }`; directionBody sends `ingredients` only when
`for` matches the current special text (check:direction covers it). brief.tsx reads on
Continue. Not run on a device. Brief/treatment needs[] and the render-review hold are
still unbuilt on the backend (contract says so).


