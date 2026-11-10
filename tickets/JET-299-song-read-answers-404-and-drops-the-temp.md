---
id: JET-299
title: song-read answers 404 and drops the tempo when the read has no sections (short or wordless track)
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T15:54:36+05:30
updated: 2026-11-10T15:57:41+05:30
decisions: 
---

## Request

POST /api/v1/music-videos/song-read (and GET /:id/song-read) should still answer 200 with bpm, beatsPerBar, durationSeconds, downbeats and energy when the read has no sections, with sections: []. Today sendSongReadV1 answers 404 whenever read.sections is empty, so the app shows nothing for the track.

## Understanding

Seen on a 19s Hindi track (786KB mp3). video-processing answered 200 to both /lyric-transcription and /song-read, but Gemini heard 0 words (language unknown, 0 segments). The backend answered 404 to the app after 11s (musicVideoV1.routes.ts, sendSongReadV1: if (!read?.sections?.length) return 404). The app treats 404 as 'nothing to draw': no strip with BPM and parts, and Continue skips the Lyrics screen because there are no words. Assumptions I could not check: (1) the processing response had empty sections but a real bpm/downbeats (I did not see its body); (2) the track is too short or wordless for sections, not a processing failure; (3) the contract's 404 for 'instrumental or read unavailable' is meant to stay for a read with no bpm at all.

## Plan

1. In sendSongReadV1, answer 404 only when there is no read or no bpm/downbeats; otherwise 200 with sections possibly [].
2. Check the render planner still falls back to duration packing when sections is [].
3. Update the song-read note in api-music-videos.md: sections may be empty, 404 means no read at all.
4. Mobile (separate, already planned there): draw the tempo and say plainly when no words were heard.

## Reason

A creator uploads a short or wordless track and sees no tempo and no lyrics step, with no explanation, so it looks like the feature broke. Same backend answer also throws away a valid tempo.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A track whose read has bpm but no sections answers 200 with sections: []; a track with no read at all still answers 404; the render for that track still starts.

## Test steps

1. `npx vitest run src/modules/musicVideo/songRead.test.ts`: passes.
2. `POST /api/v1/music-videos/song-read` with the 19s Hindi track's audioUrl (…Chai_Ki_Tapri_Pe__-_RaagTune.mp3, already read): 200 with bpm ≈ 99.98, 8 downbeats, 7 energy values, sections: [] (was 404).
3. `GET /api/v1/music-videos/:id/song-read` for a project on that track: same 200.
4. A normal song: unchanged 200 with its sections. An audioUrl the processing service cannot read: still 404.
5. Start a render on the short track: it starts and cuts by duration (log: no "cut to the song" line).

## Thread
2026-11-10T15:54:36+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:54:54+05:30 aquib N: status: open -> approved
2026-11-10T15:57:41+05:30 aquib N: status: approved -> in_progress
2026-11-10T15:57:41+05:30 aquib N: Root cause confirmed: the stored read for the 19s track is valid (bpm 99.98, 8 downbeats, 7 energy, language unknown, sections 0; Gemini heard no words, so nothing to section). Only sendSongReadV1's guard was wrong (404 on empty sections). Now 404 only when there is no read or no beat (bpm > 0 and at least one downbeat); otherwise 200 with sections: []. Assumption (3) in the request holds. Checked: cutPlanV1 returns [] for no sections, so the render packs by duration as before; the brief already has a no-sections fallback. Contract updated. Mobile half is theirs as planned.
2026-11-10T15:57:41+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
2026-11-10T16:03:17+05:30 aquib N: For mobile (plan step 4). Backend now answers 200 with bpm, beatsPerBar, durationSeconds, downbeats[], energy[] and sections: [] when a track has a beat but no words (verified: the 19s track returns bpm 99.98, 8 downbeats, 7 energy). The Pick-a-track screen still hides the strip whenever sections is empty, so it shows only 'We could not hear words or parts'. Needed: when sections is [] but downbeats exist, draw the bar/energy strip and the BPM with no part labels, keep the 'no words heard' line, and skip the Lyrics step as today. 404 still means no read at all.
INVESTIGATION of the 'it has words' report: the file picked (…Chai_Ki_Tapri_Pe__-_RaagTune.mp3) is 786,432 bytes exactly, 19.6s at 320 kbps, and ends mid-frame; the app's own player shows 0:19 from the local copy, so the file on the device is 19s (an incomplete download or a preview), not an upload truncation. Gemini sent the clip directly: 0 words with hi, 1 stray character with auto. It is the song's intro. The same song read fine at 145s from a different download (Rakesh_Kumar_-_Oye_Hoye…). Not a backend or upload bug.
