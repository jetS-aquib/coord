# music-jetkreate-backend — aquib N

- **Current task:** B12 billing APIs (JET-421 user usage/history, JET-422 admin grants/plan/reports/preview) built and not committed; handed back. B10 committed as 9ab0191, B11 as 09e6635.
- **Status:** waiting on human
- **Blockers:** JET-262 is waiting on you: `coord done` once a flag-on vs flag-off render of the same song has been compared (its Test steps). D-075 was recorded empty by mistake and is superseded by D-076. JET-250 needs `coord done` after a blocked render is fixed through …/clips/fix end to end. JET-251 (mobile fix screen) needs `coord approve`, and is now unblocked. JET-249 needs `coord done` once a pause-then-instant-resume has been watched end to end. THE BOARD IS NOT SYNCING FROM THIS MACHINE — `.coord` push fails with `remote: error: inflate: data stream error (invalid distance too far back)`, 4 times since 23:10 on 2026-11-03. Nothing filed here reaches anyone until it is fixed, and that includes JET-242's review and D-067. `coord sync --resolve`, or the manual push in `coord fix`; it looks like a corrupt object on the remote, so do not force it. JET-242 needs `coord done` once a render is paused and resumed end to end. JET-243 needs `coord done` once demo, standard and hero have each rendered the same song — and read its thread first: the tiers do NOT differ in model, which half of its "done when" asked for. JET-244 stays OPEN after today — attestation is still unbuilt and the flag must be deleted, not just unset, before public launch (D-065). JET-246 needs `coord approve` — it is theirs to fix and the render that found it is still stitching. JET-245 needs `coord approve` — it is the seam threshold, and it should not start until two or three more 16:9 renders exist. JET-241 is mine to report and yours to close — `coord no 241`, the provider refuses 1:1 (D-064). JET-240 needs `coord done` once a gemini render is watched end to end. JET-232 is only now testable end to end: re-check a short portrait render before closing it. Two commits unpushed. JET-241/242/243 from mobile need `coord approve`. JET-232/233 need `coord done` (their halves landed; ours is now built too). JET-234 is mobile's to start — one line unblocks every render. 9.2 is the next real gap: generation still draws 16:9 clips whatever the frame says, so a portrait master is padded rather than composed. JET-225/226/227/231 need `coord done`. JET-228/229 need `coord approve`. Git hooks still not installed — `coord devsetup --hooks`.
- **Last updated:** 2026-11-24T16:30:00+05:30

## Handoff notes

### 2026-11-24T16:30:00+05:30
B11 committed (09e6635). B12 built, not committed: billing/usageV1.ts (usage, history, labels, admin report, rate-card preview), routes in billing.routes.ts (/usage, /history, admin grant, plan, reports, rate-card/preview), two ledger indexes, usage.test.ts, contract .coord/contracts/api-billing.md. Billing tests 28/28 against local Mongo; full suite green apart from the known captcha test. JET-421/422 handed back. Next: commit, then B13 (mobile, JET-423/424) needs approve.

### 2026-11-24T15:30:00+05:30
B10 committed (9ab0191). B11 built, not committed: billing/meterV1.ts, chargingV1.ts, GrantClaimV1, GenerationLog billing fields, dbLogger hook, orchestrator reserve/settle/resume/meter hooks, aiGuardV1 on v1 AI routes, admin freeze/unfreeze/zero. D-102. Billing tests 22/22 against local Mongo; full suite green except the known captcha test. Next: commit, seed-billing on staging, then B12 (JET-421/422).

### 2026-11-24T13:30:00+05:30
B10 built, not committed. New src/modules/billing/ (billingConfigV1, seedBillingV1, creditsV1, billing.routes, billing.test), models BillingConfigV1/CreditLedgerV1/CreditAccountV1, scripts/seed-billing.ts and migrate-quota-overrides.ts. Small edits: estimate adds credits per tier, renderCostV1 exports estimatePlansV1, admin.ts mounts /billing, index.ts mounts /v1/billing, errorHandler passes `details`. D-101. Tests green (Mongo half needs MONGO_TEST_URI). Old pricing code (tokenLogger, generationLimiter) untouched by request. Next: commit, run seed-billing, then B11 (JET-417/419/420) wires debitV1 into routes.

### 2026-11-23T17:40:00+05:30
JET-412 and JET-396 are built and not committed. New: models/ConfigBundleV1.ts, modules/config/{configBundlesV1,seedV1,config.routes}.ts plus a test, the admin POST /config/:bundle, scripts/seed-config.ts and scripts/draw-config-art.ts, contracts/config-bundles.md, and D-098. Next: the person commits; then run the seed against a DB, create the ui-config flag, draw and upload the art, render the example videos and publish them as starters@2.

### 2026-11-23T17:20:00+05:30
JET-386..395 built, not committed. Tests: npm test is green apart from captchaBypass.test.ts, which already failed before this work. New tests: songReadReuse, createAndRender, manualLyrics, planFailureV1, push, plus additions to renderV1/owner/videoDetail/renderCost/directors.
386: hash in local-upload, placeholder SongReadV1, reuse in sharedSongReadV1 (D-096). 387: thumbnailUrl and progress on the list. 388: delete cancels renders, plans kept (D-095). 389: castTags, video time, cast summary, recipe on /detail. 390: failure block on the poll and on limit refusals. 391: POST /create-and-render with Idempotency-Key, startError, retry with projectId. 392: POST /lyrics/manual, even spread, typed lines not burnt yet (D-097; a video-processing request is needed). 393: push tokens + Expo send, push-enabled kill switch. 394: typical per tier, allowance always sent. 395: director why.
Contracts api-music-videos/api-users/api-ai updated. Requests are still at go: the Test steps section cannot be filled through coord, and hand-editing the file was refused, so `coord review` is blocked until a person fills it.

### 2026-11-20T16:00:00+05:30
JET-380 built, not committed: VideoFeedback model + PUT/DELETE /:id/feedback (server $ai_feedback, no note); RenderPlanV1.versions/currentVersionId/previousVersionId, recut/reel append, POST /render/:jobId/versions/:versionId/use, keep/undo on top; GET /:id/detail (videoDetailV1.ts); publishV1.ts caption on completion / first detail, POST /:id/publish/rewrite. D-092 (D-091 was recorded empty by mistake, superseded). Tests videoVersions.test.ts, videoDetailV1.test.ts. Live: caption 2.1s, feedback upsert 1 row, detail 31KB no prompts. Sheet TC-101..105. Mobile must stop sending its own $ai_feedback.

### 2026-11-20T14:00:00+05:30
JET-377 built, not committed: POST …/render/:jobId/recut {cutStyle calm|beat|fast}, …/recut/keep, …/recut/undo, …/reel. recutV1.ts (reelWindowV1, piecesInWindowV1), stitchEditV2 options, plan.recut/reel/cutStyle, flags.render.recut (off) + edit.cutStyles + recutsPerHour. Tests recutV1.test.ts. Sheet TC-097..100. Contract api-music-videos.md. Live probe: a reel came back "only 14 pieces" (one segment) -> reels now split in two. JET-379 (video-processing fillFrame) waits on approve; until then a 16:9 reel is letterboxed. Mobile: JET-346.

### 2026-11-20T13:30+05:30
JET-378 built, not committed: promptSafetyV1 tells the model @imageN tags are our invented cast and drops rewrites that change the tag set. Tests promptSafetyV1.test.ts (new). Live: mvr_1795156396084_b3d17799's 66 prompts -> 0 rewrites. Sheet TC-096. No mobile change.

### 2026-11-20T12:40+05:30
JET-349/362 music half built, not committed: graphicLayerV1.ts (planner + tests), DirectorSpecV2.graphics, flags graphicLayer/filmFinish (off), fields through video-api.service.ts, stitchEditV2/stitchInSegmentsV1, plan.stitchInfo, renderReport. Live-checked against local video-processing (mvr_1795085795309_80e429b5). Film finish: 296 MB vs 75 MB and a magenta cast; noted on JET-362 for the video side. JET-377 (re-cut/reel) waiting approval; JET-346 blocked on it.

### 2026-11-19T19:30+05:30
JET-370 built, not committed: normalizeSpecialV1 returns kind plain for a non-named reading with no question and no recommendation (app already continues on plain). Tests in specialRequestV1.test.ts; live-checked 3 requests. Sheet TC-093. No mobile change. Next: JET-316 captions stuck / JET-315 project status.

### 2026-11-19T19:10+05:30
JET-368 built, not committed: panels-only still gate on tiers without the full gate (frameGateV1 panelsOnly + panelsGateOnV1; gateAnchorV1 runs it; failures filtered to panels). renderCostV1 counts Draft checks and still redraws; demo cost tests updated (ceiling just above floor). Verified on mvr_1795072909137_46e55548 stills: flags anchors 2 and 4. Sheet TC-092. Next: JET-370 special request.

### 2026-11-19T18:40+05:30
JET-367 built, not committed: src/shared/alert.ts (alertV1, alertThrottledV1, serverErrorAlertMiddleware). Render failed/blocked alert from trackRenderV1 (its PostHog early-return removed); 5xx via res finish listener (503 skipped, 5-min throttle); capacity breaker and failing allowance check alert. ALERT_WEBHOOK_URL in env.ts and .env (empty). Boot banner warns when unset. Tests alert.test.ts. Sheet TC-090..091. catalogue-enabled OFF in PostHog by the user; JET-369 skipped (Epidemic likely replaced). Next: JET-368 Draft grids.

### 2026-11-19T18:10+05:30
JET-366 built, not committed: dbBrowser.ts deleted; src/config/releaseCheck.ts boot warnings + render flags line (logged after listen in index.ts); releaseCheck.test.ts pins release flags (= current flags.ts, to be confirmed); four NODE_ENV !== 'production' gates -> IS_DEV_MACHINE (firebaseAdmin mock token, auth OTP logs x2, errorHandler 500 message). Release Checklist sheet +7 Backend rows. Captcha bypass code NOT removed (mobile has no captcha; JET-244). Next: JET-369 catalogue 402.

### 2026-11-19T17:45+05:30
JET-364 built, not committed: DELETE /api/users/me in src/modules/auth/deleteAccount.ts (fresh token <5 min, cancel live renders, delete owned rows, anonymize GenerationLog, Firebase user, User row last, background GCS delete by URLs held). deleteFirebaseUser in firebaseAdmin.ts. Tests deleteAccount.test.ts (8); live-checked with a throwaway user on local DB. Contract api-users.md updated. Sheet TC-087..089. PostHog person deletion not done (no personal key). Next: JET-366 prod config check.

### 2026-11-19T17:20+05:30
JET-375 built, not committed: login()/register() refuse a passwordless account with 409 password_not_set and write nothing; /firebase-verify and /reset-password now require email_verified on the Firebase token (same takeover through an unverified Firebase account). firebaseAdmin imported at top of auth.service.ts. Tests src/modules/auth/accountTakeover.test.ts (6). Sheet TC-084..086. Local DB has 0 Google users; the production count is still to run. JET-376 at mobile needs `coord approve`; JET-374 parked for later.

### 2026-11-19T16:30+05:30
JET-372 A2 (manual $ai_generation at tokenLogger + proxy errors, ALS trace = jobId/request id, stage spans, image.service on shared client), A3 ($ai_metric per finished render), A4 (catalogue-enabled, tier-best-enabled, per-render flagSnapshot read through a flags.render proxy, render-<kebab> PostHog flags per user), A6 (/api/admin, requireAdmin, AuditLog) built; tests green; sheet TC-081..083; D-090; ticket in review. Not committed. Next: user checks the live trace, flips renders-enabled once, sets an admin role; then commit.

### 2026-11-19T15:05+05:30
JET-372 A1+A5 built, not committed. src/shared/posthog.ts (capture/switchOn/remoteConfig, no-op without POSTHOG_API_KEY); render events off emit() in renderOrchestratorV1 + route events; generationLimiter checkRenderLimitV1 (renders-enabled 503 renders_off, daily spend 503 capacity, 7-day clip seconds 429 render_limit) on render/accept/rerender/rerender-many/fix/apply; allowance on /estimate; signup gate on register/google/firebase. All behind flags.posthog.{events,limits,remote}, OFF. Sheet TC-074..080. Next: live check with keys, then A2 (ALS + $ai_generation), A3, A4, A6.

### 2026-11-19T13:20+05:30
Release prep. Commit eed581f. Requests JET-363 render cap, 364/365 delete account, 366 prod config, 367 alerts, 368 Draft grids, 369 catalogue 402, 370 special request, 371 mobile memory. Sheet JetKreate-Release-Regression.xlsx in the jetKreate root; run 1 on backend e204b8c (dev server not restarted on HEAD). Not run yet: OTP, offline, backend restart, stop render, scene editor, captions, R&D quality on HEAD.

### 2026-11-18T23:30:00+05:30
JET-350 caused walk-then-reverse (shotPins off). Built JET-356 clip QA (baseline 15/57 on mvr_1794998373760_2de1c52f, scripts/rnd/clipQa.ts), JET-357 motion pins (+ fixed start-only clips told to END on their start frame), JET-358 still rules, JET-359 realism brief per director camera, JET-360 extras, JET-361 intensity/feeling. Spikes: dance not good enough yet; cast-sheet reference images make QA worse — neither built. Next: eval renders.

### 2026-11-18T19:30:00+05:30
JET-352/353/355 committed (e204b8c). Built JET-354 (place rule + placeConflictsV1 log), JET-351 (location plates on; vehicle places get interior/exterior/interior2 plates, picked per shot text), JET-350 (closing still per shot drawn against its opening still, pinned as end frame; D-088 supersedes D-029). Next: stills preview + full Zoya render, compare with renderReport against mvr_1794989625320_48693f7a.

