# music-jetkreate-backend — aquib N

- **Current task:** Batch 7B — the continuity supervisor. 7B.1 (the frame gate) built, tested, never yet run on a render.
- **Status:** waiting on human
- **Blockers:** 7B.1 unverified — needs one render (a 30s trim across a section boundary, ~$2-3, exercises it). Nothing committed.
- **Last updated:** 2026-10-29T17:50:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
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

