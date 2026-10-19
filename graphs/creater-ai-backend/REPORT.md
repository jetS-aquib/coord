# Graph Report - creater-ai-backend  (2026-10-19)

## Corpus Check
- 476 files · ~498,036 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .ttf 3)

## Summary
- 4257 nodes · 13273 edges · 148 communities (138 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 182 edges (avg confidence: 0.85)
- Token cost: 74,070 input · 0 output

## Community Hubs (Navigation)
- Billing Invariants and E2E Tests
- Payments Client and Modes
- Billing Contracts and Routing
- Billing Route Tests
- Provider Costs and Rollout
- Billing Grants and Persistence
- Auth and Identity Principals
- Internal API and Subscriptions
- Pricing Adapters and Domain
- Provider Adapters
- Bypass, Cancel and Indexes
- AI Idea and Audio Services
- Provider Authorization and Images
- Billing Worker and Metrics
- Video Route Tests
- MagicRoll and App Errors
- Billing Domain and Pricing
- Payment Expiry
- Payment Routes and Catalog
- Payments Service Core
- Reconciliation and Settlement Tests
- Billing Persistence
- Billing API
- Resolutions and Internal Reconciliation
- Entitlements and Catalog Routes
- HTTP Cache and Channels
- Assets, Brand Kits and Elements
- Video Synthesis and Capability
- Metrics and Reconciliation
- Billing API Surface
- Service Assertions
- Quotes, Allowances and Payers
- Reconciliation Persistence
- Billed Job Types
- Seed, Tier and Offer Drafts
- Auth Middleware and Signatures
- Internal Routes and Reads
- Payments Inbox
- Payments Worker
- Repo Docs and Test Topology
- Package Scripts
- Captcha, Circuit Breaker, Idempotency
- Billed Jobs and Routes
- Catalog Contracts
- Invoices
- User Settings and Model Config
- Provider Costs and Audit
- Video Service Assertions
- Ledger Book
- AI Schema and Thumbnails
- Podcasts, Ideas and Music Video
- Pricing Properties
- AI Text and Video Services
- Address Formats
- Job Transitions
- Fake Provider and Pricing
- Package Manifest
- Idempotency Receipts
- Usage and Token Logging
- Billing Resolutions
- Pricing Domain
- Ideas and GCS URLs
- Google Token Verifier
- Allowances and Calendar
- Error Handling Middleware
- Billing API
- Billing API
- Video Module
- Plan Sync Scripts
- Billing Adapters Payments
- AI Videoprompts Videoservice
- Jobs Billedjoboutcome Billedgenerationlog
- Image Resolution
- Atomic Transactions
- Tier Limits
- Runtime Dependencies
- Billing API
- Provider Response Capture
- Billing Payments
- Video Synthesis and Sharp
- Billing Drill
- Feature Entitlements
- Billing Payments
- Provider Boundary Lint
- Identity Audit
- Billing Profiles
- Job Service and Providers
- Disputes
- Billing Payments
- Billing Wallet Endpoints
- Billing Payments Subscription
- Dev Dependencies
- Jobs Integration Tests
- Billing Adapters Contracts
- Billing Adapters Pricing
- Transaction Tests
- Metrics Tests
- Crash Worker Recovery
- ESLint Allowlist
- Auth Epoch Bump
- Mongoose Models
- Billing API
- Billing Payments Plan
- Billing Adapters
- Billing API
- Mongo Init
- TypeScript Configuration
- Draft Videos
- Billing Adapters Pricing
- Billing API
- Image AI Imagerequests
- Circuit Breaker
- Podcast Models
- Billing Adapters
- SDK Checks
- Reconcile Scripts
- Billing API
- Billing API
- Podcast
- Database Roles
- Address Format Scripts
- Test TypeScript Config
- Billing Verify Reconciliation
- Tsconfig Compileroptions Noemit
- Billing Reconciliation
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Billing Restore Hostport
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Billing API
- Utils Pagination
- Billing API
- Billing API
- Assets Fonts Ofl
- Billing Backup Sh
- Ci Billing Sh
- Billing Wait For
- Setup Testenv

## God Nodes (most connected - your core abstractions)
1. `billingModels()` - 316 edges
2. `AppError` - 209 edges
3. `mongoose` - 132 edges
4. `vitest` - 115 edges
5. `microcredits` - 92 edges
6. `getWorkspaceModel()` - 88 edges
7. `express` - 85 edges
8. `publishConfig()` - 79 edges
9. `authenticatedPrincipalId()` - 77 edges
10. `draftConfig()` - 76 edges

## Surprising Connections (you probably didn't know these)
- `BYTEPLUS_GEOMETRY refusing unobserved resolutions` --semantically_similar_to--> `Cross-repo write guard (ask once per pair)`  [INFERRED] [semantically similar]
  test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md → .github/copilot-instructions.md
- `Search first, read the part not the file` --semantically_similar_to--> `Source map (entry, routes, modules, services, models)`  [INFERRED] [semantically similar]
  .github/copilot-instructions.md → README.md
- `jobOf()` --calls--> `getBillingGenerationJobModel()`  [EXTRACTED]
  test/billing/reconciliation.test.ts → src/models/GenerationJob.ts
- `workspace()` --calls--> `getWorkspaceModel()`  [EXTRACTED]
  test/billing/payments/billing-profile.test.ts → src/models/Workspace.ts
- `workspaceTier()` --calls--> `getWorkspaceModel()`  [EXTRACTED]
  test/billing/payments/plan-changes.test.ts → src/models/Workspace.ts

## Import Cycles
- 2-file cycle: `src/modules/billing/payments/inbox.ts -> src/modules/billing/payments/inboxRegistry.ts -> src/modules/billing/payments/inbox.ts`

## Hyperedges (group relationships)
- **coord request lifecycle discipline** — _github_copilot_instructions_coord_cli, _github_copilot_instructions_cross_repo_write_guard, _github_copilot_instructions_understanding_and_plan, _github_copilot_instructions_request_lifecycle_vocabulary, _github_copilot_instructions_ticket_id_commit_prefix [EXTRACTED 1.00]
- **Billing test topology deliberate constraints** — test_billing_docker_compose_standalone_no_replica_set, test_billing_docker_compose_auth_enabled, test_billing_docker_compose_nofile_ulimit, test_billing_docker_compose_tmpfs_data_db, test_billing_docker_compose_healthcheck_hello [EXTRACTED 1.00]
- **Provider cost evidence discipline** — test_fixtures_billing_invoices_byteplus_no_capture_yet_evidence_levels, test_fixtures_billing_invoices_byteplus_no_capture_yet_unverified_mapping_flag, test_fixtures_billing_invoices_byteplus_no_capture_yet_byteplus_geometry, test_fixtures_billing_invoices_byteplus_no_capture_yet_promotion_procedure, test_fixtures_billing_invoices_byteplus_no_capture_yet_contracts_s22 [EXTRACTED 1.00]

## Communities (148 total, 10 thin omitted)

### Community 0 - "Billing Invariants and E2E Tests"
Cohesion: 0.07
Nodes (71): mongoose, vitest, abandonScope(), recoverAbandonedScopes(), closeBillingConnection(), resetBillingModels, setBillingConnection(), CaptureAboveReservationError (+63 more)

### Community 1 - "Payments Client and Modes"
Cohesion: 0.04
Nodes (84): ActivePaymentsMode, paymentsFakeEnabled(), prepareLocalFakeRazorpay(), seconds(), backoffDelayMs(), basicAuthHeader(), CreateOrderInput, CreatePlanInput (+76 more)

### Community 2 - "Billing Contracts and Routing"
Cohesion: 0.03
Nodes (93): OUTPUT, isFeatureKey(), isRegisteredModel(), isTierKey(), modelEntry(), ModelMeter, ModelRegistryEntry, AdjustmentDocument (+85 more)

### Community 3 - "Billing Route Tests"
Cohesion: 0.05
Nodes (82): GenerationJobSchema, getBillingGenerationJobModel(), fakeProviderCalls, scriptDefault(), scriptModel(), runOutboxOnce(), runSettlementPass(), NOW (+74 more)

### Community 4 - "Provider Costs and Rollout"
Cohesion: 0.05
Nodes (84): arg(), CONTROLS, FEATURES, IMAGE_CONTROLS, IMAGE_RATE_CARD, LIMITS, main(), POLICY (+76 more)

### Community 5 - "Billing Grants and Persistence"
Cohesion: 0.03
Nodes (76): walletLock(), WalletTransactionContext, withWalletTransaction(), assertPerGrantLimit(), assertTierEntitlement(), assertWalletSpendable(), ASSIGN_TIER_OPERATION, AssignTierInput (+68 more)

### Community 6 - "Auth and Identity Principals"
Cohesion: 0.05
Nodes (49): ensureUserExistsInFirebase(), UserSchema, request(), UserRepository, AuthService, DISPOSABLE_DOMAINS, generateOTP(), { upsertOAuth } (+41 more)

### Community 7 - "Internal API and Subscriptions"
Cohesion: 0.04
Nodes (59): fakeRazorpayCalls, resetFakeRazorpay(), scriptFakeRazorpay(), resetPaymentsRuntime(), verifyWallet(), CommandContext, ADMIN, ALL_CAPS (+51 more)

### Community 8 - "Pricing Adapters and Domain"
Cohesion: 0.06
Nodes (48): byProvider, bytePlusVideoAdapter, bytePlusImageAdapter, compositeExecutionAdapter, compositeUsageAdapter, quantityFromPayload(), CUT_OFF_MESSAGE, googleGeminiAdapter (+40 more)

### Community 9 - "Provider Adapters"
Cohesion: 0.08
Nodes (37): resolveVideoModel(), authHeaders(), bytePlusVideoExecutionAdapter, bytePlusVideoUrl(), deleteBytePlusTask(), extractImageUrl(), extractVideoUrl(), parseBytePlusError() (+29 more)

### Community 10 - "Bypass, Cancel and Indexes"
Cohesion: 0.04
Nodes (50): dropIndex(), ensureBillingIndexes(), EnsureIndexesResult, ensureModelIndexes(), IndexableModel, isIndexSpecConflict(), resetEnsuredIndexes(), schemaIndexName() (+42 more)

### Community 11 - "AI Idea and Audio Services"
Cohesion: 0.10
Nodes (52): getVideoModelDurationLimits(), resolveImageModel(), resolveTextModel(), resolveVisionModel(), ai, execPromise, generateAudio(), generateVoiceoverScript() (+44 more)

### Community 12 - "Provider Authorization and Images"
Cohesion: 0.06
Nodes (50): authHeaders(), bytePlusImageExecutionAdapter, BytePlusImageOutcome, bytePlusImageSize(), performBytePlusImageRequest(), performFakeImageRequest(), FREE_MODEL_METHODS, getAI (+42 more)

### Community 13 - "Billing Worker and Metrics"
Cohesion: 0.04
Nodes (56): childPlaceholder(), countBilling(), recordTaskRun(), registerTaskHeartbeat(), reclaimExpiredInboxLeases(), EXPIRE_LOT_OPERATION, ALLOWANCES_INTERVAL_MS, allowancesTask (+48 more)

### Community 14 - "Video Route Tests"
Cohesion: 0.05
Nodes (47): duplicatesOf(), Finding, main(), Required, samePartial(), commandReceiptSchema, getCommandReceiptModel(), getBillingConnection() (+39 more)

### Community 15 - "MagicRoll and App Errors"
Cohesion: 0.08
Nodes (38): assertAssetsOwned(), AssetNotOwnedError, OwnedAssetRef, apiBase(), authHeaders(), CANCELLED, cancelMagicrollTask(), COMPLETED (+30 more)

### Community 16 - "Billing Domain and Pricing"
Cohesion: 0.05
Nodes (52): addMicrocredits(), assertInt64(), assertNever(), AttemptId, attemptIdSchema, AttemptState, ceilDiv(), ChargeId (+44 more)

### Community 17 - "Payment Expiry"
Cohesion: 0.05
Nodes (55): dateArg(), main(), asMinor(), cycleWithoutGrant(), DetectorCtx, DISPUTE_RESPOND_BY_SOON_MS, disputeLostWithoutRevocation(), disputeRespondBySoon() (+47 more)

### Community 18 - "Payment Routes and Catalog"
Cohesion: 0.08
Nodes (50): publishedOffersAt(), resolveAdmission(), subscriptionCredits(), OfferDocument, offerSchema, countries(), saveBillingProfile(), paymentsModeEnabled() (+42 more)

### Community 19 - "Payments Service Core"
Cohesion: 0.07
Nodes (49): microcreditsFromCreditString(), addHold(), applyDisputeEntity(), asMinor(), DisputeEntity, finding(), isDuplicateKey(), mapStatus() (+41 more)

### Community 20 - "Reconciliation and Settlement Tests"
Cohesion: 0.04
Nodes (47): AttemptNotAuthorizedError, authorizeInvocation(), markUncertain(), armed, CRASH_POINTS, CrashHandler, NamedCrashPoint, persistent (+39 more)

### Community 21 - "Billing Persistence"
Cohesion: 0.04
Nodes (54): allocationSchema, amount(), attemptSchema, auditSchema, billingConfigVersionSchema, BillingDispute, billingDisputeSchema, BillingDisputeStatus (+46 more)

### Community 22 - "Billing API"
Cohesion: 0.04
Nodes (53): const, type, anyOf, format, pattern, type, type, anyOf (+45 more)

### Community 23 - "Resolutions and Internal Reconciliation"
Cohesion: 0.09
Nodes (47): workspaceOfUsageScope(), writeAudit(), evidence, FINDING_KINDS, FINDING_STATUSES, findingQuery, Handler, objectId (+39 more)

### Community 24 - "Entitlements and Catalog Routes"
Cohesion: 0.09
Nodes (49): auditConfigChange(), availability(), AvailabilityReason, priceHint(), publishedRateCardAt(), toRateSnapshot(), windowAt(), configKey() (+41 more)

### Community 25 - "HTTP Cache and Channels"
Cohesion: 0.08
Nodes (42): googleapis, ChannelSchema, IChannel, ChannelSyncSchema, IChannelSync, IVideo, VideoSchema, router (+34 more)

### Community 26 - "Assets, Brand Kits and Elements"
Cohesion: 0.08
Nodes (36): express, PublicAssetSchema, AuthenticatedRequest, createAsset, deleteAsset, getAssets, getPublicAssets, toggleAssetPublicStatus (+28 more)

### Community 27 - "Video Synthesis and Capability"
Cohesion: 0.08
Nodes (35): getVideoPlatform(), CapabilityRequiresBillingError, requireBillingForFeature(), resolveCapability(), ResolvedCapability, checkAdmission(), RolloutMode, TEMP (+27 more)

### Community 28 - "Metrics and Reconciliation"
Cohesion: 0.07
Nodes (44): AGE_BUCKETS_SECONDS, AgeBuckets, AgedGauge, alert(), ALERT_RULES, AlertLevel, AlertRule, AlertTransition (+36 more)

### Community 29 - "Billing API Surface"
Cohesion: 0.05
Nodes (47): additionalProperties, properties, required, type, additionalProperties, properties, required, type (+39 more)

### Community 30 - "Service Assertions"
Cohesion: 0.07
Nodes (27): ClipInput, OWNER, videoApiService, VideoJobResponse, VideoRenderOwner, Express, replay, Request (+19 more)

### Community 31 - "Quotes, Allowances and Payers"
Cohesion: 0.07
Nodes (34): IWorkspace, TierAssignment, WorkspaceKind, workspaceSchema, WorkspaceStatus, IWorkspaceMembership, membershipSchema, WorkspaceRole (+26 more)

### Community 32 - "Reconciliation Persistence"
Cohesion: 0.06
Nodes (40): PAYMENT_DETECTORS, isTransient(), ADMIN_CLOSURE_REASONS, attemptWithoutSettlementDetector, barrierStallDetector, chargeBoundsDetector, compare(), concurrencyLeakDetector (+32 more)

### Community 33 - "Billed Job Types"
Cohesion: 0.09
Nodes (35): IdeaPipelineStages, textQuoteOptions(), BilledIdeaPipelineInput, Stage, stageContext(), startBilledIdeaPipeline(), awaitBilledJob(), BilledImageInput (+27 more)

### Community 34 - "Seed, Tier and Offer Drafts"
Cohesion: 0.06
Nodes (29): OFFERS, Buckets, contextTier, controlsFor(), FREE_OFFERS, main(), NO_OFFICIAL_SOURCE, PAID_TIERS (+21 more)

### Community 35 - "Auth Middleware and Signatures"
Cohesion: 0.09
Nodes (33): authService, changePassword, createUser, findOneUser, firebaseVerify, forgotPassword, googleAuth, login (+25 more)

### Community 36 - "Internal Routes and Reads"
Cohesion: 0.08
Nodes (38): bookEventsQuerySchema, bookSummaryQuerySchema, RunStatus, StatementEntry, StatementPage, statementQuerySchema, UsageQuery, UsageSummary (+30 more)

### Community 37 - "Payments Inbox"
Cohesion: 0.10
Nodes (32): asRecord(), claimInboxItem(), entityOf(), extractInboxRefs(), finishInboxItem(), header(), INBOX_BACKOFF_MS, INBOX_LEASE_MS (+24 more)

### Community 38 - "Payments Worker"
Cohesion: 0.09
Nodes (37): afterCycleFunded(), applyAuthoritativeEntity(), applySubscriptionEntity(), assignSubscriptionTier(), assignTierWithPlan(), cancelNow(), cancelSubscription(), ChangeSubscriptionResult (+29 more)

### Community 39 - "Repo Docs and Test Topology"
Cohesion: 0.06
Nodes (19): coord CLI and .coord board, coord ctx shared facts, creater-ai-backend repo, Decision record (coord decide), JET-nnn issue tags in code, jetKreate platform (3 repos), Contracts owned by creater-ai-backend, JetKreate creator API (+11 more)

### Community 40 - "Package Scripts"
Cohesion: 0.05
Nodes (39): scripts, api:schema, auth:bump-epoch, billing:address-formats, billing:backup, billing:capture, billing:drill, billing:job-indexes (+31 more)

### Community 41 - "Captcha, Circuit Breaker, Idempotency"
Cohesion: 0.08
Nodes (25): app, backfillGenerationLogs(), connectMongo(), MONGO_OPTS, server, shutdown(), stopReceiptSweep(), registerRoutes() (+17 more)

### Community 42 - "Billed Jobs and Routes"
Cohesion: 0.10
Nodes (34): GenerationJobType, persistInlineReferences(), quote(), QuoteInput, imageToVideoJobSchema, router, textToVideoJobSchema, AUDIO_GENERATE (+26 more)

### Community 43 - "Catalog Contracts"
Cohesion: 0.10
Nodes (30): AdmissionPausedError, AdmissionState, assertNoOverlappingWindow(), assertOfferPublishable(), CardRow, catalogStatus(), DraftInput, editPublished() (+22 more)

### Community 44 - "Invoices"
Cohesion: 0.08
Nodes (33): buyerParty(), clean(), COLUMNS, countryCode(), countryName(), drawMark(), fillColors, FONT_DIR (+25 more)

### Community 45 - "User Settings and Model Config"
Cohesion: 0.09
Nodes (31): AUDIO_MODEL_MAP, AudioModelKey, CORE_MODELS, DEFAULT_AUDIO_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, DEFAULT_VIDEO_MODEL, entry() (+23 more)

### Community 46 - "Provider Costs and Audit"
Cohesion: 0.10
Nodes (32): arg(), has(), HEADLINE, main(), sourceFromFlags(), usd(), AuditActor, AuditInput (+24 more)

### Community 47 - "Video Service Assertions"
Cohesion: 0.08
Nodes (28): googleVeoExecutionAdapter, context, fetchMock, request, sdk, writes, VeoOperation, VeoRequest (+20 more)

### Community 48 - "Ledger Book"
Cohesion: 0.10
Nodes (33): ALL_CATEGORIES, Amount, and(), asBigInt(), BookEvent, bookEvents(), BookEventsPage, BookEventType (+25 more)

### Community 49 - "AI Schema and Thumbnails"
Cohesion: 0.11
Nodes (32): executeImageRequest(), largeBody, autoGenerateCastSchema, enhanceVideoPromptSchema, generateAudioSchema, generateCharacterImageSchema, generateIdeasSchema, generateSceneImageSchema (+24 more)

### Community 50 - "Podcasts, Ideas and Music Video"
Cohesion: 0.14
Nodes (28): createIdea, deleteIdea, findOne, getById, listByUser, patchScript, svc, updateIdea (+20 more)

### Community 51 - "Pricing Properties"
Cohesion: 0.11
Nodes (13): fast-check, AmountOutOfRangeError, gcd(), guard(), Rational, ceilRational(), componentUsd(), creditsToMicrocredits() (+5 more)

### Community 52 - "AI Text and Video Services"
Cohesion: 0.15
Nodes (30): DEFAULT_VISION_MODEL, performFakeTextRequest(), GoogleTextOutcome, generateMusicStoryboardController, executeTextRequest(), helperModelKey(), parseHelperJson(), PipelineStageRequest (+22 more)

### Community 53 - "Address Formats"
Cohesion: 0.11
Nodes (29): AddressField, AddressFieldKey, addressFormat, AddressIssue, clean(), CountryAddressData, countryName(), ADDRESS_DEFAULTS (+21 more)

### Community 54 - "Job Transitions"
Cohesion: 0.09
Nodes (22): GenerationJobStatus, ExecutionStopped, JobChanges, loggedProvider(), isJobActive(), JobEvent, events, states (+14 more)

### Community 55 - "Fake Provider and Pricing"
Cohesion: 0.09
Nodes (22): fakeProviderEnabled(), AttemptState, byIdempotencyKey, byRequestId, calls, DEFAULT_USAGE, fakeAdaptersEnabled(), FakeBehaviour (+14 more)

### Community 56 - "Package Manifest"
Cohesion: 0.07
Nodes (26): main, name, version, compression, cors, express-rate-limit, firebase-admin, helmet (+18 more)

### Community 57 - "Idempotency Receipts"
Cohesion: 0.13
Nodes (20): Env, CommandReceiptRecord, CommandResult, scopeLocks, acceptedJobResponse(), createsGenerationJob(), GenerationOperation, Claim (+12 more)

### Community 58 - "Usage and Token Logging"
Cohesion: 0.10
Nodes (24): GenerationLogSchema, GenerationUsage, IGenerationLog, UsageUnit, METER_UNIT, UNIT_NOUN, DbLogJobType, DbLogParams (+16 more)

### Community 59 - "Billing Resolutions"
Cohesion: 0.09
Nodes (26): CloseUncertainCompletedInput, CloseUncertainInput, CloseUncertainReceipt, EscalatePendingInput, EscalatePendingReceipt, FundOrderResolutionInput, FundOrderResolutionReceipt, HeldRunInput (+18 more)

### Community 60 - "Pricing Domain"
Cohesion: 0.09
Nodes (26): VersionId, attributeNumber(), AudioMinutesQuantity, CharactersQuantity, evaluateSelectors(), ExplanationLine, ImagesQuantity, isRateMap() (+18 more)

### Community 61 - "Ideas and GCS URLs"
Cohesion: 0.12
Nodes (8): IdeaSchema, IdeaRepository, stripBinary(), ideaRepo, IdeasService, findGcsUrls(), scan(), sanitizeGcsUrlsInObject()

### Community 62 - "Google Token Verifier"
Cohesion: 0.12
Nodes (15): defaultGoogleVerifier(), GOOGLE_TOKENINFO_URL, GOOGLE_USERINFO_URL, GoogleAuthNotConfiguredError, GoogleAuthUnavailableError, GoogleTokenInfoVerifier, GoogleTokenInfoVerifierOptions, isTrue() (+7 more)

### Community 63 - "Allowances and Calendar"
Cohesion: 0.15
Nodes (24): ALLOWANCE_TIME_ZONE, AllowancePeriod, allowancePeriodContaining(), ALLOWANCES_BATCH, enforcedByDefault(), ensureFreeAllowance(), ensureFreeWorkspacesForUsers(), FreeWorkspacesBackfill (+16 more)

### Community 64 - "Error Handling Middleware"
Cohesion: 0.10
Nodes (17): bcryptjs, jsonwebtoken, zod, mocks, mocks, errorHandler(), isDetailObject(), render() (+9 more)

### Community 65 - "Billing API"
Cohesion: 0.13
Nodes (26): items, type, items, type, items, type, items, type (+18 more)

### Community 66 - "Billing API"
Cohesion: 0.15
Nodes (26): minLength, type, type, request, request, request, request, request (+18 more)

### Community 67 - "Video Module"
Cohesion: 0.09
Nodes (12): deleteDrafts, findDrafts, findOneDraft, findOneOptimized, findOptimized, listDrafts, listOptimized, DraftVideoRepository (+4 more)

### Community 68 - "Plan Sync Scripts"
Cohesion: 0.12
Nodes (17): dotenv, main(), modeArg(), envSchema, originList, parsed, expectedKeyPrefix(), keyIdMatchesMode() (+9 more)

### Community 69 - "Billing Adapters Payments"
Cohesion: 0.12
Nodes (20): main(), modeArg(), audioFactsFrom(), AudioRequestFacts, pcmToWavBuffer(), persistTranscriptionUpload(), readPersistedUpload(), StoredAudio (+12 more)

### Community 70 - "AI Videoprompts Videoservice"
Cohesion: 0.18
Nodes (23): downloadVeoOutput(), submitVeoOperation(), veoVideoUri(), consistencyBlock(), enrichVeoPrompt(), lipSyncInstruction(), negativePromptBlock(), NO_TEXT_INSTRUCTION (+15 more)

### Community 71 - "Jobs Billedjoboutcome Billedgenerationlog"
Cohesion: 0.16
Nodes (23): getExecutionAdapter(), ADMIN_CLOSURE, adminClosure(), BilledOutcome, isDuplicateKey(), JOB_TYPE, logBilledGeneration(), logPendingBilledGeneration() (+15 more)

### Community 72 - "Image Resolution"
Cohesion: 0.11
Nodes (14): fluent-ffmpeg, @google-cloud/storage, VideoAspectRatio, CLIP_NO_TEXT_INSTRUCTION, CLIP_VISUAL_CONTINUITY_INSTRUCTION, ClipRequest, EXT_TO_MIME, gcsEnabled (+6 more)

### Community 73 - "Atomic Transactions"
Cohesion: 0.13
Nodes (22): capture(), currentScope, DELETE_OPS, encode(), fieldsEntry(), JOURNAL_COLLECTION, JournalDocument, journaled (+14 more)

### Community 74 - "Tier Limits"
Cohesion: 0.14
Nodes (20): TierModelLimits, assertWithinTierLimits(), ControlsLimitSource, effectiveLimits, ladderIndex(), LimitedOption, OPTION_WORDS, OptionNotInTierError (+12 more)

### Community 75 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, bcryptjs, compression, cors, dotenv, express, express-rate-limit, firebase-admin (+15 more)

### Community 76 - "Billing API"
Cohesion: 0.21
Nodes (23): endpoints, GET /api/billing/runs/:runId, GET /api/billing/statement, GET /api/billing/usage, GET /api/billing/wallet, GET /api/models, GET /api/plan, POST /api/billing/quotes (+15 more)

### Community 77 - "Provider Response Capture"
Cohesion: 0.17
Nodes (20): argValue(), BytePlusScenario, captureBytePlus(), captureVeo(), durationOverride(), estimateUsd(), main(), modelOverride() (+12 more)

### Community 78 - "Billing Payments"
Cohesion: 0.23
Nodes (19): block(), Cursor, drawClosing(), drawFooters(), drawHeader(), drawHeadline(), drawItems(), drawMeta() (+11 more)

### Community 79 - "Video Synthesis and Sharp"
Cohesion: 0.15
Nodes (5): sharp, execAsync, SynthesisService, mergeAudioByRef, mergeAudioWithVideo

### Community 80 - "Billing Drill"
Cohesion: 0.17
Nodes (19): card, connect(), controls, has(), log, main(), OUT_DIR, policy (+11 more)

### Community 81 - "Feature Entitlements"
Cohesion: 0.14
Nodes (16): FEATURE_KEYS, MODEL_REGISTRY, ResolvedSnapshot, ModelControlsDocument, PolicyDocument, RateCardDocument, RolloutDocument, validRateCard (+8 more)

### Community 83 - "Provider Boundary Lint"
Cohesion: 0.11
Nodes (15): eslint, Allowlist, AllowlistEntry, BYTEPLUS, EntryPoint, eslint, GEMINI, Inventory (+7 more)

### Community 84 - "Identity Audit"
Cohesion: 0.18
Nodes (16): main(), add(), collisions(), createIdentityAudit(), emptyCounts(), IdentityAuditReport, IdentityReference, ReferenceCollection (+8 more)

### Community 85 - "Billing Profiles"
Cohesion: 0.15
Nodes (17): BillingProfile, AddressValues, GST_STATES, addressValues(), BillingProfileInput, BillingProfileView, FOREIGN_PLACE_OF_SUPPLY, getBillingProfile() (+9 more)

### Community 87 - "Disputes"
Cohesion: 0.22
Nodes (18): buyerSnapshot(), addUtcCalendarMonths(), createOrder(), expiresAtForOffer(), fundOrder(), lotFundedBy(), paymentsSweep(), describePaymentMethod() (+10 more)

### Community 88 - "Billing Payments"
Cohesion: 0.22
Nodes (17): buyerFor(), DAY(), DEFAULT_SAC, describeSupply(), ensureCreditNote(), ensureTaxInvoice(), financialYear(), formatNumber() (+9 more)

### Community 89 - "Billing Wallet Endpoints"
Cohesion: 0.13
Nodes (16): runStatusSchema, statementPageSchema, usageSummarySchema, walletSummarySchema, acceptRun(), Actor, card, context() (+8 more)

### Community 90 - "Billing Payments Subscription"
Cohesion: 0.19
Nodes (16): RENEWAL_GRACE_MS, cancel(), change(), context(), create(), cycle(), fundAndActivate(), NOW (+8 more)

### Community 91 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, fast-check, ts-node-dev, @types/bcryptjs, @types/compression, @types/cors, @types/express (+7 more)

### Community 92 - "Jobs Integration Tests"
Cohesion: 0.21
Nodes (8): accepted, completed, create(), createdJobIds, Message, start(), Worker, workers

### Community 93 - "Billing Adapters Contracts"
Cohesion: 0.21
Nodes (14): asRecord(), ChildInput, childPlanOf(), ChildPlanSpec, DEFAULT_SUBSTITUTION_CHARS, expandCompositeQuote(), ExpandedComposite, optionsForChild() (+6 more)

### Community 94 - "Billing Adapters Pricing"
Cohesion: 0.23
Nodes (12): cardPricesReasoning(), GOOGLE_IMAGE_OUTPUT_TOKENS, googleImageOutputTokens(), IMAGE_PLAN_BOUNDS, ImageMeterRequest, ImageTokenBucket, imageTokenBuckets(), StatedImageTokens (+4 more)

### Community 95 - "Transaction Tests"
Cohesion: 0.18
Nodes (13): acquireLock(), applyUndo(), collections(), decode(), isDuplicateKey(), record(), recoverScope(), rollBack() (+5 more)

### Community 96 - "Metrics Tests"
Cohesion: 0.15
Nodes (13): publicBillingHealth(), accepted(), backdate(), card, context(), controls, LIMITS, NOW (+5 more)

### Community 97 - "Crash Worker Recovery"
Cohesion: 0.14
Nodes (14): beginSubmitting(), recordProviderRequestId(), claimOutboxItem(), closeStalledRuns(), dispatchRun(), outcomeEventKey(), pollContextFor(), settleAttempt() (+6 more)

### Community 98 - "ESLint Allowlist"
Cohesion: 0.14
Nodes (12): allowlist, ALLOWLIST_PATH, exempt, hostPattern, packagePattern, PAYMENTS_BOUNDARY, PROVIDER_BOUNDARY, providerBoundaryRules (+4 more)

### Community 99 - "Auth Epoch Bump"
Cohesion: 0.30
Nodes (8): main(), authEpochEnvSchema, authEpochSchema, currentAuthEpoch(), bumpUserAuthEpoch(), nextEpoch(), nextGlobalAuthEpoch(), NotFoundError

### Community 100 - "Mongoose Models"
Cohesion: 0.14
Nodes (8): AssetSchema, AuditLogSchema, IAuditLog, BrandKitSchema, FontConfigSchema, ElementSchema, MusicVideoSchema, MODEL_FILE_COUNT

### Community 101 - "Billing API"
Cohesion: 0.14
Nodes (14): minLength, type, controlsVersionId, modelKey, policyVersionId, rateCardVersionId, registryVersion, rolloutVersionId (+6 more)

### Community 102 - "Billing Payments Plan"
Cohesion: 0.19
Nodes (11): admin(), context(), FIRST, NOW, offer(), oid(), POLICY, SECOND (+3 more)

### Community 103 - "Billing Adapters"
Cohesion: 0.23
Nodes (8): BYTEPLUS_GEOMETRY, bytePlusGeometry(), bytePlusQuotableGeometries(), bytePlusVideoTokens(), Geometry, Capture, CAPTURED, captures

### Community 104 - "Billing API"
Cohesion: 0.15
Nodes (13): properties, enum, type, enum, type, outputFolder, outputFormat, resolution (+5 more)

### Community 105 - "Mongo Init"
Cohesion: 0.17
Nodes (10): admin, adminApiPrivileges, APP_COLLECTIONS, appWriterPrivileges, BILLING_COLLECTIONS, billingRepairPrivileges, billingWriterPrivileges, PARTICIPANTS (+2 more)

### Community 106 - "TypeScript Configuration"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 107 - "Draft Videos"
Cohesion: 0.17
Nodes (5): DraftVideoSchema, IDraftVideo, IOptimizedVideo, OptimizedVideoSchema, OptimizedVideoRepository

### Community 108 - "Billing Adapters Pricing"
Cohesion: 0.36
Nodes (10): asRecord(), AUDIO_TOKEN_BOUNDS, AudioTokenBucket, audioTokenBuckets(), billableCharacters(), scriptOf(), TEXT_PLAN_BOUNDS, withDerivedAudioPlan() (+2 more)

### Community 109 - "Billing API"
Cohesion: 0.17
Nodes (12): minLength, type, type, maxLength, type, maxLength, type, aspectRatio (+4 more)

### Community 110 - "Image AI Imagerequests"
Cohesion: 0.27
Nodes (10): legacyProviderAccess(), ACCEPTED_MODELS, generateImage, largeBody, router, generateImages(), isValidImageModel(), imageGenerateRequest() (+2 more)

### Community 112 - "Podcast Models"
Cohesion: 0.20
Nodes (3): PodcastSchema, podcastRepo, PodcastRepository

### Community 113 - "Billing Adapters"
Cohesion: 0.29
Nodes (8): GOOGLE_VIDEO_TOKEN_RATES, googleVideoTokenRate(), googleVideoTokens(), VideoTokenRate, TokenBucket, VideoMeterRequest, videoTokenBuckets(), withDerivedVideoPlan()

### Community 114 - "SDK Checks"
Cohesion: 0.22
Nodes (3): { GoogleGenAI }, { GoogleGenAI }, @google/genai

### Community 115 - "Reconcile Scripts"
Cohesion: 0.56
Nodes (8): arg(), has(), instant(), listQueue(), listRuns(), main(), pass(), ReconciliationFindingKind

### Community 116 - "Billing API"
Cohesion: 0.22
Nodes (8): additionalProperties, $schema, type, note, quoteOptions, image, $schema, title

### Community 117 - "Billing API"
Cohesion: 0.22
Nodes (9): additionalProperties, properties, required, type, authorizedCalls, cap, maxDurationSeconds, maxImages (+1 more)

### Community 119 - "Database Roles"
Cohesion: 0.25
Nodes (5): connectAs(), connections, DB, BillingTestRole, billingTestRoleUri()

### Community 120 - "Address Format Scripts"
Cohesion: 0.43
Nodes (7): Compact, getJson(), main(), OUT, Raw, regions(), split()

### Community 121 - "Test TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, rootDir, exclude, extends, include, ./tsconfig.json

### Community 122 - "Billing Verify Reconciliation"
Cohesion: 0.48
Nodes (6): arg(), has(), main(), report(), verifyAllWallets(), VerifyResult

### Community 123 - "Tsconfig Compileroptions Noemit"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, rootDir, extends, include, ./tsconfig.json

### Community 124 - "Billing Reconciliation"
Cohesion: 0.40
Nodes (5): dedupKey(), Detector, openFindingKeys(), runReconciliation(), reconcile()

### Community 125 - "Billing API"
Cohesion: 0.40
Nodes (5): default, exclusiveMinimum, maximum, type, childCalls

### Community 126 - "Billing API"
Cohesion: 0.40
Nodes (5): default, exclusiveMinimum, maximum, type, count

### Community 127 - "Billing API"
Cohesion: 0.40
Nodes (5): default, maximum, minimum, type, days

### Community 128 - "Billing API"
Cohesion: 0.40
Nodes (5): default, maximum, minimum, type, limit

### Community 129 - "Billing API"
Cohesion: 0.40
Nodes (5): retryAllowance, default, maximum, minimum, type

### Community 130 - "Billing API"
Cohesion: 0.40
Nodes (5): timeZone, default, maxLength, minLength, type

### Community 131 - "Billing API"
Cohesion: 0.40
Nodes (5): video, additionalProperties, required, $schema, type

### Community 132 - "Billing Restore Hostport"
Cohesion: 0.83
Nodes (3): hostport(), run(), billing-restore.sh script

### Community 133 - "Billing API"
Cohesion: 0.50
Nodes (4): maximum, minimum, type, cancelledAttempts

### Community 134 - "Billing API"
Cohesion: 0.50
Nodes (4): format, pattern, type, cancelRequestedAt

### Community 135 - "Billing API"
Cohesion: 0.50
Nodes (4): maximum, minimum, type, childrenClosed

### Community 136 - "Billing API"
Cohesion: 0.50
Nodes (4): maximum, minimum, type, childrenTotal

### Community 137 - "Billing API"
Cohesion: 0.50
Nodes (4): exclusiveMinimum, maximum, type, durationSeconds

### Community 138 - "Billing API"
Cohesion: 0.50
Nodes (4): format, pattern, type, from

### Community 139 - "Billing API"
Cohesion: 0.50
Nodes (4): default, maxItems, type, inputAssetIds

### Community 141 - "Billing API"
Cohesion: 0.67
Nodes (3): oneOf, type, financialState

### Community 142 - "Billing API"
Cohesion: 0.67
Nodes (3): referenceImages, maxItems, type

## Ambiguous Edges - Review These
- `Contracts owned by creater-ai-backend` → `Contracts section 22`  [AMBIGUOUS]
  test/fixtures/billing/invoices/byteplus/NO-CAPTURE-YET.md · relation: conceptually_related_to

## Knowledge Gaps
- **22 isolated node(s):** `@types/fluent-ffmpeg`, `@types/multer`, `express-rate-limit`, `pino-pretty`, `@types/bcryptjs` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1636 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `MagicRoll and App Errors` to `Billing Invariants and E2E Tests`, `Billing Contracts and Routing`, `Provider Costs and Rollout`, `Billing Grants and Persistence`, `Auth and Identity Principals`, `Internal API and Subscriptions`, `Pricing Adapters and Domain`, `Provider Adapters`, `Provider Authorization and Images`, `Video Route Tests`, `Billing Domain and Pricing`, `Payment Expiry`, `Payment Routes and Catalog`, `Payments Service Core`, `Reconciliation and Settlement Tests`, `Billing Persistence`, `Resolutions and Internal Reconciliation`, `Entitlements and Catalog Routes`, `Video Synthesis and Capability`, `Service Assertions`, `Quotes, Allowances and Payers`, `Reconciliation Persistence`, `Billed Job Types`, `Internal Routes and Reads`, `Payments Inbox`, `Payments Worker`, `Billed Jobs and Routes`, `Catalog Contracts`, `Provider Costs and Audit`, `Video Service Assertions`, `Ledger Book`, `AI Schema and Thumbnails`, `Podcasts, Ideas and Music Video`, `Pricing Properties`, `Job Transitions`, `Billing Resolutions`, `Pricing Domain`, `Google Token Verifier`, `Error Handling Middleware`, `Billing Adapters Payments`, `Atomic Transactions`, `Tier Limits`, `Billing Profiles`, `Job Service and Providers`, `Disputes`, `Billing Payments`, `Billing Adapters Pricing`, `Transaction Tests`, `Crash Worker Recovery`, `Auth Epoch Bump`, `Billing Reconciliation`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `@types/fluent-ffmpeg`, `@types/multer`, `express-rate-limit` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Billing Invariants and E2E Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.0667831489031256 - nodes in this community are weakly interconnected._
- **Why does `mongoose` connect `Billing Invariants and E2E Tests` to `Billing Route Tests`, `Provider Costs and Rollout`, `Billing Grants and Persistence`, `Auth and Identity Principals`, `Internal API and Subscriptions`, `Bypass, Cancel and Indexes`, `AI Idea and Audio Services`, `Billing Worker and Metrics`, `Video Route Tests`, `Payment Expiry`, `Payment Routes and Catalog`, `Payments Service Core`, `Reconciliation and Settlement Tests`, `Billing Persistence`, `HTTP Cache and Channels`, `Assets, Brand Kits and Elements`, `Metrics and Reconciliation`, `Quotes, Allowances and Payers`, `Reconciliation Persistence`, `Billed Job Types`, `Seed, Tier and Offer Drafts`, `Internal Routes and Reads`, `Payments Inbox`, `Payments Worker`, `Captcha, Circuit Breaker, Idempotency`, `Billed Jobs and Routes`, `Catalog Contracts`, `Invoices`, `User Settings and Model Config`, `Provider Costs and Audit`, `Ledger Book`, `Job Transitions`, `Package Manifest`, `Idempotency Receipts`, `Usage and Token Logging`, `Billing Resolutions`, `Ideas and GCS URLs`, `Allowances and Calendar`, `Jobs Billedjoboutcome Billedgenerationlog`, `Atomic Transactions`, `Billing Drill`, `Identity Audit`, `Billing Profiles`, `Billing Payments`, `Billing Wallet Endpoints`, `Billing Payments Subscription`, `Jobs Integration Tests`, `Metrics Tests`, `Crash Worker Recovery`, `Auth Epoch Bump`, `Mongoose Models`, `Billing Payments Plan`, `Draft Videos`, `Podcast Models`, `Reconcile Scripts`, `Database Roles`, `Billing Verify Reconciliation`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `Payments Client and Modes` be split into smaller, more focused modules?**
  _Cohesion score 0.03882741215298 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Billing Invariants and E2E Tests` to `Payments Client and Modes`, `Billing Route Tests`, `Provider Costs and Rollout`, `Billing Grants and Persistence`, `Auth and Identity Principals`, `Internal API and Subscriptions`, `Pricing Adapters and Domain`, `Provider Adapters`, `Bypass, Cancel and Indexes`, `Provider Authorization and Images`, `Video Route Tests`, `MagicRoll and App Errors`, `Billing Domain and Pricing`, `Payment Routes and Catalog`, `Reconciliation and Settlement Tests`, `Resolutions and Internal Reconciliation`, `Video Synthesis and Capability`, `Metrics and Reconciliation`, `Service Assertions`, `Quotes, Allowances and Payers`, `Seed, Tier and Offer Drafts`, `Auth Middleware and Signatures`, `Payments Inbox`, `Billed Jobs and Routes`, `Catalog Contracts`, `Invoices`, `Video Service Assertions`, `Pricing Properties`, `Address Formats`, `Job Transitions`, `Fake Provider and Pricing`, `Package Manifest`, `Idempotency Receipts`, `Usage and Token Logging`, `Google Token Verifier`, `Allowances and Calendar`, `Error Handling Middleware`, `Plan Sync Scripts`, `Tier Limits`, `Feature Entitlements`, `Provider Boundary Lint`, `Identity Audit`, `Billing Wallet Endpoints`, `Billing Payments Subscription`, `Jobs Integration Tests`, `Billing Adapters Pricing`, `Metrics Tests`, `Auth Epoch Bump`, `Billing Payments Plan`, `Billing Adapters`, `Billing Adapters Pricing`, `Database Roles`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Contracts owned by creater-ai-backend` and `Contracts section 22`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._