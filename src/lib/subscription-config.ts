// /lib/subscription-config.ts
// Simplified config file - most data now comes from database

export type SubscriptionLevel = 0 | 1 | 2 | 3;

// Basic level mapping (for backward compatibility)
export const SUBSCRIPTION_LEVELS = {
  0: "Free",
  1: "Explorer",
  2: "Creator",
  3: "Champion",
} as const;

// Default quotas (fallback values if database is unavailable)
export const DEFAULT_QUOTA_FALLBACKS = {
  0: 3, // Free
  1: 10, // Explorer
  2: 50, // Creator
  3: 250, // Champion
} as const;

// Helper functions for working with subscription packages
export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  level: number;
  price_in_cents: number;
  quota_amount: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}

export interface QuotaPackage {
  id: string;
  name: string;
  quantity: number;
  price_in_cents: number;
  is_active: boolean;
  description?: string;
  stripe_price_id: string;
}

// Helper function to format price
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

// Helper function to get subscription level name
export function getSubscriptionLevelName(level: number): string {
  return (
    SUBSCRIPTION_LEVELS[level as keyof typeof SUBSCRIPTION_LEVELS] || "Unknown"
  );
}

// Helper function to calculate total quota
export function calculateTotalQuota(
  subscriptionQuota: number,
  boosterQuota: number = 0,
): number {
  return (subscriptionQuota || 0) + (boosterQuota || 0);
}

// Helper function to calculate usage percentage
export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}
