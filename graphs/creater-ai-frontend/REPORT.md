# Graph Report - creater-ai-frontend  (2026-10-19)

## Corpus Check
- 201 files · ~176,222 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .conf 1, .css 1)

## Summary
- 1415 nodes · 4311 edges · 66 communities (60 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.87)
- Token cost: 128,396 input · 2,600 output

## Community Hubs (Navigation)
- YouTube Channels and Revenue
- Payments and Razorpay Checkout
- Auth, Firebase and Env Config
- Usage Settings and Wallet UI
- Motion Primitives
- Ideas Workspace and Prompts
- Billing Offers and Plans
- Routing, Legal and Settings Shell
- Dashboard and Channel Onboarding
- Build Scripts and Type Generation
- AI Model Registry and Media
- Repo Docs and App Shell
- Video Dashboard and Brand Kits
- Model Settings and Defaults
- Media Elements and API Config
- Audio Generation
- AI Video and Thumbnail Services
- Loader Animations
- Idea Upload and Brainstorm
- Model Picker and Option Locks
- Title and Thumbnail Optimisation
- Profile Settings and Credit Format
- Video Generation and Run Status
- Videos Page and My Channels
- Plan Change and Payment History
- Billing Types
- Subscription Settings and Checkout
- Podcast Workspace
- Shared AI Service Layer
- Package Manifest
- Store Wiring and React Entry
- Billing Details Form
- Image Generation
- Runtime Dependencies
- Text to Speech
- App View Types
- TypeScript Configuration
- Videos Slice and Redux Toolkit
- Dev Dependencies
- API and Billing Error Types
- Idea Tabs
- Billing Slice and Tests
- Billed Video Runs
- Settings Page and Bounce Motion
- Motion Tabs and Easing
- Legal Content and Company Config
- Generation Quotes
- Billing Service Quotes
- Animated Components
- Local Storage Database
- Vite Build Plugins
- Stateful Button
- Spring Easing
- Error Boundary
- Brand Assets and App Icons
- Feature Error Boundary
- Idea to Video Pipeline
- Package Scripts
- Content Calendar
- User Settings Hook
- Request Signing
- Tailwind Configuration
- Vite Environment Types

## God Nodes (most connected - your core abstractions)
1. `react` - 115 edges
2. `apiFetchJson()` - 83 edges
3. `useAppSelector` - 78 edges
4. `cn()` - 69 edges
5. `lucide-react` - 67 edges
6. `apiFetch()` - 67 edges
7. `getStoredUserId()` - 52 edges
8. `react-router-dom` - 49 edges
9. `App()` - 47 edges
10. `useAppDispatch()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `JetSynthesys Jet Brand Mark (illustrated chevron logo)` --semantically_similar_to--> `Blue Rounded-Tile App Icon Container (#2864E8, rx=14)`  [AMBIGUOUS] [semantically similar]
  jet-logo.svg → public/favicon.svg
- `Source map of the repo` --semantically_similar_to--> `Search first, read the part not the file`  [INFERRED] [semantically similar]
  README.md → .github/copilot-instructions.md
- `JET-117 local retry verification fixture` --conceptually_related_to--> `Verification checks`  [AMBIGUOUS]
  test/local/index.html → README.md
- `JET-117 local retry verification fixture` --semantically_similar_to--> `SPA HTML shell`  [INFERRED] [semantically similar]
  test/local/index.html → index.html
- `Layered Stack Glyph (white two-plate 'layers' mark)` --semantically_similar_to--> `JetSynthesys Jet Brand Mark (illustrated chevron logo)`  [INFERRED] [semantically similar]
  public/favicon.svg → jet-logo.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **coord cross-repo request lifecycle** — _github_copilot_instructions_coord_cli, _github_copilot_instructions_cross_repo_write_rule, _github_copilot_instructions_understanding_and_plan, _github_copilot_instructions_state_name_rule, _github_copilot_instructions_decision_record [EXTRACTED 1.00]
- **Critical-path load budget in the HTML shell** — index_preconnect, index_font_preload, index_api_dns_prefetch, index_inline_base_style, index_shimmer_placeholder [EXTRACTED 1.00]
- **Fail-fast environment configuration contract** — readme_env_configuration, readme_envschema, readme_no_fallback_urls, index_api_dns_prefetch [INFERRED 0.85]
- **Frontend brand/icon asset set (three identical tiles plus the illustrated Jet mark)** — favicon_appicon, public_favicon_appicon, public_app_logo_appicon, jet_logo_brandmark [INFERRED 0.85]

## Communities (66 total, 6 thin omitted)

### Community 0 - "YouTube Channels and Revenue"
Cohesion: 0.06
Nodes (59): AddChannelModal(), AddChannelModalProps, SearchMethod, ChannelSidebarItem, ChannelSidebarProps, ChannelDetails(), channelInfoCache, ActiveSection (+51 more)

### Community 1 - "Payments and Razorpay Checkout"
Cohesion: 0.07
Nodes (57): CountrySelect(), filterOptions(), fold(), isExact(), SearchableSelect(), SearchableSelectProps, SearchOption, visibleBand() (+49 more)

### Community 2 - "Auth, Firebase and Env Config"
Cohesion: 0.07
Nodes (48): env, problems, source, envErrorMessage(), EnvKey, envProblems(), isHttpUrl(), OPTIONAL_ENV (+40 more)

### Community 3 - "Usage Settings and Wallet UI"
Cohesion: 0.07
Nodes (48): CHEVRON_TRANSITION, INSTANT_TRANSITION, ITEM_VARIANTS, LIST_VARIANTS, Placement, Select(), SelectContent(), SelectContentProps (+40 more)

### Community 4 - "Motion Primitives"
Cohesion: 0.07
Nodes (39): motion, Button, ButtonLink, ButtonLinkProps, ButtonProps, ButtonSize, ButtonVariant, Ripple (+31 more)

### Community 5 - "Ideas Workspace and Prompts"
Cohesion: 0.10
Nodes (25): IdeaSkeleton(), getModelDisplayLabel(), ALL_VOICES, AudioSettings, EMOTION_PRESETS, LANGUAGES, MUSIC_PRESETS, VOICE_PRESETS (+17 more)

### Community 6 - "Billing Offers and Plans"
Cohesion: 0.12
Nodes (34): CancelCopy, CreditPacks(), busyLabel(), changeKind(), creditLifetime(), currencySign(), isLive(), LIVE_STATUSES (+26 more)

### Community 7 - "Routing, Legal and Settings Shell"
Cohesion: 0.10
Nodes (34): App(), AssetsLibrary, AudioGeneratorPage, BrandKits, ChannelDetails, DescTagsOptimizer, Elements, ImageGeneratorPage (+26 more)

### Community 8 - "Dashboard and Channel Onboarding"
Cohesion: 0.10
Nodes (20): lucide-react, react, react-router-dom, sonner, WelcomeConnectModalProps, CopyButton(), PublicAssets, CommunityTab (+12 more)

### Community 9 - "Build Scripts and Type Generation"
Cohesion: 0.06
Nodes (24): here, out, OUTPUT, ts(), apiRequire, backend, cors, { createRequire } (+16 more)

### Community 10 - "AI Model Registry and Media"
Cohesion: 0.12
Nodes (29): getVideoModelDurationLimits(), VIDEO_MODEL_OPTIONS, VISUAL_STYLES, BrandKits(), MusicToVideo(), StoryboardScene, VIDEO_ASPECT_RATIOS, VIDEO_MODELS (+21 more)

### Community 11 - "Repo Docs and App Shell"
Cohesion: 0.07
Nodes (20): Dependency on creater-ai-backend, Shared API contracts, coord CLI, coord ctx shared facts, Decision records, JET-nnn issue tags, SPA HTML shell, Inline base body style (+12 more)

### Community 12 - "Video Dashboard and Brand Kits"
Cohesion: 0.13
Nodes (25): useAppDispatch(), useAppSelector, Layout(), Sidebar(), SidebarProps, getSidebarSections(), SIDEBAR_SECTIONS, SidebarLink (+17 more)

### Community 13 - "Model Settings and Defaults"
Cohesion: 0.10
Nodes (24): AUDIO_MODEL_OPTIONS, AudioModelKey, DEFAULT_AUDIO_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, DEFAULT_VIDEO_MODEL, getVideoModelLabel(), IMAGE_MODEL_OPTIONS (+16 more)

### Community 14 - "Media Elements and API Config"
Cohesion: 0.09
Nodes (20): API_URL, ElementItem, Elements(), generateAudio(), ApiRequestOptions, GenerationRequestOptions, postAudioGeneration(), responseError() (+12 more)

### Community 15 - "Audio Generation"
Cohesion: 0.12
Nodes (28): getAudioModelLabel(), AUDIO_MODELS, AUDIO_PACES, AUDIO_TONES, AUDIO_VOICES, AudioGenerator(), AudioModel, AudioPlayer (+20 more)

### Community 16 - "AI Video and Thumbnail Services"
Cohesion: 0.22
Nodes (29): IdeasWorkspace(), decode(), decodeAudioData(), decodePCMBase64(), pcmBytesToAudioBuffer(), localTruncateAtSentenceBoundary(), generateScript(), getTrendingTopics() (+21 more)

### Community 17 - "Loader Animations"
Cohesion: 0.10
Nodes (26): Ascii(), ASCII_SETS, Bars(), BAYER_4, Comet(), COMET_TRAIL, Dither(), DotMatrix() (+18 more)

### Community 18 - "Idea Upload and Brainstorm"
Cohesion: 0.17
Nodes (17): LOADING_MESSAGES, LoadingOverlay(), Brainstorm(), BRAINSTORM_QUESTIONS, DEFAULT_ANSWERS, MagicrollUnsupportedModal(), MagicrollUnsupportedModalProps, IdeasForm() (+9 more)

### Community 19 - "Model Picker and Option Locks"
Cohesion: 0.13
Nodes (24): ModelOption, TAG_LABEL, ModelPicker(), ModelPickerProps, TAG_STYLE, traitWords(), lockedWords(), limitsOf() (+16 more)

### Community 20 - "Title and Thumbnail Optimisation"
Cohesion: 0.15
Nodes (22): ChannelSidebar(), DescriptionTagsOptimizer(), AspectRatio, GeneratedVariant, IsolateVar, ThumbnailOptimizer(), VARIANT_COLORS, VARIANT_IDS (+14 more)

### Community 21 - "Profile Settings and Credit Format"
Cohesion: 0.18
Nodes (22): Input, StatefulButton, CreditsBlock(), DailyBars(), shortDate(), AccountUser, Balance(), errorText() (+14 more)

### Community 22 - "Video Generation and Run Status"
Cohesion: 0.12
Nodes (23): MAGICROLL_DURATIONS, RESOLUTIONS_DEFAULT, RESOLUTIONS_SEEDANCE_1, RESOLUTIONS_SEEDANCE_2_0, RESOLUTIONS_SEEDANCE_2_0_FAST_MINI, RESOLUTIONS_SEEDANCE_2_5, SEEDANCE_2_0_DURATIONS, SEEDANCE_2_5_DURATIONS (+15 more)

### Community 23 - "Videos Page and My Channels"
Cohesion: 0.14
Nodes (19): @tanstack/react-query, ChannelOnboarding(), ChannelOnboardingProps, YouTubeConnectBanner(), MyChannels(), SortField, SortOrder, ViewMode (+11 more)

### Community 24 - "Plan Change and Payment History"
Cohesion: 0.19
Nodes (19): CenterMorphModal(), CenterMorphModalClose(), CancelPlanModal(), ChangePlanModal(), copyFor(), Line(), PlanChange, dateLabel() (+11 more)

### Community 25 - "Billing Types"
Cohesion: 0.09
Nodes (22): CreditAmount, ExplanationLine, FinancialState, GetApiBillingRunsRunIdRequest, GetApiBillingRunsRunIdResponse, GetApiBillingStatementRequest, GetApiBillingStatementResponse, GetApiBillingUsageRequest (+14 more)

### Community 26 - "Subscription Settings and Checkout"
Cohesion: 0.20
Nodes (18): PlanSummary(), BillingDetailsRows(), Dialog, GateStatus(), SubscriptionSettings(), tierDisplayName(), useBillingOverview(), useWallet() (+10 more)

### Community 27 - "Podcast Workspace"
Cohesion: 0.18
Nodes (17): PodcastForm(), TitleOption, DialogueNode, PodcastWorkspace(), ScriptSegment, Segment, VOICE_PRESETS, SavedPodcasts() (+9 more)

### Community 28 - "Shared AI Service Layer"
Cohesion: 0.20
Nodes (14): API_BASE, transcribeAudio(), delay(), expandIdeaPipeline(), expandingPipelineIds, pollPipelineCore(), pollPipelineExtra(), API_URL (+6 more)

### Community 29 - "Package Manifest"
Cohesion: 0.11
Nodes (17): name, private, type, version, autoprefixer, class-variance-authority, clsx, firebase (+9 more)

### Community 30 - "Store Wiring and React Entry"
Cohesion: 0.18
Nodes (11): react-dom, react-redux, AppDispatch, RootState, store, queryClient, root, rootElement (+3 more)

### Community 31 - "Billing Details Form"
Cohesion: 0.19
Nodes (17): AddressSkeleton(), BillingDetailsForm(), Errors, Field, FIELD_CLASSES, fieldErrors(), fieldLabel(), initialValues() (+9 more)

### Community 32 - "Image Generation"
Cohesion: 0.16
Nodes (15): AutocompleteItem, CharacterAutocomplete(), CharacterAutocompleteProps, AudioGeneratorProps, IMAGE_ASPECT_RATIOS, IMAGE_MODELS, IMAGE_RESOLUTIONS, ImageGallery (+7 more)

### Community 33 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority, clsx, firebase, lucide-react, motion, react, react-dom (+9 more)

### Community 34 - "Text to Speech"
Cohesion: 0.21
Nodes (4): TextToSpeechService, TTSOptions, ttsService, useTextToSpeech()

### Community 35 - "App View Types"
Cohesion: 0.12
Nodes (17): AppView, AUTH, BRAINSTORM, ENTRY, GET_IDEAS_FORM, IDEA_SUCCESS, IDEAS_WORKSPACE, IMPROVE_VIDEO_LIST (+9 more)

### Community 36 - "TypeScript Configuration"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+8 more)

### Community 37 - "Videos Slice and Redux Toolkit"
Cohesion: 0.14
Nodes (14): @reduxjs/toolkit, initialState, videosSlice, VideosState, VideoPage, AudioSettings, ChatMessage, ScriptData (+6 more)

### Community 38 - "Dev Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, postcss, rollup-plugin-visualizer, tailwindcss, tailwindcss-animate, @tailwindcss/vite, @types/node (+6 more)

### Community 39 - "API and Billing Error Types"
Cohesion: 0.16
Nodes (9): vitest, BillingAction, describeOptionNotInTier(), describeUsageLimit(), KNOWN, OPTION_NOUN, ApiError, BillingError (+1 more)

### Community 40 - "Idea Tabs"
Cohesion: 0.34
Nodes (10): PendingBadge(), SummaryTab, BaseTabProps, CharactersTabProps, CommunityTabProps, MetadataTabProps, PackagingTabProps, ScriptTabProps (+2 more)

### Community 41 - "Billing Slice and Tests"
Cohesion: 0.24
Nodes (11): isNotBillableHere(), billingSlice, BillingState, fetchWallet, initialState, isSessionChange(), loadModels, getWallet() (+3 more)

### Community 42 - "Billed Video Runs"
Cohesion: 0.23
Nodes (12): INITIAL, RunPhase, StartInput, useBilledVideoRun(), cancelJob(), createQuote(), getJobStatus(), getRun() (+4 more)

### Community 43 - "Settings Page and Bounce Motion"
Cohesion: 0.23
Nodes (9): BOUNCE_SPRING, BounceSidebar(), BounceSidebarItem, BounceSidebarProps, quadraticBezier(), NAV, SettingsPage(), SUPPORT_EMAIL (+1 more)

### Community 44 - "Motion Tabs and Easing"
Cohesion: 0.21
Nodes (10): Ctx, listClasses, TabsContent(), TabsCtx, TabsList(), TabsTrigger(), transition, useTabs() (+2 more)

### Community 45 - "Legal Content and Company Config"
Cohesion: 0.32
Nodes (8): COMPANY, TRADING_NAME, LAST_UPDATED, LEGAL_DOCS, LEGAL_REVIEWED_ON, LegalDoc, LegalSection, POLICY_LINKS

### Community 46 - "Generation Quotes"
Cohesion: 0.20
Nodes (11): BillingErrorView, RunStatusProps, BilledRunState, QuoteKey, QuoteState, useGenerationQuote(), PurchaseState, JobStatus (+3 more)

### Community 47 - "Billing Service Quotes"
Cohesion: 0.20
Nodes (9): AUDIO_GENERATE, audioQuoteRequest(), IMAGE_GENERATE, imageQuoteRequest(), VIDEO_GENERATE, CancelReceipt, GetApiBillingUsageResponse, StartReceipt (+1 more)

### Community 48 - "Animated Components"
Cohesion: 0.18
Nodes (10): AnimatedBadge(), AnimatedBadgeProps, AnimatedBadgeSize, AnimatedBadgeStatus, ICON_CLASS, ICON_ROLL_VARIANTS, ICONS, SIZE_CLASS (+2 more)

### Community 50 - "Vite Build Plugins"
Cohesion: 0.20
Nodes (5): rollup-plugin-visualizer, @tailwindcss/vite, vite, vite-plugin-compression2, @vitejs/plugin-react

### Community 51 - "Stateful Button"
Cohesion: 0.31
Nodes (8): ButtonState, CASCADE_LETTER_VARIANTS, ICON_VARIANTS, IconSlot(), StatefulButton, StatefulButtonProps, TextSlot(), useRenderWhenFontsSettle()

### Community 52 - "Spring Easing"
Cohesion: 0.20
Nodes (9): EASE_DRAWER, EASE_IN_OUT, EASE_OUT_CSS, SPRING_GLIDE, SPRING_LAYOUT, SPRING_MOUSE, SPRING_PANEL, SPRING_PRESS (+1 more)

### Community 53 - "Error Boundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 54 - "Brand Assets and App Icons"
Cohesion: 0.39
Nodes (6): Root Favicon App Icon (blue tile + layered glyph), JetSynthesys Jet Brand Mark (illustrated chevron logo), Public App Logo (blue tile + layered glyph), Public Favicon App Icon (blue tile + layered glyph), Blue Rounded-Tile App Icon Container (#2864E8, rx=14), Layered Stack Glyph (white two-plate 'layers' mark)

### Community 55 - "Feature Error Boundary"
Cohesion: 0.25
Nodes (3): FeatureErrorBoundary, Props, State

### Community 56 - "Idea to Video Pipeline"
Cohesion: 0.36
Nodes (6): CharactersTab(), ElementItem, syncCharactersToStoryboard(), parseCharacterCast(), updateIdea(), Character

### Community 57 - "Package Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, preview, test, typecheck, types:billing

### Community 58 - "Content Calendar"
Cohesion: 0.33
Nodes (6): ScheduledIdea, IdeaSaveStatus, ideasSlice, IdeasState, initialState, Idea

### Community 59 - "User Settings Hook"
Cohesion: 0.52
Nodes (4): useUserSettings(), fetchUserSettings(), saveUserSettings(), UserSettingsPayload

### Community 60 - "Request Signing"
Cohesion: 0.52
Nodes (6): bufferToHex(), extractSessionNonce(), hmacSha256Hex(), sha256Hex(), SignatureHeaders, signRequest()

## Ambiguous Edges - Review These
- `Dependency on creater-ai-backend` → `JET-117 local retry verification fixture`  [AMBIGUOUS]
  test/local/index.html · relation: conceptually_related_to
- `Verification checks` → `JET-117 local retry verification fixture`  [AMBIGUOUS]
  test/local/index.html · relation: conceptually_related_to
- `JetSynthesys Jet Brand Mark (illustrated chevron logo)` → `Blue Rounded-Tile App Icon Container (#2864E8, rx=14)`  [AMBIGUOUS]
  jet-logo.svg · relation: semantically_similar_to

## Knowledge Gaps
- **30 isolated node(s):** `class-variance-authority`, `@types/node`, `@types/react`, `@types/react-dom`, `autoprefixer` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 475 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Dashboard and Channel Onboarding` to `YouTube Channels and Revenue`, `Payments and Razorpay Checkout`, `Auth, Firebase and Env Config`, `Usage Settings and Wallet UI`, `Motion Primitives`, `Ideas Workspace and Prompts`, `Billing Offers and Plans`, `Routing, Legal and Settings Shell`, `AI Model Registry and Media`, `Video Dashboard and Brand Kits`, `Model Settings and Defaults`, `Media Elements and API Config`, `Audio Generation`, `Loader Animations`, `Idea Upload and Brainstorm`, `Model Picker and Option Locks`, `Title and Thumbnail Optimisation`, `Profile Settings and Credit Format`, `Video Generation and Run Status`, `Videos Page and My Channels`, `Plan Change and Payment History`, `Subscription Settings and Checkout`, `Podcast Workspace`, `Package Manifest`, `Store Wiring and React Entry`, `Billing Details Form`, `Image Generation`, `Text to Speech`, `Idea Tabs`, `Billed Video Runs`, `Settings Page and Bounce Motion`, `Motion Tabs and Easing`, `Legal Content and Company Config`, `Generation Quotes`, `Animated Components`, `Stateful Button`, `Error Boundary`, `Feature Error Boundary`, `Idea to Video Pipeline`, `User Settings Hook`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **What connects `class-variance-authority`, `@types/node`, `@types/react` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `YouTube Channels and Revenue` be split into smaller, more focused modules?**
  _Cohesion score 0.05827505827505827 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Dashboard and Channel Onboarding` to `YouTube Channels and Revenue`, `Payments and Razorpay Checkout`, `Usage Settings and Wallet UI`, `Motion Primitives`, `Ideas Workspace and Prompts`, `Billing Offers and Plans`, `AI Model Registry and Media`, `Video Dashboard and Brand Kits`, `Model Settings and Defaults`, `Media Elements and API Config`, `Audio Generation`, `Idea Upload and Brainstorm`, `Model Picker and Option Locks`, `Title and Thumbnail Optimisation`, `Profile Settings and Credit Format`, `Video Generation and Run Status`, `Videos Page and My Channels`, `Subscription Settings and Checkout`, `Package Manifest`, `Image Generation`, `Idea Tabs`, `Settings Page and Bounce Motion`, `Motion Tabs and Easing`, `Legal Content and Company Config`, `Animated Components`, `Stateful Button`, `Feature Error Boundary`, `Idea to Video Pipeline`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Payments and Razorpay Checkout` be split into smaller, more focused modules?**
  _Cohesion score 0.06610259122157588 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Dependency on creater-ai-backend` and `JET-117 local retry verification fixture`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Verification checks` and `JET-117 local retry verification fixture`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._