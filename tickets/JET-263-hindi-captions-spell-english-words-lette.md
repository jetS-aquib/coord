---
id: JET-263
title: Hindi captions spell English words letter by letter: सीन comes out as 'sin', वॉक as 'vaॉk'
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: rejected
created: 2026-11-06T17:46:20+05:30
updated: 2026-11-09T02:06:45+05:30
decisions: 
closed: 2026-11-09
---

## Request

Romanize Hinglish lyrics the way people type them: English loanwords in English spelling, Hindi words in common Roman spelling.

## Understanding

Captions and romanized lyrics come from transliterator.transliterate, a letter-by-letter Devanagari->IAST->plain rule set, word by word. It cannot know a Devanagari word is an English loan, so सीन->sin, बेबी->bebi, में->men, चाय->chay, and वॉक->'vaॉk' (the ॉ sign leaks raw). Assumptions: (1) one Gemini call per song over its unique Devanagari words is cheap enough (~100-200 words, text only); (2) it reuses settings.gemini_api_key and lyric_gemini_model over httpx, like gemini_transcriber, so no new dependency; (3) any failure must fall back to today's rules, never fail a transcription; (4) cached transcripts must be invalidated, or songs already read keep 'sin'.

## Plan

1. New hinglish.py: hinglish_table(texts) -> {devanagari: roman}, one JSON-schema Gemini call, temperature 0, one retry, keeps only asked words with plain a-z answers, {} on failure or no key.
2. transliterate(text, language, known=None): a word in known uses that spelling; everything else, and everything when known is empty, keeps the rules byte-identical.
3. lyric_extractor.run builds the table once from raw and cleaned segment and word texts, passes it to both transliterate calls, times it as hinglish_spelling.
4. TRANSCRIPT_VERSION 2 -> 3.
5. tests/test_hinglish.py.

## Reason

On Hinglish songs the Roman captions are unreadable exactly on the English words the song leans on: scene, walk, floor, signal, baby.

## Related files

app/processors/lyrics/hinglish.py,app/processors/lyrics/transliterator.py,app/processors/lyrics/lyric_extractor.py,app/services/transcription.py,tests/test_hinglish.py

## Acceptance criteria

Rendering the chai-tapri Hindi song with roman captions shows 'oye hoye kya scene hai', 'teri walk mein jaan hai', 'floor', 'signal', 'baby'; with no GEMINI_API_KEY the captions are what they were.

## Test steps

1. Restart the video service (it has no --reload).
2. Render the Hindi 'kya scene hai' song with captions set to Roman/English.
3. The Python log shows '[LYRICS] hinglish spelling for N/M words' with N close to M.
4. The captions read 'kya scene hai', 'teri walk mein jaan hai', 'floor', 'signal', 'baby', 'chai ki tapri' — not 'sin', 'vaॉk', 'bebi', 'chay'.
5. An English song renders exactly as before (no hinglish line in the log).

## Thread
2026-11-06T17:46:20+05:30 aquib N: created ticket, status: - -> open
2026-11-06T17:47:03+05:30 aquib N: status: open -> approved
2026-11-08T16:35:31+05:30 aquib N: Superseded by JET-264: the Hinglish spelling should come from the same single Gemini call that writes the lyrics, not from a second call. Also, the JET-263 code was written into video-processing-backend directly, without a request being approved first; that broke the house rule. It is uncommitted there (hinglish.py, transliterator.py, lyric_extractor.py, transcription.py, tests/test_hinglish.py) and should be discarded or folded into JET-264 — the dev's call. Suggest dropping this one.
2026-11-09T02:06:45+05:30 aquib N: status: approved -> rejected — folded into JET-264
