# QRmory Full Codebase Audit Findings

**Date:** 2026-02-11
**Status:** Pre-launch audit

---

## Critical (Fix Before Launch)

### Security

- [x] **Rate limiter fails open** — Returns "allowed" on Redis errors, meaning if Redis goes down, all rate limits are bypassed
- [x] **`/api/reserve-shortcode` has no auth check** — Anyone can reserve shortcodes without being logged in
- [x] **Admin check uses subscription level** — Admin access is determined by subscription level instead of a proper admin role flag
- [x] **Auth rate limiter commented out** — Login page rate limiting code is commented out, allowing brute force attempts

### Payments / Subscriptions

- [x] **Missing Paddle webhook handlers** — `subscription.resumed`, `transaction.payment_failed` now handled; refund/dispute handled via Paddle dashboard
- [x] **Free-tier downgrade bypasses Paddle** — Now cancels Paddle subscription via API before updating DB
- [x] **No server-side feature gating** — Templates and domain verify routes now enforce subscription limits; other routes already gated

### Broken Links

- [x] **`/contact`** — Fixed to `/help/contact`
- [x] **`/settings`** — Fixed to `/dashboard/settings`
- [x] **`/create`** — Fixed to `/dashboard/create`
- [x] **`/error`** — Not referenced in code; error.tsx boundaries added
- [x] **`/view/${code}`** — Not referenced in code; no fix needed

### UX / Legal

- [x] **No `error.tsx` boundary pages** — Added root and dashboard error boundaries
- [x] **No `robots.txt`** — Added robots.ts with proper rules
- [x] **Privacy policy outdated** — Updated to reference QRmory, current date, and actual third-party services
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

### Phase 1 (1-2 days) — Critical fixes ✅
Security fixes, missing webhook handlers, error pages, robots.txt, broken links

### Phase 2 (3-5 days) — Compliance and gating
Legal compliance, ~~server-side feature gating~~, onboarding, accessibility, input validation

### Phase 3 (1-2 weeks) — Optimisation
Performance optimization, DB indexes, caching, code-splitting, SEO, mobile fixes
