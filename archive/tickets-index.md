# Archived tickets

| id | title | from | to | closed | decisions |
| --- | --- | --- | --- | --- | --- |
| JET-193 | Allow non-production clients past the reCAPTCHA gate on login and register | music-jetkreate-mobile | music-jetkreate-backend | 2026-10-27 | — |
| JET-196 | Stitched output is hardcoded 1920x1080, so portrait clips come back pillarboxed | music-jetkreate-mobile | video-processing-backend | 2026-10-27 | D-005 D-017 D-026 |
| JET-197 | Frame extraction and frame comparison as API, so the Node backend runs no ffmpeg | music-jetkreate-backend | video-processing-backend | 2026-10-27 | D-009 D-010 D-014 |
| JET-198 | No way to find an in-flight v1 render by project id, so a client that loses the jobId cannot re-attach | music-jetkreate-mobile | music-jetkreate-backend | 2026-10-27 | D-011 D-015 D-016 |
| JET-199 | Anchor stills render one at a time, but the star topology no longer requires it | video-processing-backend | music-jetkreate-backend | 2026-10-27 | — |
| JET-200 | The 4.0 seam threshold is re-rendering nearly every clip, still, and doubling generation cost | video-processing-backend | music-jetkreate-backend | 2026-10-27 | D-018 D-024 |
| JET-201 | Kick off lyric transcription when the job starts, not when the clips are finished | video-processing-backend | music-jetkreate-backend | 2026-10-27 | D-020 D-021 |
| JET-203 | Make the anchor plate a small sprite of the cast and environment instead of a single frame | video-processing-backend | music-jetkreate-backend | 2026-10-27 | D-019 D-023 |
| JET-204 | Per-clip render state is now on the wire, so the reel can show which shot is being worked on | music-jetkreate-backend | music-jetkreate-mobile | 2026-10-27 | — |
| JET-205 | The anchor stills and the plate sprite are drawn but never sent, so the strip is 32 grey cards for the first few minutes | music-jetkreate-mobile | music-jetkreate-backend | 2026-10-27 | — |
| JET-206 | Song structure and beat map from the audio and the transcript | music-jetkreate-backend | video-processing-backend | 2026-10-27 | D-028 D-031 D-032 |
| JET-207 | Per-clip in and out points on the stitch request | music-jetkreate-backend | video-processing-backend | 2026-10-27 | D-031 |
| JET-208 | Warm the transcript when the audio is uploaded, not when the render starts | video-processing-backend | music-jetkreate-backend | 2026-10-27 | D-030 |
| JET-209 | Tell the server the song exists as soon as it has uploaded, so transcription can start | video-processing-backend | music-jetkreate-mobile | 2026-10-27 | — |
| JET-210 | The seam rule is applied across scene changes too, which is where it enforces the jump cut it exists to prevent | video-processing-backend | music-jetkreate-backend | 2026-10-27 | D-029 |
| JET-211 | Return the transcript text, so the lyrics we already paid to make can be kept and used | music-jetkreate-backend | video-processing-backend | 2026-10-27 | D-030 |
