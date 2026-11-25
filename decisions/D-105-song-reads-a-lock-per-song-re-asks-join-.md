---
id: D-105
title: Song reads: a lock per song, re-asks join the work in flight, and gates only around Demucs and Whisper
date: 2026-11-25
status: active
superseded_by: 
repos: video-processing-backend
tickets: JET-442
---

## Context

D-021 put every transcription in the process behind one lock. JET-441's staging logs: 4 songs uploaded together waited 16-17 min each for ~4 min of work; Node's 60s re-asks parked up to 63 requests on that lock, filled the 8-thread default pool, and the audio downloads sharing it slowed to minutes and 15 failed.

## Options considered

1. Keep one lock, raise the pool size. 2. Per-song lock plus gates on the CPU-heavy stages, and re-asks join the running work. 3. A job queue (RQ/arq) in front of song reads.

## Decision

2. Transcript lock is per transcript key. separator.gate (Demucs, one at a time) and transcription.whisper_gate (one faster-whisper model) guard the CPU stages. deferred.answer_or_call_back joins a request to the task already running for the same object path + language + engine; each joined request still gets its own 202 and callback. Download writes get their own executor; the default pool is 64.

## Reason

Gemini calls are network-bound and can overlap; only Demucs and Whisper contend for cores. Joining removes the duplicate downloads and parked threads at the source. A queue adds a component for what an in-process dict already does on one worker.

## Consequences

Two different new songs now run their Gemini phase side by side and queue only for Demucs. Still one uvicorn worker; a second worker would need the join and the locks moved out of process.
