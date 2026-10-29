# music-jetkreate-backend — aquib N

- **Current task:** Batch 7B — the continuity supervisor. All six rows built (7B.1-7B.6), none yet run on a render.
- **Status:** waiting on human
- **Blockers:** 7B unverified — needs one render (a 30s trim across a section boundary, ~$2-3, exercises every phase). Nothing committed. JET-222 needs `coord ok 222`.
- **Last updated:** 2026-10-29T18:15:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-10-29T18:15

**Batch 7B is now built end to end.** 7B.1 earlier this session (see the 17:50 note);
this block is 7B.2 and 7B.3, the clip check, after JET-222 landed on their side.

**JET-222 delivered** — `atSeconds` takes a list and `maxWidth` shrinks the frame,
both on extraction only, both additive. They measured the estimate I guessed at: a
detailed 720p frame is 1.63MB PNG / 2.24MB base64, so 135 frames is ~100-300MB a song
rather than my 200-350 — right order, a little high at the top. At maxWidth 768 it is
0.57MB. **Still needs `coord ok 222`.**

Our side of it: `videoApiService.extractFrames(url, times[], ctx, maxWidth?)`, a
separate method rather than an overload, because the response shape is the thing that
differs — only a list answers with an array, and keeping the methods apart is what
preserves that guarantee here too.

**New: `src/services/render/clipCheckV1.ts`.** Samples two frames from the MIDDLE of
every finished clip and judges them. The middle is the point: the frame gate reads
the still before the clip exists, the seam check measures the two ends against the
stills either side, and **neither can see a clip that left its anchor, spent four
seconds elsewhere, and arrived back in time** — that clip scores a perfect seam at
both ends. Samples are taken at a third and two thirds of what SHIPS
(`musicalSeconds`, not `durationSeconds`), so a trimmed clip is judged on frames
someone actually watches — the same defect JET-212 removed from the seam check.

**7B.3 is asked against the plate, not the previous clip.** "Is the person in shot 12
the person on the reference sheet" answers the same question transitively for all 45
clips, needs no ordering between clips that are checked concurrently as they land,
and costs no extra call — the plate is one more image in a call already happening.

**D-043 is the new decision, and it narrows D-040.** D-040 governed the gate, where
acting costs cents. Acting here costs dollars out of the same fifth-of-the-song
budget the seam check uses. So: `verifyClipV1` now calls `verifySeamOfClipV1` then
`checkInsideClipV1`, in that order, on one budget — **the measured check spends
first**. The seam threshold is 9.0 over 132 clips; the clip check is measured over
nothing yet, and an unmeasured check must not starve a measured one. Making the order
structural rather than a comment is the point. `CLIP_REDRAW_ON_V1` is
`['people','location']` — narrower than the gate's three; 'text' is dropped because
the stills feeding every clip already passed the gate's text check, so paying a dollar
for it is paying twice for one defect. Continuity is recorded, never paid for.

Shared rather than copied, deliberately: `frameConstraintsV1`, `gateQuestionV1`,
`gateFailuresV1` and the answer parser all come from `frameGateV1`. Two parsers would
be two sets of rules about what a missing field means, which is the shape of every
threshold mistake here so far. It also makes one fact available that was not before —
**a clip failing the check whose own still passed the gate is a clip that drifted**,
rather than a still that was wrong.

One subtlety worth not re-deriving: a re-render for drift re-measures BOTH checks,
because the new take is pinned to the same stills but is not the same video — fixing
the drift can break the seam, and scoring only what we re-rendered for is how a fix
becomes a regression nobody sees. Also, the correction is APPENDED to the composed
prompt (`renderOneClipV1` gained an additive `correction` option) rather than
replacing it, so the environment, look and cast block survive; a re-render that drops
them is a different shot, not a corrected one.

Verdicts land on `RenderPlanV1.clips[].clipCheck` (passes included), with a
`clip check:` summary line printed from `runPlanV1` — NOT from inside `verifySeamsV1`,
which returns early on a normal render, which is exactly the run whose numbers matter.

`RENDER_CLIP_CHECK=0` turns it off independently of `RENDER_FRAME_GATE=0`.

**Next:** one render with both on. Everything above is a guess until the two
distributions exist — whether either list widens, whether continuity is trustworthy
enough to pay for, whether D10's second vision provider is worth the dependency.

140 tests (was 107), typecheck clean. Four do-not-touch files untouched.
**Nothing committed.**

### 2026-10-29T17:50

**Built 7B.1, the frame gate** — the first thing in this pipeline that looks at its
own output. A vision model reads every anchor still against that shot's stated
constraints before any clip is pinned to it. New file
`src/services/render/frameGateV1.ts`, wired into `renderAnchorsV1` (the worker, not a
request — the direction pass's 65.9s 202 is not repeated). Decision **D-040**.

Checks only what somebody wrote down: people count from the shot list's `castTags`,
location from the look bible's `locations` + `timeOfDay`, wardrobe from
`wardrobe[tag]`, plus lettering and anatomy which need nobody to state them. An
unstated constraint is SKIPPED, never guessed at.

**The decision is the spend/record split (D-040).** `GATE_REDRAW_ON_V1` holds three
kinds — people, location, text — and only those trigger a redraw. Wardrobe and
anatomy are recorded and never paid for: nobody has measured how often a vision model
is wrong about a generated frame, and a confidence threshold there would be the
fourth unmeasured number this codebase has bought after 4.0, 0.70/0.90 and Whisper's
language field. There is no score anywhere in the file — every rule is an integer or
a boolean compared in code.

Measured before building, 28 plans in Mongo: 25-74 anchors a render (typically
32-46); on the baseline `mvr_1793274379080_caa2155d` all 45 clips carry `castTags`
(38 want 1 person, 7 want 2) and an environment, and the bible has locations and
wardrobe per tag. So the gate has something stated on every frame at one vision call
per anchor against a ~$25 render.

Also in: **7B.4** for the still side (the failure sentence goes into the redraw
prompt — re-asking with identical words re-failed 29 of 31 times on the clip side),
**7B.5** (`RenderPlanV1.anchors[].gate` records pass, fail AND unchecked, plus one
summary line per render), **7B.6** (`gateBudgetV1` = one per anchor plus a fifth
again, the same fuse `rerenderBudgetV1` uses).

Fails soft everywhere: no vision model, a timeout or bad JSON records the anchor
`unchecked` and the render proceeds exactly as before. A plan with no shot list and
no bible states nothing, is skipped, costs zero — which is why it is on by default.
`RENDER_FRAME_GATE=0` turns it off.

**Not built: 7B.2 / 7B.3, the clip check.** Deliberate. 7B.2 folds into
`verifySeamsV1` and shares the re-render budget, so it changes the keep-or-re-render
call on clips that cost dollars, and the plan's own warning is that two thresholds
disagreeing is what 4.0 cost. Its open question is "how strict", and the gate's
stored verdicts from one real render answer that for the same vision model. Building
it blind first is the 4.0 mistake again. The reusable half is already there:
`frameConstraintsV1`, `gateQuestionV1`, `gateFailuresV1` and `checkFrameV1` take any
image URL, and `extractFrameV1` already samples a clip.

**Filed JET-222** -> video-processing-backend: several frames from one clip in one
call, plus an optional `maxWidth`. 7B.2 samples 2-3 frames of every finished clip, so
90-135 extractions a song where their contract was written for ~66, each a full 720p
lossless PNG inline. **Not a blocker** — JET-212's `atSeconds` is delivered and
integrated, so 7B.2 can make N full-size calls and pay for it. The ticket says so,
and says we may be wrong about its priority against JET-215.

**JET-212 is delivered and integrated but still open** — needs `coord ok 212`.

**Noted on JET-215**, not a new ticket: both recent renders return only two distinct
section labels, so the bible holds 2 locations for 45 clips and the gate's location
check is near-vacuous. It catches a frame that went somewhere else entirely; it
cannot catch the drift it was built for until boundaries are finer and stable.

**Checked and NOT a ticket:** 6.5's trim half. The delivery plan still says "nothing
sends them yet", but `stitchTrimmedV1` sends `outSeconds` and `seamCheckV1` has
`tailFrameV1`. The artifact is stale there.

**Next, in order:**
1. One render with the gate on. Read the `frame gate:` log line and the stored
   `anchors[].gate`.
2. From that distribution: does the list widen (wardrobe, anatomy)? Is one redraw
   enough? Is the false-pass rate bad enough to want D10's second vision provider?
3. Then 7B.2/7B.3 on top of measured numbers.

Untouched as required: `aiModels.ts`, `videoService.ts`, `synthesis.service.ts`,
`video.controller.ts`. 127 tests (was 107), typecheck clean. **Nothing committed.**

### 2026-10-29T17:42:17+05:30

Session ended while on JET-221. Touched: src/services/render/frameGateV1.ts, src/models/RenderPlanV1.ts, src/services/render/frameGateV1.test.ts, src/services/render/renderOrchestratorV1.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T12:10:51+05:30

Session ended while on JET-214. Touched: src/services/render/lookBibleV1.ts, src/services/render/treatmentV1.ts, src/services/render/cutPlanV1.ts, src/services/render/shotListV1.ts, src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/shotListV1.test.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:53:49+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:51:41+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:49:10+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:37:09+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:18:50+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

