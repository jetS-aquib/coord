---
id: JET-432
title: Public site: home, features, download, pricing, FAQ, support, privacy, terms and account deletion
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-24T17:05:02+05:30
updated: 2026-11-26T12:38:52+05:30
decisions: 
---

## Request

Build apps/www into the app's public website.

## Understanding

A marketing and legal site for the JetKreate Music app, built as static files (output: export), with no backend calls. Google Play requires a public account-deletion page describing how to delete an account and what data is removed; that page explains the in-app delete (DELETE /users/me) and gives a support email. Assumptions: copy, logo, screenshots, store links and the support email come from you (placeholders until then); privacy and terms text is supplied by legal, I only lay it out; no analytics on the site for now.

## Plan

1. Shared header/footer, responsive, light and dark.
2. Pages: / (hero, how it works, features, showcase), /pricing (plans and credits), /faq, /support, /privacy, /terms, /delete-account.
3. Metadata per page, sitemap, robots, OG image, favicon.
4. Lighthouse pass on mobile (performance, a11y, SEO >= 90).

## Reason

—

## Related files

apps/www/app/**, packages/ui/src/components/*

## Acceptance criteria

pnpm --filter www build produces out/ with every page; /delete-account is reachable from the footer; works at 360px wide.

## Test steps

—

## Thread
2026-11-24T17:05:02+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:38:52+05:30 aquib N: status: open -> approved
2026-11-26T12:57:01+05:30 aquib N: BUILT (uncommitted). apps/www static export: / (hero, how it works, features, showcase placeholder, download), /pricing, /faq, /support, /privacy, /terms (legal placeholder), /delete-account (matches backend deleteAccount.ts), sitemap, robots, icon.svg, OG image, OS dark mode. Placeholders all in apps/www/app/_components/site.ts (domain, App Store link, company name) + pricing plans + legal text, marked TODO(JET-432). Support email support@jetsynthesys.com and Play id com.jetsynthesys.jetkreatemusic taken from the app. Lighthouse pass not run yet. TEST: pnpm --filter www build -> out/ has every page; pnpm dev:www at 360px no sideways scroll; footer -> /delete-account.
2026-11-26T13:04:08+05:30 aquib N: Rebranded as jetKreate Music: app brand mark/icons, Studio Ink tokens, Geist + Instrument Serif. Home uses the app's own public GCS art (starter covers, 10 director avatars, 10 style stills). Google Play / App Store badges (App Store shows 'coming soon' until site.appStore is set).
2026-11-26T17:57:56+05:30 aquib N: WWW AUDIT + REVAMP (uncommitted). Impeccable critique: design review on the live site (desktop, light+dark, 390px via iframe) and the Impeccable detector (Lighthouse not run: the reviewer's npx download was blocked). Fixed: gradient headline text, hero/download glows and the eyebrow pill removed; hero collage replaced by a CSS-only 'cut' (four starter shots cross-cut on a 12s loop, an original lyric line lit word by word, shot strip with timecodes; still for reduced motion); How it works as a numbered sequence without cards; pricing rewritten to D-110 (free credits now, one-time credit packs coming, no subscription, 12-month expiry, refunds via the stores) replacing 'Plan name / Price TBC'; FAQ adds iPhone, buying credits and refunds, hedges render time, +/- marker; delete-account copy drops podcasts/brand kits and states the 8-year purchase-record rule (D-110); nav shows the current page; footer/mobile nav tap targets larger; store badges 11px, the iOS 'coming soon' badge no longer looks like a button; images with captions use empty alt; style strip keeps its inset; privacy and terms noindex and out of the sitemap until legal text exists; canonical per page; MobileApplication JSON-LD; OG image in Studio Ink; theme follows OS changes live; skip link. Left standing: detector 'cream-palette' and 'overused-font' (Studio Ink is the app's own brand); real domain, App Store link, company name and legal text still placeholders. TEST: pnpm --filter www build; / shows the phone cut animating and no gradient text; /pricing shows Free + Credit packs; out/sitemap.xml has no privacy/terms.
