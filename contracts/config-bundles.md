---
owner: music-jetkreate-backend
status: draft
---

# Config bundles (JET-412, JET-396)

Versioned data the app reads instead of shipping it in a build. Design: music-jetkreate-mobile
`docs/ux-revamp-v2/REMOTE_CONFIG.md`. Source of truth for the shapes:
`src/modules/config/configBundlesV1.ts` (`BUNDLE_SCHEMAS_V1`).

## Read (signed-in, signed requests)

`GET /api/v1/config/:bundle/:version` →
`{ bundle, version, schemaVersion, minAppVersion, createdAt, payload }`,
`Cache-Control: public, max-age=31536000, immutable`. 404 `{code:'bundle_not_found'}`.

`GET /api/v1/config/manifest` → `{ parent, bundles: {name: version}, killSwitch, source }`, `no-store`.
The fallback pointer when PostHog doesn't answer. Order: PostHog `ui-config` payload as the server
sees it → env `UI_CONFIG_MANIFEST` (JSON) → newest version of each bundle. `source` says which one answered.

## Publish (admin)

`POST /api/admin/config/:bundle` body `{ payload, schemaVersion?=1, minAppVersion?='0.0.0' }` →
201 with the stored version. An invalid payload returns 400 with the zod error. Publishing never moves the pointer.
That's a separate step: edit the payload of PostHog flag `ui-config`.

## Bundles (`schemaVersion` 1)

| bundle | payload |
|---|---|
| `starters` | `{ starters: [{ id, name, hook, trend, coverUrl, previewUrl, exampleVideoUrl, directorId, picks:{story,cast,place,mood}, where, special, visualStyle, showLyrics, captionStyle, captionPosition, coldOpen, aspectRatio, tier, order, enabled, from?, until?, demoTrack }] }` |
| `styles` | `{ styles: [{ id, label, prompt, stillUrls[], order, enabled, isNew }] }` |
| `lyricLooks` | `{ looks: [{ id (caption style key, '' = house), label, previewUrl, order, enabled }] }` |
| `directors` | `{ directors: [{ id, name, genre, intro, avatarUrl, order, enabled }] }`, display only |
| `copy` | `{ strings: { 'dotted.key': text } }` |
| `limits` | `{ password:{minLength,requireUpper,requireLower,requireDigit,requireSymbol}, titleMax, specialMax, uploadMaxMb, audioFormats[] }` |
| `home` | `{ blocks: [hero \| starterRow \| banner \| tileGrid \| text \| spacer] }`. Actions: `openStarter`, `openScreen` (`/create`, `/library`, `/settings`), `openUrl` (https on jetkreate.com), `startCreate`. Tone: `neutral` \| `cue` |

Media URLs are https, or `''` for art not drawn yet; the app shows its own placeholder.
How a starter maps to the create flow: `picks` + `where` + `special` → `direction`;
`visualStyle` is an id in `styles`, and its `prompt` is what's sent as `style`. `captionStyle` and
`captionPosition` → `captionSettings`. `showLyrics`, `coldOpen`, `aspectRatio` and `tier` are sent as they are.

## Seeded

`npx tsx scripts/seed-config.ts` publishes `src/modules/config/seedV1.ts`, keyed by position, so re-running is safe:
starters@1 (10 recipes), styles@1 (the app's six), styles@2 (+ digicam, super8, soft_focus, cyber_neon),
lyricLooks@1, directors@1, copy@1, limits@1, home@1. The starters use styles@2's looks, so the pointer needs `styles: 2`.
