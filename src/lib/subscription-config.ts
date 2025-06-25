// /lib/subscription-config.ts
export type SubscriptionLevel = 0 | 1 | 2 | 3;

// Basic level mapping (for backward compatibility)
export const SUBSCRIPTION_LEVELS = {
  "0": "Free",
  "1": "Explorer",
  "2": "Creator",
  "3": "Champion",
} as const;

// Default quotas (fallback values if database is unavailable)
export const DEFAULT_QUOTAS = {
  0: 3, // Free
  1: 10, // Explorer
  2: 50, // Creator
  3: 250, // Champion
} as const;

export function getSubscriptionLevelName(level: number | string): string {
  const levelStr = level.toString() as keyof typeof SUBSCRIPTION_LEVELS;
  return SUBSCRIPTION_LEVELS[levelStr] || "Unknown";
}

// Helper function to format price
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
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
