// utils/quota-validation.ts
import { toast } from "sonner";

export interface QuotaInfo {
  currentCount: number;
  maxQuota: number;
  subscriptionLevel: string;
  subscriptionStatus: string;
}

export interface QuotaValidationResult {
  canProceed: boolean;
  reason?: string;
  shouldUpgrade?: boolean;
}

export function validateQuotaForDynamicQR(
  quotaInfo: QuotaInfo,
  isExistingDynamic = false,
): QuotaValidationResult {
  // If it's already dynamic and saved, don't check quota again
  if (isExistingDynamic) {
    return { canProceed: true };
  }

  // Check if quota is exceeded
  if (quotaInfo.currentCount >= quotaInfo.maxQuota) {
    return {
      canProceed: false,
      reason: `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes.`,
      shouldUpgrade: true,
    };
  }

  // Check if quota is nearly full (warn at 90%)
  const usagePercentage = (quotaInfo.currentCount / quotaInfo.maxQuota) * 100;
  if (usagePercentage >= 90) {
    toast("Nearly at quota limit", {
      description: `You have ${
        quotaInfo.maxQuota - quotaInfo.currentCount
      } dynamic QR codes remaining.`,
      duration: 5000,
    });
  }

  return { canProceed: true };
}

export function validateQuotaForSave(
  quotaInfo: QuotaInfo,
  isDynamic: boolean,
  isAlreadySaved = false,
): QuotaValidationResult {
  // Static QR codes don't count against quota
  if (!isDynamic) {
    return { canProceed: true };
  }

  // If already saved, don't check quota again
  if (isAlreadySaved) {
    return { canProceed: true };
  }

  return validateQuotaForDynamicQR(quotaInfo);
}

export function getQuotaUsagePercentage(quotaInfo: QuotaInfo): number {
  if (quotaInfo.maxQuota === 0) return 0;
  return Math.min(
    100,
    Math.round((quotaInfo.currentCount / quotaInfo.maxQuota) * 100),
  );
}

export function getRemainingQuota(quotaInfo: QuotaInfo): number {
  return Math.max(0, quotaInfo.maxQuota - quotaInfo.currentCount);
}

export function isNearQuotaLimit(
  quotaInfo: QuotaInfo,
  threshold = 80,
): boolean {
  const usagePercentage = getQuotaUsagePercentage(quotaInfo);
  return usagePercentage >= threshold;
}

export function isAtQuotaLimit(quotaInfo: QuotaInfo): boolean {
  return quotaInfo.currentCount >= quotaInfo.maxQuota;
}
