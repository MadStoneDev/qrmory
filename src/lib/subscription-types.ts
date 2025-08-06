// lib/subscription-types.ts
export type SubscriptionLevel = 0 | 1 | 2 | 3;

export interface Profile {
  id: string;
  subscription_level: SubscriptionLevel | null;
  extra_quota_from_boosters: number | null;
  dynamic_qr_quota: number | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  queued_for_delete: string | null;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string | null;
  level: SubscriptionLevel;
  price_in_cents: number;
  quota_amount: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing";
  current_period_end: string;
  stripe_subscription_id: string;
  plan_name: string | null;
  subscription_type: "main" | "booster" | null;
  stripe_price_id: string | null;
}

// Type guards for runtime validation
export function isValidSubscriptionLevel(
  level: any,
): level is SubscriptionLevel {
  return typeof level === "number" && [0, 1, 2, 3].includes(level);
}

export function normalizeSubscriptionLevel(level: any): SubscriptionLevel {
  const numLevel = typeof level === "string" ? parseInt(level, 10) : level;
  return isValidSubscriptionLevel(numLevel) ? numLevel : 0;
}

// Updated subscription config with proper typing
export const SUBSCRIPTION_LEVELS: Record<SubscriptionLevel, string> = {
  0: "Free",
  1: "Explorer",
  2: "Creator",
  3: "Champion",
} as const;

export const DEFAULT_QUOTAS: Record<SubscriptionLevel, number> = {
  0: 3,
  1: 10,
  2: 50,
  3: 250,
} as const;

export function getSubscriptionLevelName(
  level: SubscriptionLevel | number | string | null,
): string {
  const normalizedLevel = normalizeSubscriptionLevel(level);
  return SUBSCRIPTION_LEVELS[normalizedLevel];
}

export function getDefaultQuota(
  level: SubscriptionLevel | number | string | null,
): number {
  const normalizedLevel = normalizeSubscriptionLevel(level);
  return DEFAULT_QUOTAS[normalizedLevel];
}

// Utility for quota calculations with proper typing
export interface QuotaCalculation {
  subscriptionQuota: number;
  boosterQuota: number;
  totalQuota: number;
  usagePercentage: number;
  remaining: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

export function calculateQuotaInfo(
  profile: Profile,
  usedQRs: number,
  subscriptionPackage?: SubscriptionPackage,
): QuotaCalculation {
  const subscriptionQuota =
    profile.dynamic_qr_quota ||
    subscriptionPackage?.quota_amount ||
    getDefaultQuota(profile.subscription_level);

  const boosterQuota = profile.extra_quota_from_boosters || 0;
  const totalQuota = subscriptionQuota + boosterQuota;
  const usagePercentage =
    totalQuota > 0
      ? Math.min(100, Math.round((usedQRs / totalQuota) * 100))
      : 0;
  const remaining = Math.max(0, totalQuota - usedQRs);

  return {
    subscriptionQuota,
    boosterQuota,
    totalQuota,
    usagePercentage,
    remaining,
    isNearLimit: usagePercentage >= 80,
    isAtLimit: usagePercentage >= 100,
  };
}
