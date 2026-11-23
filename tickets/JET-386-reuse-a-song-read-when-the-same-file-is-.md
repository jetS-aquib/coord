---
id: JET-386
title: Reuse a song read when the same file is uploaded again: key song reads by a hash of the audio, not only by its URL
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:47:45+05:30
updated: 2026-11-23T17:15:01+05:30
decisions: D-096
---

## Request

SongReadV1 is unique by audioUrl (models/SongReadV1.ts:24) and every upload gets a new key (routes/ai.ts:91 uploads/${Date.now()}_name), so uploading the same song again re-runs transcription (~90s measured on device for a song already in the account). Compute a SHA-256 of the bytes in the upload proxy, return it, store it on the read, and let song-read reuse an existing read with the same hash.

## Understanding

Assumptions: (1) local-upload already holds the whole body (express.raw 50mb), so hashing costs ~nothing; (2) a reused read is copied to a new SongReadV1 row for the new audioUrl (keeps every findOne({audioUrl}) call site unchanged) rather than changing seven lookups; (3) lyric edits on the old read carry over (they are the user's corrections of the same song); (4) across users is fine — a read is derived from the audio, not personal data — but say so in a decision if you disagree; (5) the in-flight map should also key by hash so two uploads of one file share one read.

## Plan

1. local-upload: sha256 the body, return {publicUrl, contentHash}; also add contentHash to gcs-presign's response flow.
2. SongReadV1: contentHash field + index.
3. POST /song-read accepts optional contentHash; before reading, find a read by hash and clone it to this audioUrl.
4. readsInFlight keyed by hash when present.
5. Test: upload the same file twice -> second song-read answers 200 in <2s.

## Reason

Cuts the first and longest wait in the app for anyone re-using a song, and saves a Whisper run each time (cost).

## Related files

src/routes/ai.ts, src/shared/gcs.ts, src/models/SongReadV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Upload Zaaya.mp3 twice from the app; the second Pick a track shows parts and lyrics within ~3s instead of ~90s, and logs show no second transcription.

## Test steps

—

## Thread
2026-11-23T15:47:45+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:50:47+05:30 aquib N: status: open -> approved
2026-11-23T17:11:46+05:30 aquib N: Built, not committed. Hash computed server-side in local-upload (never trusted from the app), stored on a placeholder SongReadV1; sharedSongReadV1 copies a fresh read with the same hash (edits included). Skipped: in-flight join by hash (two uploads read at the same moment both transcribe). TEST: 1) upload the same file twice -> both answers carry the same contentHash; 2) song-read the first until 200; 3) song-read the second -> 200 in ~3s, same lyrics; 4) log says 'song read reused from an earlier upload' and no second read call.
2026-11-23T17:12:31+05:30 aquib N: linked decision D-096 (Song reads are reused across uploads, and across users, by a hash of the audio bytes)
2026-11-23T17:15:01+05:30 aquib N: status: approved -> in_progress
