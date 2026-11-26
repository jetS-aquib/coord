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
