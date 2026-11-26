---
id: D-108
title: Admin force logout by a revocation time on User; takedown as a moderation flag, not a delete
date: 2026-11-26
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-web
tickets: JET-428, JET-429
---

## Context

The console needs to sign a user out everywhere and to hide abusive content reversibly. Access tokens are stateless JWTs (15m) with a random snonce that is not stored; refresh tokens last 7 days.

## Options considered

Logout: (a) store snonce per user and rotate it; (b) tokenVersion counter in the JWT; (c) User.sessionsRevokedAt compared with the JWT's iat. Takedown: (a) delete; (b) soft-delete flag hiding from owner too; (c) moderation {hidden, reason, by, at} hiding only public surfaces.

## Decision

Logout = User.sessionsRevokedAt; requireAuth and refresh refuse any token with iat*1000 <= it. Takedown = moderation.hidden on MusicVideo/Podcast; the share page 404s and creating a share link is 403 taken_down; the owner keeps the item and the share token, so restore brings the same link back.

## Reason

(c) needs no token format change and no new claim, so every token already out there is covered; requireAuth already loads the User row, so it costs no extra query. Takedown must be reversible and an admin action should not silently vanish a creator's library item.

## Consequences

A sign-in within the same second as a force logout is refused (iat is whole seconds). Video (YouTube cache) gets no moderation. Podcasts have no public surface yet, so their flag only matters once one exists.
