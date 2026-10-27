---
id: D-025
title: video-processing-backend keeps job state in the platform's Mongo, connecting to it directly
date: 2026-10-27
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: 
---

## Context

Job state — status, stage, output URL, measurement and the attempt-to-job mapping that stops a retried dispatch rendering twice (JET-155) — was JSON files under STORAGE_ROOT, which is /tmp inside the container. Every record goes with the container on a deploy, so a client still holding a job id gets a 404, and the attempt deduplication being a file on one machine's disk is what stops this service running as more than one instance. That now matters: with segment stitching (JET-202) fifteen segment jobs were measured running one at a time for 69s because MAX_CONCURRENT_JOBS is 1.

## Options considered

Keep the files; ask music-jetkreate-backend to expose job APIs and call them; connect to the platform's Mongo directly.

## Decision

This service connects to Mongo itself, with MONGO_URI — the same connection string music-jetkreate-backend reads, since the platform has one database server. Its own collection, video_jobs, which nothing else reads or writes. A partial unique index on attempt_id carries the JET-155 deduplication, and a TTL index expires records after JOB_RETENTION_DAYS. The file store stays and is still the default: unset MONGO_URI and nothing changes. With it set, the service refuses to start if Mongo is unreachable.

## Reason

Routing job state through the Node backend's API was considered and rejected: every stage change would become a network call, dozens per job and fifteen jobs per song, with a new way for a render to fail halfway; this service would stop being able to accept work when Node is down, which it can today; and /api/v1/jobs is this repo's contract, polled by creater-ai-backend too, so Node owning the state would mean two sources of truth and an extra hop. A direct connection keeps the contract where it is and makes the deduplication a unique index, which is correct across any number of instances rather than one. Keeping the file store as the default means no deployment has to be reconfigured and the offline test suite is unaffected.

## Consequences

DevOps copy one line, the MONGO_URI music-jetkreate-backend already has; no new server and no new credentials. pymongo is a new dependency, so the image rebuilds. Two services now share a database server: the collection is this one's and the Node side must not read or write it, or it becomes a second contract between them. Job records outlive the container and are dropped by the TTL rather than by a restart, so retention is now a setting somebody owns. The jti replay cache and the per-job timing dicts are still in-process, so this removes one of the three things in the way of running two instances, not all three.
