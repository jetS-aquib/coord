# Graph Report - music-jetkreate-frontend  (2026-10-19)

## Corpus Check
- 139 files · ~140,905 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .conf 1, .css 1)

## Summary
- 686 nodes · 1566 edges · 72 communities (31 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.84)
- Token cost: 108,845 input · 0 output

## Community Hubs (Navigation)
- AI Service Layer
- Voice & Asset Pickers
- Media & Podcast Workspaces
- Dashboard & Sidebar Navigation
- AI Model Config & Settings
- Authentication & Firebase
- App Bootstrap & Fetch Interceptor
- Caption Palette & Fonts
- Routing & Route Guards
- Package Manifest
- Text-to-Speech Service
- App View Enum
- TypeScript Config
- Runtime Dependencies
- Error Boundary & Static Pages
- Dev Dependencies
- React Router UI Primitives
- Local Storage DB
- Idea & Script Types
- Vite Build Config
- Redux Store & Constants
- Global Error Boundary
- First-Paint Latency Strategy
- Auth Slice & Admin Check
- Tutorials Page & YouTube Embeds
- Voice & Language Presets
- Google Analytics Tracking
- Limit & Waitlist Modals
- Brand Logo Assets
- Feature Error Boundary
- Videos Slice
- Public Assets Page
- NPM Scripts
- Tailwind Config
- Coming Soon Page
- Vite Env Types

## God Nodes (most connected - your core abstractions)
1. `apiFetchJson()` - 65 edges
2. `getStoredUserId()` - 50 edges
3. `apiFetch()` - 46 edges
4. `react` - 45 edges
5. `useAppSelector` - 30 edges
6. `handleResponse()` - 28 edges
7. `lucide-react` - 25 edges
8. `App()` - 25 edges
9. `react-router-dom` - 23 edges
10. `Sidebar()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Public App Logo Mark` --shares_data_with--> `Root Favicon Mark (blue rounded-square layers glyph)`  [INFERRED]
  public/app-logo.svg → favicon.svg
- `Public Favicon Mark` --shares_data_with--> `Root Favicon Mark (blue rounded-square layers glyph)`  [INFERRED]
  public/favicon.svg → favicon.svg
- `JetSynthesys Illustrated Logo Mark` --conceptually_related_to--> `Public App Logo Mark`  [INFERRED]
  jet-logo.svg → public/app-logo.svg
- `clearAllDraftsByUser()` --calls--> `apiFetch()`  [EXTRACTED]
  src/services/draftService.ts → src/services/apiClient.ts
- `clearDraftsByChannel()` --calls--> `apiFetch()`  [EXTRACTED]
  src/services/draftService.ts → src/services/apiClient.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **First-Paint Latency Strategy** — index_critical_path_preconnect, index_nonblocking_font_load, index_backend_api_warmup, index_shimmer_skeleton, index_inline_base_theme [INFERRED 0.85]
- **JetKreate Brand Identity Asset Set** — favicon_brand_mark, public_favicon_brand_mark, public_app_logo_brand_mark, jet_logo_jetsynthesys_mark [INFERRED 0.85]

## Communities (72 total, 41 thin omitted)

### Community 0 - "AI Service Layer"
Cohesion: 0.08
Nodes (60): API_BASE, API_BASE_VIDEO_PROCESSING, generateAudio(), generateScript(), transcribeAudio(), delay(), expandIdeaPipeline(), expandingPipelineIds (+52 more)

### Community 1 - "Voice & Asset Pickers"
Cohesion: 0.06
Nodes (63): SampleAudioPlayer(), VOICE_PRESETS, VoiceDropdownProps, VoiceSelector(), getAudioModelLabel(), getModelDisplayLabel(), IMAGE_MODEL_OPTIONS, AutocompleteItem (+55 more)

### Community 2 - "Media & Podcast Workspaces"
Cohesion: 0.06
Nodes (54): getVideoModelDurationLimits(), Dropdown, MusicToVideo(), StoryboardScene, VIDEO_ASPECT_RATIOS, VIDEO_MODELS, WorkspaceTab, PodcastForm() (+46 more)

### Community 3 - "Dashboard & Sidebar Navigation"
Cohesion: 0.13
Nodes (20): useAppDispatch(), useAppSelector, Sidebar(), SidebarProps, getSidebarSections(), Dashboard(), ElementItem, Elements() (+12 more)

### Community 4 - "AI Model Config & Settings"
Cohesion: 0.09
Nodes (25): AUDIO_MODEL_OPTIONS, AudioModelKey, DEFAULT_AUDIO_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL, DEFAULT_VIDEO_MODEL, ImageModelKey, ModelOption (+17 more)

### Community 5 - "Authentication & Firebase"
Cohesion: 0.14
Nodes (26): API_URL, AuthScreen(), AuthScreenInner(), DISPOSABLE_DOMAINS, prefetchDashboard(), VerifyEmailPage(), firebaseVerify(), forgotPassword() (+18 more)

### Community 6 - "App Bootstrap & Fetch Interceptor"
Cohesion: 0.12
Nodes (23): react-dom, react-redux, sonner, @tanstack/react-query, showGenerationLimitModal(), showWaitingListModal(), queryClient, root (+15 more)

### Community 7 - "Caption Palette & Fonts"
Cohesion: 0.11
Nodes (24): Animation, ANIMATIONS, CaptionPalette(), update(), CaptionPaletteProps, CaptionSettings, DEVANAGARI_FONTS, DEVANAGARI_ONLY_FONTS (+16 more)

### Community 8 - "Routing & Route Guards"
Cohesion: 0.19
Nodes (17): App(), AssetsLibrary, AudioGeneratorPage, Elements, MusicToVideo, NotFoundPage, PodcastForm, PodcastWorkspace (+9 more)

### Community 9 - "Package Manifest"
Cohesion: 0.11
Nodes (17): name, private, type, version, autoprefixer, class-variance-authority, clsx, firebase (+9 more)

### Community 10 - "Text-to-Speech Service"
Cohesion: 0.21
Nodes (4): TextToSpeechService, TTSOptions, ttsService, useTextToSpeech()

### Community 11 - "App View Enum"
Cohesion: 0.12
Nodes (17): AppView, AUTH, BRAINSTORM, ENTRY, GET_IDEAS_FORM, IDEA_SUCCESS, IDEAS_WORKSPACE, IMPROVE_VIDEO_LIST (+9 more)

### Community 12 - "TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+8 more)

### Community 13 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority, clsx, firebase, lucide-react, react, react-dom, @react-oauth/google (+8 more)

### Community 14 - "Error Boundary & Static Pages"
Cohesion: 0.14
Nodes (8): lucide-react, Props, State, PlaySampleAudioProps, LOADING_MESSAGES, faqData, FaqItem, FaqPageProps

### Community 15 - "Dev Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, rollup-plugin-visualizer, tailwindcss, tailwindcss-animate, @tailwindcss/vite, @types/node (+5 more)

### Community 16 - "React Router UI Primitives"
Cohesion: 0.22
Nodes (3): react, react-router-dom, RevenueOAuthCallback()

### Community 18 - "Idea & Script Types"
Cohesion: 0.18
Nodes (10): AudioSettings, Character, ChatMessage, Idea, ScriptData, ScriptDialogue, ScriptSegment, Shot (+2 more)

### Community 19 - "Vite Build Config"
Cohesion: 0.20
Nodes (5): rollup-plugin-visualizer, @tailwindcss/vite, vite, vite-plugin-compression2, @vitejs/plugin-react

### Community 20 - "Redux Store & Constants"
Cohesion: 0.22
Nodes (8): @reduxjs/toolkit, AppDispatch, RootState, store, SIDEBAR_SECTIONS, SidebarLink, SidebarSection, VISUAL_STYLES

### Community 21 - "Global Error Boundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 22 - "First-Paint Latency Strategy"
Cohesion: 0.29
Nodes (5): Inline Base Theme Tokens, JetKreate AI Video Creation Studio, Shimmer Skeleton Loading Style, SPA Root Mount Point, test-cicd-pipeline marker

### Community 23 - "Auth Slice & Admin Check"
Cohesion: 0.29
Nodes (6): ADMIN_ACCOUNTS, authSlice, AuthState, initialState, isCurrentUserAdmin(), persistedUser

### Community 24 - "Tutorials Page & YouTube Embeds"
Cohesion: 0.39
Nodes (7): getYouTubeEmbedUrl(), getYouTubeThumbnailUrl(), getYouTubeVideoId(), tutorialData, TutorialItem, TutorialsPage(), TutorialsPageProps

### Community 25 - "Voice & Language Presets"
Cohesion: 0.29
Nodes (6): ALL_VOICES, AudioSettings, EMOTION_PRESETS, LANGUAGES, MUSIC_PRESETS, VOICE_PRESETS

### Community 26 - "Google Analytics Tracking"
Cohesion: 0.48
Nodes (6): GA_MEASUREMENT_ID, initGA(), trackEvent(), trackPageView(), usePageTracking(), Window

### Community 27 - "Limit & Waitlist Modals"
Cohesion: 0.33
Nodes (4): GenerationLimitModalDetail, TYPE_CONFIGS, TypeConfig, WaitingListModalDetail

### Community 28 - "Brand Logo Assets"
Cohesion: 0.60
Nodes (4): Root Favicon Mark (blue rounded-square layers glyph), JetSynthesys Illustrated Logo Mark, Public App Logo Mark, Public Favicon Mark

### Community 30 - "Videos Slice"
Cohesion: 0.50
Nodes (4): initialState, videosSlice, VideosState, Video

### Community 31 - "Public Assets Page"
Cohesion: 0.40
Nodes (4): Asset, PublicAssets(), TabState, TabType

### Community 32 - "NPM Scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

## Ambiguous Edges - Review These
- `test-cicd-pipeline marker` → `JetKreate AI Video Creation Studio`  [AMBIGUOUS]
  README.md · relation: references

## Knowledge Gaps
- **28 isolated node(s):** `class-variance-authority`, `clsx`, `recharts`, `tailwind-merge`, `@types/node` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 288 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React Router UI Primitives` to `Voice & Asset Pickers`, `Media & Podcast Workspaces`, `Dashboard & Sidebar Navigation`, `AI Model Config & Settings`, `Authentication & Firebase`, `App Bootstrap & Fetch Interceptor`, `Caption Palette & Fonts`, `Routing & Route Guards`, `Package Manifest`, `Coming Soon Page`, `Text-to-Speech Service`, `Error Boundary & Static Pages`, `Redux Store & Constants`, `Global Error Boundary`, `Tutorials Page & YouTube Embeds`, `Google Analytics Tracking`, `Limit & Waitlist Modals`, `Public Assets Page`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **What connects `class-variance-authority`, `clsx`, `recharts` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.07963089542036911 - nodes in this community are weakly interconnected._
- **Why does `apiFetchJson()` connect `Media & Podcast Workspaces` to `AI Service Layer`, `Voice & Asset Pickers`, `Dashboard & Sidebar Navigation`, `Authentication & Firebase`, `Public Assets Page`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Voice & Asset Pickers` be split into smaller, more focused modules?**
  _Cohesion score 0.05859969558599695 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Error Boundary & Static Pages` to `Voice & Asset Pickers`, `Media & Podcast Workspaces`, `Dashboard & Sidebar Navigation`, `AI Model Config & Settings`, `Caption Palette & Fonts`, `Package Manifest`, `React Router UI Primitives`, `Tutorials Page & YouTube Embeds`, `Limit & Waitlist Modals`, `Public Assets Page`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `test-cicd-pipeline marker` and `JetKreate AI Video Creation Studio`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._