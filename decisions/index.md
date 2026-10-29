# Decisions

| id | title | date | status | repos | tickets |
| --- | --- | --- | --- | --- | --- |
| D-001 | Onboarded music-jetkreate-backend to coordination | 2026-10-19 | active | music-jetkreate-backend |  |
| D-002 | Onboarded music-jetkreate-frontend to coordination | 2026-10-19 | active | music-jetkreate-frontend |  |
| D-003 | Onboarded video-processing-backend to coordination | 2026-10-19 | active | video-processing-backend |  |
| D-004 | Onboarded music-jetkreate-mobile to coordination | 2026-10-20 | active | music-jetkreate-mobile |  |
| D-005 | Stitch output orientation follows the source clips | 2026-10-22 | superseded by D-011 | video-processing-backend music-jetkreate-mobile music-jetkreate-backend creater-ai-backend | JET-196 |
| D-006 | Build the v1 render pipeline additively rather than migrating v0 | 2026-10-23 | active | music-jetkreate-backend |  |
| D-007 | v1 render orchestrator is standalone, not a jobService job type | 2026-10-23 | superseded by D-012 | music-jetkreate-backend |  |
| D-008 | v1 needs no data migration: the project document stays the source of truth | 2026-10-23 | superseded by D-013 | music-jetkreate-backend music-jetkreate-frontend music-jetkreate-mobile |  |
| D-009 | No ffmpeg in music-jetkreate-backend; frame work moves to video-processing-backend | 2026-10-23 | superseded by D-014 | music-jetkreate-backend video-processing-backend | JET-197 |
| D-010 | Frame endpoints answer synchronously and return the frame inline | 2026-10-23 | active | video-processing-backend music-jetkreate-backend | JET-197 |
| D-011 | A render missing any shot is blocked, not stitched; prompts are checked before any still is drawn | 2026-10-23 | superseded by D-015 | music-jetkreate-backend music-jetkreate-mobile | JET-198 |
| D-012 | v1 render orchestrator is standalone, not a jobService job type | 2026-10-23 | active | music-jetkreate-backend |  |
| D-013 | v1 needs no data migration: the project document stays the source of truth | 2026-10-23 | active | music-jetkreate-backend music-jetkreate-frontend music-jetkreate-mobile |  |
| D-014 | No ffmpeg in music-jetkreate-backend; frame work moves to video-processing-backend | 2026-10-23 | active | music-jetkreate-backend video-processing-backend | JET-197 |
| D-015 | A render missing any shot is blocked, not stitched; prompts are checked before any still is drawn | 2026-10-23 | active | music-jetkreate-backend music-jetkreate-mobile | JET-198 |
| D-016 | A clip is one shot: prompts carry the environment, anchors share one plate, and identity survives | 2026-10-23 | active | music-jetkreate-backend | JET-198 |
| D-017 | Portrait output is opt-in per deployment, not the default | 2026-10-26 | superseded by D-026 | video-processing-backend music-jetkreate-mobile music-jetkreate-backend creater-ai-backend | JET-196 |
| D-018 | Seam threshold re-based to 9.0 and re-renders capped at a fifth of the song | 2026-10-26 | active | music-jetkreate-backend video-processing-backend | JET-200 |
| D-019 | The anchor plate is a drawn six-panel reference sheet, on by default | 2026-10-26 | active | music-jetkreate-backend | JET-203 |
| D-020 | Lyric transcription is cached on the audio's bytes, not a transcript id | 2026-10-26 | superseded by D-021 | video-processing-backend music-jetkreate-backend | JET-201 |
| D-021 | Lyric transcription is cached on the audio's bytes, not a transcript id | 2026-10-26 | active | video-processing-backend music-jetkreate-backend | JET-201 |
| D-022 | Segments are jobs of their own; the finalise call is the one that settles the attempt | 2026-10-26 | active | video-processing-backend music-jetkreate-backend | JET-202 |
| D-023 | Anchors stay on the lite image model; the tier is a known ceiling on continuity | 2026-10-26 | active | music-jetkreate-backend | JET-203 |
| D-024 | Seams are measured as each clip lands, and the budget is spent first-come | 2026-10-26 | active | music-jetkreate-backend | JET-200 JET-202 |
| D-025 | video-processing-backend keeps job state in the platform's Mongo, connecting to it directly | 2026-10-27 | active | video-processing-backend music-jetkreate-backend |  |
| D-026 | The output frame is chosen per render by the caller, not by a deployment flag | 2026-10-27 | active | video-processing-backend music-jetkreate-mobile music-jetkreate-backend creater-ai-backend | JET-196 |
| D-027 | Clips are generated at the model's length and trimmed to the music's length | 2026-10-27 | active | music-jetkreate-backend video-processing-backend |  |
| D-028 | Beat tracking is numpy and ffmpeg, not librosa | 2026-10-27 | active | video-processing-backend music-jetkreate-backend | JET-206 |
| D-029 | Scene changes are cuts: no end pin, no seam score, measure the break and do not enforce it | 2026-10-27 | active | music-jetkreate-backend video-processing-backend | JET-210 |
| D-030 | The lyrics are stored here, keyed on the audio URL, and fill MusicVideo.lyrics when a project exists | 2026-10-27 | active | music-jetkreate-backend video-processing-backend | JET-211 JET-208 |
| D-031 | Scenes and clip lengths derive from the song's structure, not from the model's maximum duration | 2026-10-27 | active | music-jetkreate-backend video-processing-backend music-jetkreate-mobile | JET-206 JET-207 JET-212 |
| D-032 | The song read gates the flow: no brief until the track has been read | 2026-10-29 | active | music-jetkreate-mobile music-jetkreate-backend | JET-213 JET-214 JET-206 |
| D-033 | Performance and narrative are a ratio, defaulting to a third performance | 2026-10-29 | active | music-jetkreate-backend music-jetkreate-mobile |  |
| D-034 | The shot grammar is arithmetic in code; only what is in the frame is a model call | 2026-10-29 | active | music-jetkreate-backend |  |
| D-035 | Beam search only: a reproducible transcript beats a second look at a bad window | 2026-10-29 | active | video-processing-backend | JET-215 |
| D-036 | Subdivide a long block on its own lyric repetition, not with a structure model | 2026-10-29 | active | video-processing-backend | JET-215 |
| D-037 | The brief's questions are fixed; only its examples, hints and defaults come from the song | 2026-10-29 | active | music-jetkreate-backend music-jetkreate-mobile | JET-218 |
| D-038 | A stored song read carries the generation that wrote it, and a mismatch re-reads | 2026-10-29 | active | music-jetkreate-backend video-processing-backend | JET-219 |
| D-039 | Generated copy is written in the reader's language, which the song does not get to choose | 2026-10-29 | active | music-jetkreate-backend music-jetkreate-mobile |  |
| D-040 | The frame gate spends on what it can count, and only records what it must judge | 2026-10-29 | active | music-jetkreate-backend |  |
| D-041 | Mobile shows nothing of the frame gate until a live render says how often it fires | 2026-10-29 | active | music-jetkreate-mobile music-jetkreate-backend |  |
