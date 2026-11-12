# music-jetkreate-mobile — aquib N

- **Current task:** JET-278 mobile side: delete on the video screen. Uncommitted.
- **Status:** waiting on human
- **Blockers:** **A TestFlight build must point at STAGING.** D-065's bypass is keyed on `CAPTCHA_BYPASS_CLIENT`, staging sets it and production deliberately does not, so a production build still cannot sign in. JET-244 stays open for Play Integrity / App Attest. Still needs `coord approve`: JET-242, JET-243. `coord done 241`. Before any build: `eas init`, and the three `EXPO_PUBLIC_*` on the EAS environments, with the production profile's API URL pointed at staging until attestation lands.
- **Last updated:** 2026-11-10T06:00:00+05:30

## Handoff notes

### 2026-11-10T00:42:14+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md, src/app/(create)/ready.tsx, src/features/create/direction.ts, scripts/direction-check.mts, src/features/create/special-check.tsx, src/features/create/narration.ts, +1 more. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T05:00:00+05:30 (JET-274, mobile half)

`features/create/narration.ts` (deck + `check:narration`); working detail line uses
`narrate()` while running, falls back to `describeRender` without a stage. Warnings
panel is one sentence + "Tap to see". Library row unchanged (no render state on list).


### 2026-11-10T00:18:54+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md, src/app/(create)/ready.tsx, src/features/create/direction.ts, scripts/direction-check.mts, src/features/create/special-check.tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T03:00:00+05:30 (JET-273, mobile half)

`features/create/special-check.tsx` (inline card), `understandSpecial` in generation.ts,
draft `understood: { for, ingredients }`; directionBody sends `ingredients` only when
`for` matches the current special text (check:direction covers it). brief.tsx reads on
Continue. Not run on a device. Brief/treatment needs[] and the render-review hold are
still unbuilt on the backend (contract says so).


### 2026-11-09T23:56:17+05:30

Session ended while on JET-223. Touched: src/app/(create)/lyrics.tsx, i-want-you-to-piped-harbor.md, product-values-and-flow.md, src/app/(create)/ready.tsx, src/features/create/direction.ts, scripts/direction-check.mts. Nothing committed. (written automatically — no one said what is next)

