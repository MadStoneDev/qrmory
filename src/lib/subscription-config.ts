// /lib/subscription-config.ts
// Basic level mapping (for backward compatibility)
export const SUBSCRIPTION_LEVELS = {
  "0": "Free",
  "1": "Explorer",
  "2": "Creator",
  "3": "Champion",
} as const;

export function getSubscriptionLevelName(level: number | string): string {
  const levelStr = level.toString() as keyof typeof SUBSCRIPTION_LEVELS;
  return SUBSCRIPTION_LEVELS[levelStr] || "Unknown";
}

// Helper function to format price
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

// Helper function to calculate usage percentage
export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}
