# Decisions

| id | title | date | status | repos | tickets |
| --- | --- | --- | --- | --- | --- |
| D-001 | Onboarded music-jetkreate-backend to coordination | 2026-10-19 | active | music-jetkreate-backend |  |
| D-002 | Onboarded music-jetkreate-frontend to coordination | 2026-10-19 | active | music-jetkreate-frontend |  |
| D-003 | Onboarded video-processing-backend to coordination | 2026-10-19 | active | video-processing-backend |  |
| D-004 | Onboarded music-jetkreate-mobile to coordination | 2026-10-20 | active | music-jetkreate-mobile |  |
| D-005 | Stitch output orientation follows the source clips | 2026-10-22 | active | video-processing-backend music-jetkreate-mobile music-jetkreate-backend creater-ai-backend | JET-196 |
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
