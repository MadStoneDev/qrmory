# QRmory Implementation Plan

**Created:** 2026-01-25
**Status:** In Progress

---

## Phase 1: Critical Fixes & Optimizations (Current)

### 1.1 Fix Downgrade Quota Enforcement (CRITICAL)
- **File:** `src/utils/paddle/process-webhook.ts`
- **Issue:** When users downgrade plans, excess QR codes are not deactivated
- **Fix:** Added quota comparison and deactivation logic to `updateSubscriptionData()`
- **Status:** [x] COMPLETED

### 1.2 Add Webhook Idempotency
- **File:** `src/app/api/webhooks/paddle/route.ts`
- **Issue:** No deduplication of webhook events
- **Fix:** Added Redis-based event ID tracking with 24-hour TTL
- **Status:** [x] COMPLETED

### 1.3 Performance Optimizations

#### 1.3.1 React.memo for List Components
- **Files:**
  - `src/components/my-code-item.tsx`
  - `src/components/my-codes-list.tsx`
- **Fix:** Wrapped components in React.memo with custom comparison
- **Status:** [x] COMPLETED

#### 1.3.2 Code Splitting for QR Types
- **File:** `src/lib/qr-control-object-lazy.tsx` (new)
- **Issue:** All 17 QR type components were eagerly loaded
- **Fix:** Created lazy-loaded version using Next.js dynamic imports
- **Status:** [x] COMPLETED

#### 1.3.3 Virtual Scrolling for Analytics (Deferred)
- **Note:** Requires more significant refactoring, defer to Phase 1.5
- **Status:** [ ] Deferred

#### 1.3.4 SVG Cache Key Optimization (Deferred)
- **Note:** Already implemented with downloadCache, minor improvement
- **Status:** [ ] Deferred

### 1.4 UI/UX Improvements

#### 1.4.1 Skeleton Loading Screens
- **Files:**
  - `src/components/ui/skeleton.tsx` (already existed)
  - `src/components/ui/qr-code-skeleton.tsx` (new)
- **Fix:** Created QRCodeItemSkeleton and QRCodeListSkeleton components
- **Status:** [x] COMPLETED

#### 1.4.2 Improve Active/Inactive Badges
- **File:** `src/components/my-code-item.tsx`
- **Issue:** Color-only status indicators
- **Fix:** Added icons (IconCircleCheck/IconCircleX) and ARIA attributes
- **Status:** [x] COMPLETED

#### 1.4.3 Specific Error Guidance
- **Files:** Various components with generic error messages
- **Fix:** Replace "Try again" with actionable guidance
- **Status:** [ ] Pending (minor, non-blocking)

#### 1.4.4 Edit History/Undo (Deferred)
- **Note:** Complex feature, defer to Phase 1.5
- **Status:** [ ] Deferred

#### 1.4.5 Split QRCreator (Deferred)
- **Note:** Already reasonably structured with QRSettings and QRPreview
- **Status:** [ ] Deferred

### 1.5 Code Quality Fixes

#### 1.5.1 TypeScript `any` Types
- **Files:** `my-code-item.tsx`, `my-codes-list.tsx`
- **Fix:** Added proper type definitions for QRCode, User, QRCodeContent
- **Status:** [x] COMPLETED (partial - main components)

#### 1.5.2 Add Retry Logic for Failed API Calls
- **File:** `src/utils/api-retry.ts` (new)
- **Fix:** Created withRetry, fetchWithRetry, postJsonWithRetry utilities
- **Status:** [x] COMPLETED

#### 1.5.3 ARIA Live Regions
- **Files:** `src/components/my-code-item.tsx`
- **Fix:** Added role="status" and aria-live="polite" to status badges
- **Status:** [x] COMPLETED (partial)

#### 1.5.4 Consistent Error Handling
- **Files:** API routes and components
- **Status:** [ ] Pending (minor, non-blocking)

### 1.6 Notification System
- **File:** `src/lib/email/send-email.ts`
- **Status:** [x] COMPLETED
- **Existing emails:**
  - Subscription Canceled
  - Codes Deactivated
  - Quota Warning
  - Subscription Confirmed
  - Payment Failed
  - **NEW: Subscription Downgraded**

---

## Phase 2: Batch Pricing Clarification

### Current Pricing (Confirmed from user)
| Tier | Name | Price (AUD) | Dynamic QR Quota |
|------|------|-------------|------------------|
| 0 | Free | $0 | 3 |
| 1 | Explorer | $5.99/mo | TBD |
| 2 | Creator | $12.99/mo | TBD |
| 3 | Champion | $39.99/mo | TBD |

### Batch Feature Pricing
- Uses same subscription tiers
- Batch limits scale with tier:
  - Explorer: 10 codes per batch
  - Creator: 25 codes per batch
  - Champion: 50 codes per batch
- All batch codes count against dynamic QR quota
- No separate batch pricing needed

---

## Phase 3: New QR Code Types - COMPLETED

### High Priority - COMPLETED
- [x] Phone/Tel (`tel:+61...`) - `src/components/qr-phone.tsx`
- [x] WhatsApp (`https://wa.me/...`) - `src/components/qr-whatsapp.tsx`
- [x] LinkedIn (profile/company) - `src/components/qr-linkedin.tsx`
- [x] TikTok (profile) - `src/components/qr-tiktok.tsx`
- [x] Telegram (user/group/channel) - `src/components/qr-telegram.tsx`
- [x] Discord (server invite) - `src/components/qr-discord.tsx`

### Medium Priority - COMPLETED
- [x] App Store Links - `src/components/qr-appstore.tsx`
  - Option 1: Direct to iOS App Store
  - Option 2: Direct to Google Play
  - Option 3: Landing page with both options - `src/app/(public)/app/[code]/page.tsx`

### Premium QR Types - COMPLETED (Phase 4)
- [x] Video - `src/components/qr-video.tsx`
  - Uploads to Cloudflare R2 (free egress)
  - Video player landing page - `src/app/(public)/video/[code]/page.tsx`
  - Creator tier and above only
- [x] PDF Document - `src/components/qr-pdf.tsx`
  - Uploads to Cloudflare R2
  - PDF viewer landing page - `src/app/(public)/pdf/[code]/page.tsx`
  - Explorer tier and above

---

## Phase 4: Cloudflare R2 Storage Integration - COMPLETED

### Storage Quota System - IMPLEMENTED
| Tier | Total Storage | Video Per-File | PDF Per-File |
|------|---------------|----------------|--------------|
| Free | 50MB | N/A | N/A |
| Explorer | 500MB | N/A | 10MB |
| Creator | 2GB | 100MB | 25MB |
| Champion | 10GB | 500MB | 50MB |

### Files Created
- [x] `src/lib/r2-storage.ts` - R2 client, upload/delete/list functions
- [x] `src/app/api/upload/route.ts` - Server-side upload API with quota validation
- [x] `src/components/qr-video.tsx` - Video QR component
- [x] `src/components/qr-pdf.tsx` - PDF QR component
- [x] `src/app/(public)/video/[code]/page.tsx` - Video player landing page
- [x] `src/app/(public)/pdf/[code]/page.tsx` - PDF viewer landing page

### Files Modified
- [x] `src/lib/file-upload-limits.ts` - Added PDF file type support
- [x] `src/lib/storage-tracking.ts` - Added R2 storage to combined tracking
- [x] `src/lib/qr-control-object.tsx` - Added Video and PDF entries
- [x] `src/lib/qr-control-object-lazy.tsx` - Added lazy Video and PDF entries

### R2 Configuration Required
Add these environment variables to your `.env.local` and production environment:
```
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=qrmory-media
R2_PUBLIC_URL=https://your-custom-domain.com (optional)
```

---

## Files Modified Tracker

### Phase 1 - COMPLETED
- [x] `src/utils/paddle/process-webhook.ts` - Downgrade fix + helper method
- [x] `src/app/api/webhooks/paddle/route.ts` - Idempotency with Redis
- [x] `src/components/my-code-item.tsx` - React.memo, badges, types, ARIA
- [x] `src/components/my-codes-list.tsx` - React.memo, types, empty state
- [x] `src/lib/qr-control-object-lazy.tsx` - NEW: Lazy-loaded QR components
- [x] `src/components/qr-create/qr-settings.tsx` - Use lazy QR controls
- [x] `src/components/ui/qr-code-skeleton.tsx` - NEW: Skeleton components
- [x] `src/lib/email/send-email.ts` - Downgrade email template
- [x] `src/utils/api-retry.ts` - NEW: Retry utilities

### Phase 3 - New QR Types - COMPLETED
- [x] `src/components/qr-phone.tsx` - Phone/Tel QR
- [x] `src/components/qr-whatsapp.tsx` - WhatsApp QR
- [x] `src/components/qr-linkedin.tsx` - LinkedIn QR
- [x] `src/components/qr-tiktok.tsx` - TikTok QR
- [x] `src/components/qr-telegram.tsx` - Telegram QR
- [x] `src/components/qr-discord.tsx` - Discord QR
- [x] `src/components/qr-appstore.tsx` - App Store QR
- [x] `src/app/(public)/app/[code]/page.tsx` - App download landing page

### Phase 4 - R2 Storage & Video/PDF - COMPLETED
- [x] `src/lib/r2-storage.ts` - NEW: Cloudflare R2 storage utility
- [x] `src/app/api/upload/route.ts` - NEW: Server-side upload API
- [x] `src/components/qr-video.tsx` - NEW: Video QR component
- [x] `src/components/qr-pdf.tsx` - NEW: PDF QR component
- [x] `src/app/(public)/video/[code]/page.tsx` - NEW: Video player landing
- [x] `src/app/(public)/pdf/[code]/page.tsx` - NEW: PDF viewer landing
- [x] `src/lib/file-upload-limits.ts` - Added PDF file type
- [x] `src/lib/storage-tracking.ts` - Combined R2 + Supabase tracking
- [x] `src/lib/qr-control-object.tsx` - Added Video and PDF
- [x] `src/lib/qr-control-object-lazy.tsx` - Added lazy Video and PDF

---

## Notes

- Resend API is already configured, just needs API key
- Email templates already exist and are well-designed
- QRCreator is already modular with QRSettings and QRPreview
- Batch QR feature already implemented with proper subscription gating
