---
id: D-107
title: Song reads stop cooperatively on cancel; the caller decides when nobody wants a song
date: 2026-11-25
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-445
---

## Context

An abandoned song kept its read running for up to 20 min (Node re-asks) and held the one-at-a-time Demucs slot (D-106), so the song the user was waiting for queued behind it.

## Options considered

1. Kill the work: not possible for Python threads, and Demucs is in-process. 2. Cancel the asyncio task only: answers callers at once but the threads run on, and the request's temp dir is deleted under them. 3. A cancel flag carried in the work's context and checked between stages, with ReadCancelled as a BaseException.

## Decision

3. POST /api/v1/song-read/cancel {audioUrl[, language, lyricEngine]} flags every running read of that object. Checks: before Demucs (a queued song is skipped), Demucs's per-segment callback, every Gemini HTTP call, after waiting for the transcript lock, before the Whisper fallback. Callers get callback status 'cancelled' (409 inline). The video service does not track who wants a song; music-jetkreate-backend cancels only when no person and no render does (JET-446).

## Reason

BaseException passes the read path's many except-Exception fallbacks (Gemini to Whisper, in-process Demucs to subprocess, no transcript to bars-only), each of which would otherwise turn a cancel into more work or a cached half read. Who-wants-what is already tracked in Node, for both users and renders.

## Consequences

A cancel lands within one Demucs segment (~1-6s) or one in-flight Gemini call (up to ~70s for a sheet, network only, no CPU). The Whisper decode itself has no check, so a cancel during a Whisper fallback lands only when it ends.
