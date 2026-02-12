# QRmory Full Codebase Audit Findings

**Date:** 2026-02-11
**Status:** Pre-launch audit

---

## Critical (Fix Before Launch)

### Security

- [x] **Rate limiter fails open** — Now fails closed; denies requests when Redis is down
- [x] **`/api/reserve-shortcode` has no auth check** — Now requires auth + rate limiting
- [x] **Admin check uses subscription level** — Now uses env-based `ADMIN_USER_IDS` allowlist
- [x] **Auth rate limiter commented out** — Re-enabled with per-email and per-IP limits
- [x] **No reCAPTCHA on public forms** — Added reCAPTCHA v3 to contact form and login
- [x] **Unprotected public APIs** — Added rate limiting to contact, location-search, error-reports

### Payments / Subscriptions

- [x] **Missing Paddle webhook handlers** — `subscription.resumed`, `transaction.payment_failed` now handled
- [x] **Free-tier downgrade bypasses Paddle** — Now cancels Paddle subscription via API before updating DB
- [x] **No server-side feature gating** — Templates and domain verify routes now enforce subscription limits

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

- [x] **N+1 queries in batch QR generation** — Batch shortcode generation + single insert replaces per-item queries
- [x] **Unused lodash dependency** — Removed lodash and lodash.throttle from package.json
- [ ] **No DB indexes** — Frequently queried columns (shortcodes, user_id) lack indexes
- [x] **No cache headers on API responses** — Added Cache-Control to location-search and templates endpoints
- [x] **Uncached domain verification in proxy** — Domain lookups now cached in Redis (5 min TTL)

### Accessibility

- [x] **Color contrast failures** — Fixed purple-300/400 on white to purple-500 for WCAG AA compliance
- [x] **Missing focus indicators** — Added focus-visible:ring to inputs, buttons, and controls
- [x] **Missing alt text / aria labels** — Added aria-label to icon buttons, aria-hidden to decorative SVGs

---

## Medium Priority

### Performance

- [x] **Missing QR component imports** — Added 9 missing QR type editors (phone, whatsapp, linkedin, etc.) to my-code-item
- [ ] **No code-splitting for QR component library** — All QR rendering code loads upfront
- [x] **Mobile overflow in some dashboard views** — Already handled with overflow-x-auto

### SEO

- [x] **Incomplete meta tags** — Added default OG/Twitter metadata to root layout, title template system
- [x] **No structured data** — Added JSON-LD WebApplication schema to homepage
- [x] **Help layout had placeholder metadata** — Replaced with proper layout using MainFooter

---

## Launch Readiness Phases

### Phase 1 (1-2 days) — Critical fixes ✅
Security fixes, missing webhook handlers, error pages, robots.txt, broken links

### Phase 2 (3-5 days) — Compliance and gating ✅
Legal compliance, server-side feature gating, reCAPTCHA, accessibility, rate limiting

### Phase 3 (1-2 weeks) — Optimisation ✅
Performance optimization, caching, SEO metadata, JSON-LD, QR component imports, lodash removal

### Remaining items
- DB indexes (requires Supabase migration)
- Code-splitting for QR components (optimisation, not blocking)
- Onboarding flow (UX enhancement, not blocking)
