# video-processing-backend — aquib N

- **Current task:** JET-197 — frame endpoints; implemented, waiting on verification
- **Status:** waiting on human
- **Blockers:** —
- **Last updated:** 2026-10-23T16:30:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-10-23T15:04:34+05:30

Session ended while on JET-197. Touched: Dockerfile, docker-compose.yml, app/pipeline/stitch_pipeline.py, app/processors/ffmpeg/ffmpeg_engine.py, tests/test_target_frame.py, jet196_check.py, jet196_ass.py, video-stitching.md, +11 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T16:30:00+05:30

JET-197 implemented and handed back. Two synchronous endpoints — frame-extraction
returns a lossless PNG inline and stores nothing; frame-comparison takes the video
and the anchor rather than two image URLs, because with nothing stored the video
side has no URL. D-010 records both choices and the Rec.709 greyscale that keeps
the caller's 4.0 threshold meaningful. Shapes written down in contracts/video-frames.md
and both registered in the registry. Verified live over HTTP including six concurrent
extractions. Nothing committed; JET-196 is still open alongside this.

Next: someone runs the test steps on real material. The one thing synthetic clips
could not confirm is the middle of the caller's band (2.1-3.3 for a clip that
honoured its pin) — the 0 and 10+ ends are verified. Also still open from JET-196:
the landscape-only caption preview, and the rate-card question.
### 2026-10-22T15:35:25+05:30

Session ended while on JET-196. Touched: Dockerfile, docker-compose.yml, app/pipeline/stitch_pipeline.py, app/processors/ffmpeg/ffmpeg_engine.py, tests/test_target_frame.py, jet196_check.py, jet196_ass.py, video-stitching.md, +2 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T14:05:00+05:30

JET-196 implemented and moved to review. The audio/lyrics workflows now derive
orientation from the clips (majority wins, ties go landscape) while holding the
frame size fixed, so landscape callers are unchanged — verified by rendering both
orientations in the container. Both caption canvases follow the frame. D-005
records why the size is not derived. Nothing committed.

Next: someone runs the ticket's test steps against a real portrait job and closes
it. Two things left open — the caption preview is still landscape-only (noted on
video-captions.md, needs its own ticket), and nobody has confirmed with the rate
card owner that no video-service rate card declares a `resolution` enum selector;
if one does, a portrait job's settlement would fail where a landscape one does not.

### 2026-10-22T13:45:07+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T12:42:06+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T12:30:27+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-19T19:06:16+05:30

Session ended. Touched: graphify-out/.graphify_chunk_01.json. Nothing committed. (written automatically — no one said what is next)
