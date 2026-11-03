---
id: JET-247
title: The live request signing secret is in this repo's git history, and gitignoring the file does not take it out
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-03T23:34:08+05:30
updated: 2026-11-03T23:34:08+05:30
decisions: 
---

## Request

Rotate REQUEST_SIGNING_SECRET, and the matching key in all three clients, before this repo is pushed anywhere.

## Understanding

Found while untracking .env from music-jetkreate-mobile, which is what prompted checking whether untracking was enough. It is not. EXPO_PUBLIC_REQUEST_SIGNING_KEY was committed as a 64-hex value in d3ed8b5 and replaced by a dummy in a later commit, so it no longer appears in the working tree. I compared it against the live values by hash rather than by reading them: the hex string in history, music-jetkreate-backend's current REQUEST_SIGNING_SECRET, and this app's .env.local all share one digest. It is the key in use right now. What I am NOT claiming: this is not an incident. music-jetkreate-mobile has no git remote at all, so the history has not left the machine, and MOBILE-DESIGN.md already records that this key is extractable from the app binary and that the web client ships the same value as VITE_REQUEST_SIGNING_KEY, so its threat model always assumed a client could read it. What changes is the blast radius and who has to work for it: extractable-from-a-binary and readable-by-anyone-with-repo-access-forever are not the same thing, and the moment this repo gets a remote the history goes with it. Assumptions: (1) the backend owns the value and rotating it means updating the backend plus both clients in one go, or every signed request 403s with INVALID_SIGNATURE; (2) rewriting this repo's history is the wrong fix even though it is tempting while there is no remote, because the key would still be live and nobody would have rotated anything; (3) this is a security tradeoff either way and wants a decision record naming what was accepted.

## Plan

1. Generate a new REQUEST_SIGNING_SECRET of at least 32 characters.
2. Change it on the backend and in all three clients in one sitting: music-jetkreate-backend, music-jetkreate-frontend's VITE_REQUEST_SIGNING_KEY, and this app's .env.local. They must move together.
3. Verify a signed request still passes on each client, since a mismatch is a 403 on every protected route rather than a subtle failure.
4. Record the decision, including the part that does not go away: a key shipped to clients is readable by anyone holding a client, and rotation buys scope rather than secrecy.
5. Do it before music-jetkreate-mobile is given a remote. After that it is a push away from being permanent.

## Reason

A key that is live and sitting in committed history is a different thing from a key that is merely extractable from a binary, and .gitignore does not touch history. There is no remote yet, which makes this cheap to fix now and awkward to fix later.

## Related files

music-jetkreate-backend .env (REQUEST_SIGNING_SECRET), music-jetkreate-frontend VITE_REQUEST_SIGNING_KEY, music-jetkreate-mobile .env.local

## Acceptance criteria

The secret in use is not the one in music-jetkreate-mobile's git history; the backend, the web client and the mobile app all sign successfully against the new value; and a decision records what the shared-client-key tradeoff is and is not.

## Test steps

—

## Thread
2026-11-03T23:34:08+05:30 aquib N: created ticket, status: - -> open
