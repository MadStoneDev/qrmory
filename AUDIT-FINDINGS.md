# QRmory Full Codebase Audit Findings

**Date:** 2026-02-11
**Status:** Pre-launch audit

---

## Critical (Fix Before Launch)

### Security

- [ ] **Rate limiter fails open** — Returns "allowed" on Redis errors, meaning if Redis goes down, all rate limits are bypassed
- [ ] **`/api/reserve-shortcode` has no auth check** — Anyone can reserve shortcodes without being logged in
- [ ] **Admin check uses subscription level** — Admin access is determined by subscription level instead of a proper admin role flag
- [ ] **Auth rate limiter commented out** — Login page rate limiting code is commented out, allowing brute force attempts

### Payments / Subscriptions

- [ ] **Missing Paddle webhook handlers** — `subscription.resumed`, `transaction.failed`, `transaction.refunded`, `transaction.disputed` events are unhandled
- [ ] **Free-tier downgrade bypasses Paddle** — Directly updates DB without cancelling the Paddle subscription
- [ ] **No server-side feature gating** — Feature access checks are client-side only; API routes don't enforce subscription limits

### Broken Links

- [ ] **`/contact`** — Should be `/help/contact`
- [ ] **`/settings`** — Should be `/dashboard/settings`
- [ ] **`/create`** — Should be `/dashboard/create`
- [ ] **`/error`** — Page doesn't exist, needs an `error.tsx` boundary
- [ ] **`/view/${code}`** — Route doesn't exist, references need updating or removing

### UX / Legal

- [ ] **No `error.tsx` boundary pages** — Unhandled errors show a blank/broken page
- [ ] **No `robots.txt`** — Search engines have no crawl guidance
- [ ] **Privacy policy outdated** — Dated 2022, references "RAVENCI" instead of QRmory
- [ ] **No onboarding flow** — New users land on dashboard with no guidance

---

## High Priority

### Performance

- [ ] **N+1 queries in batch QR generation** — Each QR in a batch triggers individual DB queries
- [ ] **Unused lodash dependency** — Adds ~72KB to bundle, not used meaningfully
- [ ] **No DB indexes** — Frequently queried columns (shortcodes, user_id) lack indexes
- [ ] **No cache headers on API responses** — Every request hits the server fresh
- [ ] **Uncached domain verification in middleware** — Domain check runs on every request

### Accessibility

- [ ] **Color contrast failures** — Several text/background combinations fail WCAG Level A
- [ ] **Missing focus indicators** — Interactive elements lack visible focus styles
- [ ] **Missing alt text** — Some images and icons lack descriptive alt attributes

---

## Medium Priority

### Performance

- [ ] **No code-splitting for QR component library** — All QR rendering code loads upfront
- [ ] **Mobile overflow in some dashboard views** — Horizontal scroll on narrow screens

### SEO

- [ ] **Incomplete meta tags** — Several pages missing Open Graph / Twitter card meta
- [ ] **No structured data** — No JSON-LD for rich search results

---

## Launch Readiness Phases

### Phase 1 (1-2 days) — Critical fixes
Security fixes, missing webhook handlers, error pages, robots.txt, broken links

### Phase 2 (3-5 days) — Compliance and gating
Legal compliance, server-side feature gating, onboarding, accessibility, input validation

### Phase 3 (1-2 weeks) — Optimisation
Performance optimization, DB indexes, caching, code-splitting, SEO, mobile fixes
